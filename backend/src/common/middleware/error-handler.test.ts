import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { AppError } from "../errors/app-error";
import { errorHandler } from "./error-handler";

describe("errorHandler", () => {
  it("returns AppError responses", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;

    errorHandler(
      new AppError("Controlled failure", 409, { field: "unit_type" }),
      {} as Request,
      res,
      vi.fn() as NextFunction
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Controlled failure",
      details: { field: "unit_type" }
    });
  });

  it("returns structurally compatible AppError-like responses", () => {
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as unknown as Response;

    const foreignAppError = Object.assign(new Error("Reloaded failure"), {
      name: "AppError",
      statusCode: 409,
      details: { field: "unit_type" }
    });

    errorHandler(
      foreignAppError,
      {} as Request,
      res,
      vi.fn() as NextFunction
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "Reloaded failure",
      details: { field: "unit_type" }
    });
  });
});