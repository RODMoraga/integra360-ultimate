import cors from "cors";
import express from "express";
import helmet from "helmet";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { apiRoutes } from "./routes";
import { notFoundHandler } from "./common/middleware/not-found";
import { errorHandler } from "./common/middleware/error-handler";

/**
 * Builds and configures the Express application instance.
 */
export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true
    })
  );
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      limit: env.RATE_LIMIT_MAX,
      standardHeaders: true
    })
  );
  app.use(express.json({ limit: env.UPLOAD_MAX_SIZE }));
  app.use(pinoHttp({ logger }));

  app.use("/api", apiRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};