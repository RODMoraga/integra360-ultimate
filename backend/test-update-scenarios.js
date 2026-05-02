/**
 * Live test: simulates all update scenarios to find which one errors.
 * Mirrors the exact logic used by the service (no HTTP).
 */
const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

const companyId = BigInt(2);

async function getAll() {
  return prisma.units_of_measure.findMany({
    where: { deleted_at: null, company_id: companyId },
    orderBy: [{ unit_type: 'asc' }, { id: 'asc' }],
    select: { id: true, code: true, name: true, unit_type: true, is_base_unit: true }
  });
}

async function tryUpdate(id, data, label) {
  try {
    const result = await prisma.units_of_measure.update({
      where: { id },
      data: { ...data, updated_at: new Date() }
    });
    console.log(`  ✅ ${label} → OK (is_base_unit=${result.is_base_unit})`);
    return result;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      console.log(`  ❌ ${label} → Prisma P${err.code}: ${err.message.split('\n')[0]}`);
    } else {
      console.log(`  ❌ ${label} → ${err.constructor.name}: ${err.message.split('\n')[0]}`);
    }
    return null;
  }
}

async function main() {
  const now = new Date();

  // Clean up any leftovers
  await prisma.units_of_measure.deleteMany({
    where: { code: { in: ['TEST_BASE1', 'TEST_NONBASE1', 'TEST_NONBASE2'] } }
  });

  // Setup: create test records
  const base1 = await prisma.units_of_measure.create({
    data: { company_id: companyId, code: 'TEST_BASE1', name: 'Base 1', symbol: 'B1', unit_type: 'TEST_TYPE', is_base_unit: true, created_at: now, updated_at: now }
  });
  const non1 = await prisma.units_of_measure.create({
    data: { company_id: companyId, code: 'TEST_NONBASE1', name: 'NonBase 1', symbol: 'NB1', unit_type: 'TEST_TYPE', is_base_unit: false, created_at: now, updated_at: now }
  });
  const non2 = await prisma.units_of_measure.create({
    data: { company_id: companyId, code: 'TEST_NONBASE2', name: 'NonBase 2', symbol: 'NB2', unit_type: 'TEST_TYPE', is_base_unit: false, created_at: now, updated_at: now }
  });

  console.log(`\nSetup: base1.id=${base1.id}, non1.id=${non1.id}, non2.id=${non2.id}\n`);
  console.log('--- SCENARIO TESTS ---');

  // S1: Update base unit's name only (no change to is_base_unit)
  console.log('\n[S1] Update base unit name (is_base_unit remains true):');
  await tryUpdate(base1.id, { name: 'Base 1 Updated' }, 'name change on base unit');

  // S2: Update base unit with is_base_unit=true explicitly passed
  console.log('\n[S2] Update base unit with is_base_unit=true (same value):');
  await tryUpdate(base1.id, { is_base_unit: true }, 'explicit is_base_unit=true on already-base');

  // S3: Update base unit with is_base_unit=false (demote)
  console.log('\n[S3] Demote base unit to is_base_unit=false:');
  const demoted = await tryUpdate(base1.id, { is_base_unit: false }, 'demote base to non-base');

  // S4: Promote non-base to base (now that base1 is demoted)
  if (demoted) {
    console.log('\n[S4] Promote non1 to base (no active base should exist now):');
    await tryUpdate(non1.id, { is_base_unit: true }, 'promote non-base to base');
  }

  // Restore base1 as base for conflict test
  await prisma.units_of_measure.update({ where: { id: base1.id }, data: { is_base_unit: true, updated_at: new Date() } });
  await prisma.units_of_measure.update({ where: { id: non1.id }, data: { is_base_unit: false, updated_at: new Date() } });

  // S5: Try to set non1 as base when base1 is already base (expect failure)
  console.log('\n[S5] Try to make non-base unit the base when base already exists (expect constraint error):');
  await tryUpdate(non1.id, { is_base_unit: true }, 'promote non-base when base exists');

  // S6: Update non-base unit's name (no is_base_unit change)
  console.log('\n[S6] Update non-base unit name (should always work):');
  await tryUpdate(non2.id, { name: 'NonBase 2 Updated' }, 'name change on non-base');

  // S7: Update base unit's symbol
  console.log('\n[S7] Update base unit symbol (is_base_unit implicitly stays true):');
  await tryUpdate(base1.id, { symbol: 'B1_NEW' }, 'symbol change on base unit');

  // Final state
  console.log('\n--- FINAL STATE ---');
  const rows = await getAll();
  const testRows = rows.filter(r => r.code.startsWith('TEST_'));
  for (const r of testRows) {
    console.log(`  id=${r.id} code=${r.code} is_base=${r.is_base_unit}`);
  }

  // Cleanup
  await prisma.units_of_measure.deleteMany({
    where: { code: { in: ['TEST_BASE1', 'TEST_NONBASE1', 'TEST_NONBASE2'] } }
  });
  console.log('\nCleaned up test records.');

  await prisma.$disconnect();
}

main().catch(e => { console.error('Fatal:', e.message); prisma.$disconnect(); process.exit(1); });
