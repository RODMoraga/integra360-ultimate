import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  const text = String(value);
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

async function run() {
  const prismaDir = path.resolve('prisma');
  const files = await fs.readdir(prismaDir);
  const reportFiles = files
    .filter((name) => /^audit-report-missing-document-movements-company-\d+-\d{8}\.json$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (reportFiles.length === 0) {
    throw new Error('No se encontraron reportes segmentados por company_id en prisma/.');
  }

  const companies = await prisma.companies.findMany({
    select: { id: true, code: true, legal_name: true },
    orderBy: { id: 'asc' }
  });
  const companyMap = new Map(companies.map((c) => [c.id.toString(), c]));

  const rows = [];

  for (const fileName of reportFiles) {
    const fullPath = path.join(prismaDir, fileName);
    const raw = await fs.readFile(fullPath, 'utf8');
    const parsed = JSON.parse(raw);

    const match = fileName.match(/^audit-report-missing-document-movements-company-(\d+)-(\d{8})\.json$/);
    if (!match) continue;

    const companyId = match[1];
    const dateTag = match[2];
    const remediationFile = `remediation-batch-missing-document-movements-company-${companyId}-${dateTag}.sql`;
    const company = companyMap.get(companyId);

    rows.push({
      date_tag: dateTag,
      company_id: companyId,
      company_code: company?.code ?? '',
      company_name: company?.legal_name ?? '',
      affected_documents_count: Number(parsed.affected_documents_count ?? 0),
      remediable_rows_count: Number(parsed.remediable_rows_count ?? 0),
      scope: parsed.scope ?? '',
      generated_at_utc: parsed.generated_at_utc ?? '',
      report_file: `prisma/${fileName}`,
      remediation_file: `prisma/${remediationFile}`
    });
  }

  const header = [
    'date_tag',
    'company_id',
    'company_code',
    'company_name',
    'affected_documents_count',
    'remediable_rows_count',
    'scope',
    'generated_at_utc',
    'report_file',
    'remediation_file'
  ];

  const lines = [
    header.join(','),
    ...rows.map((r) => [
      r.date_tag,
      r.company_id,
      r.company_code,
      r.company_name,
      r.affected_documents_count,
      r.remediable_rows_count,
      r.scope,
      r.generated_at_utc,
      r.report_file,
      r.remediation_file
    ].map(escapeCsv).join(','))
  ];

  const outputPath = path.join(prismaDir, `audit-report-missing-document-movements-consolidated-${rows[0]?.date_tag ?? 'latest'}.csv`);
  await fs.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');

  console.log(`Consolidated CSV generated: ${outputPath}`);
  console.log(`Rows: ${rows.length}`);
}

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
