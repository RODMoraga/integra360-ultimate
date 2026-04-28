import pino from "pino";
import { env } from "./env";

/**
 * Shared pino logger configured by environment log format and level.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.LOG_FORMAT === "pretty"
      ? {
          target: "pino-pretty",
          options: { colorize: true }
        }
      : undefined
});