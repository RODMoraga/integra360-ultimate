import fs from "node:fs";
import path from "node:path";

const viewsRoot = path.resolve("src", "views");

function getVueFiles(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...getVueFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".vue")) {
      files.push(fullPath);
    }
  }

  return files;
}

function getLineNumber(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

if (!fs.existsSync(viewsRoot)) {
  console.error(`[check:table-actions] No existe el directorio: ${viewsRoot}`);
  process.exit(1);
}

const files = getVueFiles(viewsRoot);
const findings = [];

const actionTriadRegex = /btn-outline-info[\s\S]{0,6000}btn-outline-warning[\s\S]{0,6000}btn-outline-danger/g;

function isActionTriad(segment) {
  const hasView = /title=\"Ver|data-action=\"view/.test(segment);
  const hasEdit = /title=\"Editar|data-action=\"edit/.test(segment);
  const hasDelete = /title=\"Eliminar|data-action=\"delete|Eliminar/.test(segment);
  return hasView && hasEdit && hasDelete;
}

function hasCanonicalButtonClasses(segment) {
  const hasViewClass = /class=\"btn btn-sm btn-outline-info\"/.test(segment);
  const hasEditClass = /class=\"btn btn-sm btn-outline-warning\"/.test(segment);
  const hasDeleteClass = /class=\"btn btn-sm btn-outline-danger\"/.test(segment);
  return hasViewClass && hasEditClass && hasDeleteClass;
}

function buttonHasRequiredA11yAttrs(buttonTag) {
  const hasTitle = /(?:^|\s):?title=\"[^\"]+\"/.test(buttonTag);
  const hasAriaLabel = /(?:^|\s):?aria-label=\"[^\"]+\"/.test(buttonTag);
  return hasTitle && hasAriaLabel;
}

for (const filePath of files) {
  const content = fs.readFileSync(filePath, "utf8");

  for (const match of content.matchAll(actionTriadRegex)) {
    const index = match.index ?? 0;
    const segment = match[0] ?? "";

    if (!isActionTriad(segment)) {
      continue;
    }

    const windowStart = Math.max(0, index - 280);
    const windowEnd = Math.min(content.length, index + segment.length + 80);
    const windowContent = content.slice(windowStart, windowEnd);

    if (!windowContent.includes("btn-group")) {
      findings.push({
        filePath,
        line: getLineNumber(content, index),
        reason: "Bloque de acciones Ver/Editar/Eliminar sin contenedor btn-group."
      });
      continue;
    }

    if (windowContent.includes('class="d-flex gap-1 justify-content-center"')) {
      findings.push({
        filePath,
        line: getLineNumber(content, index),
        reason: "Contenedor legado detectado (d-flex gap-1 justify-content-center)."
      });
    }

    if (!hasCanonicalButtonClasses(windowContent)) {
      findings.push({
        filePath,
        line: getLineNumber(content, index),
        reason: "Clases de botones no estandarizadas. Use btn btn-sm btn-outline-{info|warning|danger}."
      });
    }

  }

  const actionButtonRegex = /<button[\s\S]*?class=\"btn btn-sm btn-outline-(info|warning|danger)\"[\s\S]*?<\/button>/g;
  for (const actionButton of content.matchAll(actionButtonRegex)) {
    const buttonTag = actionButton[0] ?? "";
    const variant = actionButton[1] ?? "";

    if (buttonHasRequiredA11yAttrs(buttonTag)) {
      continue;
    }

    const actionLabelMap = {
      info: "Ver",
      warning: "Editar",
      danger: "Eliminar"
    };

    findings.push({
      filePath,
      line: getLineNumber(content, actionButton.index ?? 0),
      reason: `Boton ${actionLabelMap[variant] ?? variant} sin title/aria-label.`
    });
  }
}

if (findings.length > 0) {
  console.error("\n[check:table-actions] Se encontraron acciones de tabla no estandarizadas:\n");
  for (const finding of findings) {
    const relativePath = path.relative(process.cwd(), finding.filePath).replace(/\\\\/g, "/");
    console.error(`- ${relativePath}:${finding.line} -> ${finding.reason}`);
  }
  console.error("\nCorrige los contenedores de acciones a: <div class=\"btn-group\" role=\"group\" aria-label=\"Acciones de fila\">...");
  process.exit(1);
}

console.log("[check:table-actions] OK. Todas las acciones de tabla Ver/Editar/Eliminar usan contenedor agrupado.");
