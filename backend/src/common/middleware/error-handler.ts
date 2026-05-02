import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { logger } from "../../config/logger";

type AppErrorLike = {
  message: string;
  statusCode: number;
  details?: unknown;
};

const isAppErrorLike = (err: unknown): err is AppErrorLike => {
  if (!(err instanceof Error) && (typeof err !== "object" || err === null)) {
    return false;
  }

  const candidate = err as Partial<AppErrorLike> & { name?: unknown };
  return (
    typeof candidate.message === "string" &&
    typeof candidate.statusCode === "number" &&
    Number.isInteger(candidate.statusCode) &&
    candidate.statusCode >= 400 &&
    candidate.statusCode < 600 &&
    (candidate.name === undefined || candidate.name === "AppError")
  );
};

/**
 * Global Express error middleware.
 * Handles controlled `AppError` responses and logs unexpected failures.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError || isAppErrorLike(err)) {
    res.status(err.statusCode).json({
      message: err.message,
      details: err.details
    });
    return;
  }

  logger.error({ err }, "Unexpected error");
  res.status(500).json({ message: "Internal server error" });
};