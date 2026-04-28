import dotenv from "dotenv";
import { z } from "zod";

/**
 * Loads environment variables from `.env` before schema parsing.
 */
dotenv.config();

/**
 * Runtime environment contract validated at bootstrap time.
 */
const envSchema = z.object({
  // ── Entorno ──────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // ── Servidor HTTP ─────────────────────────────────────────────────────────
  PORT: z.coerce.number().int().positive().default(3000),
  API_PREFIX: z.string().default("/api"),
  API_VERSION: z.string().default("v1"),

  // ── Base de datos ─────────────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_SIZE: z.coerce.number().int().positive().default(10),
  DATABASE_CONNECTION_TIMEOUT: z.coerce.number().int().positive().default(30000),

  // ── JWT ───────────────────────────────────────────────────────────────────
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("1d"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // ── CORS ──────────────────────────────────────────────────────────────────
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),

  // ── Rate limiting ─────────────────────────────────────────────────────────
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),

  // ── Localización ─────────────────────────────────────────────────────────
  TZ: z.string().default("America/Santiago"),
  APP_LOCALE: z.string().default("es-CL"),
  APP_CURRENCY: z.string().length(3).default("CLP"),
  APP_DECIMAL_SEPARATOR: z.string().default(","),
  APP_THOUSANDS_SEPARATOR: z.string().default("."),
  APP_DATE_FORMAT: z.string().default("DD/MM/YYYY"),

  // ── Logging ───────────────────────────────────────────────────────────────
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("debug"),
  LOG_FORMAT: z.enum(["pretty", "json"]).default("pretty"),

  // ── Archivos ──────────────────────────────────────────────────────────────
  UPLOAD_MAX_SIZE: z.string().default("5mb"),
  UPLOAD_DIR: z.string().default("./uploads")
});

/**
 * Parsed and validated environment values.
 */
export const env = envSchema.parse(process.env);

/**
 * Type helper inferred from `envSchema`.
 */
export type Env = z.infer<typeof envSchema>;