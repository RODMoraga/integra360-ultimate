import pino from "pino";
import { env } from "./env";

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