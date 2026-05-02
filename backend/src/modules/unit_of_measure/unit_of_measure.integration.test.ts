import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../app";
import { env } from "../../config/env";
import { unitOfMeasureService } from "./unit_of_measure.service";

describe("UnitOfMeasure endpoints integration", () => {
  let server: Server;
  let baseUrl = "";
  let authHeader = "";

  beforeEach(async () => {
    const app = createApp();

    await new Promise<void>((resolve) => {
      server = app.listen(0, () => resolve());
    });

    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;

    const token = jwt.sign(
      {
        id: 1,
        email: "integration.test@integra360.local",
        companyId: 2
      },
      env.JWT_SECRET
    );

    authHeader = `Bearer ${token}`;
  });

  afterEach(async () => {
    vi.restoreAllMocks();

    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });

  it("POST /api/units-of-measure parses is_base_unit=1 as true", async () => {
    const createSpy = vi
      .spyOn(unitOfMeasureService, "create")
      .mockResolvedValue({
        id: "101",
        company_id: "2",
        code: "KG",
        name: "Kilogramo",
        symbol: "kg",
        unit_type: "Peso",
        is_base_unit: true,
        created_at: "2026-05-02T00:00:00.000Z",
        updated_at: "2026-05-02T00:00:00.000Z"
      });

    const response = await fetch(`${baseUrl}/api/units-of-measure`, {
      method: "POST",
      headers: {
        authorization: authHeader,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        code: "KG",
        name: "Kilogramo",
        symbol: "kg",
        unit_type: "Peso",
        is_base_unit: 1
      })
    });

    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy.mock.calls[0][1]).toMatchObject({ is_base_unit: true });
    expect(payload.is_base_unit).toBe(true);
  });

  it("PUT /api/units-of-measure/:id parses is_base_unit=1 as true", async () => {
    const updateSpy = vi
      .spyOn(unitOfMeasureService, "update")
      .mockResolvedValue({
        id: "101",
        company_id: "2",
        code: "KG",
        name: "Kilogramo",
        symbol: "kg",
        unit_type: "Peso",
        is_base_unit: true,
        created_at: "2026-05-02T00:00:00.000Z",
        updated_at: "2026-05-02T00:00:00.000Z"
      });

    const response = await fetch(`${baseUrl}/api/units-of-measure/101`, {
      method: "PUT",
      headers: {
        authorization: authHeader,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        name: "Kilogramo",
        symbol: "kg",
        unit_type: "Peso",
        is_base_unit: 1
      })
    });

    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy.mock.calls[0][2]).toMatchObject({ is_base_unit: true });
    expect(payload.is_base_unit).toBe(true);
  });
});
