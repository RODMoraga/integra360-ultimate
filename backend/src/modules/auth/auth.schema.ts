import { z } from "zod";

/**
 * Common schema for parsing company identifier from request payload.
 */
const companyIdSchema = z.coerce.number().int().positive().default(2).transform((value) => BigInt(value));

/**
 * Validation contract for user registration requests.
 */
export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(3).max(120),
    email: z.string().email(),
    password: z.string().min(8).max(64),
    companyId: companyIdSchema
  })
});

/**
 * Validation contract for login requests.
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(64),
    companyId: companyIdSchema
  })
});