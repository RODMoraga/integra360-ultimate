/**
 * Inventory Movements Smoke - Preflight
 *
 * Fast checks before running the full smoke flow:
 * - API health endpoint is reachable
 * - inventory-movements route exists (must not return 404)
 *
 * Usage:
 *   node scripts/smoke-preflight-inventory-movements.mjs
 *   node scripts/smoke-preflight-inventory-movements.mjs http://localhost:3000/api
 */

const BASE_URL = process.argv[2] ?? "http://localhost:3000/api";

function printResult(ok, label, detail = "") {
  const status = ok ? "PASS" : "FAIL";
  const suffix = detail ? ` (${detail})` : "";
  const stream = ok ? console.log : console.error;
  stream(`  [${status}] ${label}${suffix}`);
}

async function fetchStatus(path) {
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    return response.status;
  } catch {
    return null;
  }
}

async function run() {
  console.log("==============================================");
  console.log("Inventory Movements Preflight");
  console.log(`Target: ${BASE_URL}`);
  console.log("==============================================\n");

  const healthStatus = await fetchStatus("/health");
  const healthOk = healthStatus === 200;
  printResult(healthOk, "GET /health", `status=${healthStatus ?? "unreachable"}`);

  const routeStatus = await fetchStatus("/inventory-movements");
  const routeExists = routeStatus !== null && routeStatus !== 404;
  printResult(routeExists, "GET /inventory-movements route existence", `status=${routeStatus ?? "unreachable"}`);

  if (!healthOk || !routeExists) {
    console.error("\nPreflight failed. Aborting smoke early.");
    process.exitCode = 1;
    return;
  }

  console.log("\nPreflight passed. You can run the full smoke now.");
}

run().catch((error) => {
  console.error("Unhandled preflight error:", error);
  process.exitCode = 1;
});
