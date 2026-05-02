const palette = {
  "ink-black-50": "#e8ebfd",
  "ink-black-100": "#d1d7fa",
  "ink-black-200": "#a2aff6",
  "ink-black-300": "#7487f1",
  "ink-black-400": "#455eed",
  "ink-black-500": "#1736e8",
  "ink-black-600": "#122bba",
  "ink-black-700": "#0e218b",
  "ink-black-800": "#09165d",
  "ink-black-900": "#050b2e",
  "ink-black-950": "#030820",
  "brick-ember-300": "#ff6666",
  "amber-flame-400": "#ffc533"
};

const checks = [
  {
    area: "Sidebar",
    context: "Texto principal sobre fondo",
    fg: "ink-black-200",
    bg: "ink-black-950",
    min: 4.5
  },
  {
    area: "Sidebar",
    context: "Texto secundario sobre fondo",
    fg: "ink-black-300",
    bg: "ink-black-950",
    min: 4.5
  },
  {
    area: "Sidebar",
    context: "Texto destacado sobre fondo",
    fg: "ink-black-100",
    bg: "ink-black-950",
    min: 4.5
  },
  {
    area: "Sidebar",
    context: "Acento marca sobre fondo",
    fg: "brick-ember-300",
    bg: "ink-black-950",
    min: 3
  },
  {
    area: "DashFooter",
    context: "Texto base sobre fondo",
    fg: "ink-black-200",
    bg: "ink-black-950",
    min: 4.5
  },
  {
    area: "DashFooter",
    context: "Texto secundario sobre fondo",
    fg: "ink-black-300",
    bg: "ink-black-950",
    min: 4.5
  },
  {
    area: "DashFooter",
    context: "Texto destacado sobre fondo",
    fg: "ink-black-100",
    bg: "ink-black-950",
    min: 4.5
  },
  {
    area: "Footer",
    context: "Texto base sobre fondo",
    fg: "ink-black-200",
    bg: "ink-black-900",
    min: 4.5
  },
  {
    area: "Footer",
    context: "Texto destacado sobre fondo",
    fg: "ink-black-100",
    bg: "ink-black-900",
    min: 4.5
  },
  {
    area: "Footer",
    context: "Icono hover acento",
    fg: "amber-flame-400",
    bg: "ink-black-900",
    min: 3
  }
];

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((ch) => ch + ch).join("")
    : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16)
  };
}

function toLinear(channel) {
  const srgb = channel / 255;
  return srgb <= 0.03928
    ? srgb / 12.92
    : ((srgb + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rl = toLinear(r);
  const gl = toLinear(g);
  const bl = toLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(foreground, background) {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const findings = checks.map((check) => {
  const fgHex = palette[check.fg];
  const bgHex = palette[check.bg];

  if (!fgHex || !bgHex) {
    return {
      ...check,
      ratio: null,
      pass: false,
      error: "Token de color no encontrado en paleta"
    };
  }

  const ratio = contrastRatio(fgHex, bgHex);
  return {
    ...check,
    ratio,
    pass: ratio >= check.min,
    error: null
  };
});

const failed = findings.filter((item) => !item.pass);

console.log("\n[check:contrast:chrome] Verificacion Sidebar/Footer\n");
for (const item of findings) {
  if (item.error) {
    console.log(`- FAIL | ${item.area} | ${item.context} | ${item.fg}/${item.bg} | ${item.error}`);
    continue;
  }

  const status = item.pass ? "PASS" : "FAIL";
  console.log(`- ${status} | ${item.area} | ${item.context} | ${item.fg}/${item.bg} | contraste ${item.ratio.toFixed(2)} (min ${item.min})`);
}

if (failed.length > 0) {
  console.error("\n[check:contrast:chrome] Hay combinaciones por debajo del umbral de contraste.\n");
  process.exit(1);
}

console.log("\n[check:contrast:chrome] OK. Sidebar/Footer cumplen contraste objetivo.\n");
