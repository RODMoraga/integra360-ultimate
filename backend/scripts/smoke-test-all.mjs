/**
 * Global Smoke Runner (backend)
 *
 * Runs all smoke tests in one pass:
 * - documents
 * - inventory
 * - inventory-movements
 * - cash-registers
 * - sales
 *
 * Usage:
 *   node scripts/smoke-test-all.mjs
 *   node scripts/smoke-test-all.mjs http://localhost:3001/api
 */

import { spawnSync } from "node:child_process";

const BASE_URL = process.argv[2];

function runStep(title, command, args) {
  console.log("\n==============================================");
  console.log(`STEP: ${title}`);
  console.log(`CMD : ${command} ${args.join(" ")}`);
  console.log("==============================================\n");

  const executable = process.platform === "win32" && command === "npm"
    ? "npm.cmd"
    : command;

  const result = spawnSync(executable, args, {
    stdio: "inherit",
    shell: false,
    env: process.env
  });

  if (result.status !== 0) {
    console.error(`\n[ERROR] Step failed: ${title}`);
    process.exitCode = result.status ?? 1;
    process.exit(process.exitCode);
  }
}

function smokeArgs(scriptName) {
  if (!BASE_URL) return [scriptName];
  return [scriptName, BASE_URL];
}

function run() {
  console.log("==============================================");
  console.log("Global Smoke Runner - Integra360 Backend");
  console.log(`Target: ${BASE_URL ?? "http://localhost:3000/api"}`);
  console.log("==============================================");

  // Seed data to make smoke tests reproducible.
  runStep("Seed documents", "npm", ["run", "prisma:seed:documents"]);
  runStep("Seed inventory", "npm", ["run", "prisma:seed:inventory"]);
  runStep("Seed cash-registers", "npm", ["run", "prisma:seed:cash-registers"]);
  runStep("Seed document-sequences", "npm", ["run", "prisma:seed:document-sequences"]);

  // Execute smoke tests.
  runStep("Smoke documents", "node", smokeArgs("scripts/smoke-test-documents.mjs"));
  runStep("Smoke inventory", "node", smokeArgs("scripts/smoke-test-inventory.mjs"));
  runStep("Smoke inventory-movements", "node", smokeArgs("scripts/smoke-test-inventory-movements.mjs"));
  runStep("Smoke cash-registers", "node", smokeArgs("scripts/smoke-test-cash-registers.mjs"));
  runStep("Smoke sales", "node", smokeArgs("scripts/smoke-test-sales.mjs"));

  console.log("\n==============================================");
  console.log("Global smoke run completed successfully");
  console.log("==============================================\n");
}

run();
