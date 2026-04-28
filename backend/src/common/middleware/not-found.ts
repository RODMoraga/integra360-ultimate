import { Request, Response } from "express";

/**
 * Terminal middleware for unknown routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
};