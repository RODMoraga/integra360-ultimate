import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { logger } from "../../config/logger";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      message: err.message,
      details: err.details
    });
    return;
  }

  logger.error({ err }, "Unexpected error");
  res.status(500).json({ message: "Internal server error" });
};