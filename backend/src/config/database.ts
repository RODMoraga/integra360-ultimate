import { PrismaClient } from "@prisma/client";

/**
 * Shared Prisma client instance used by repositories.
 */
export const prisma = new PrismaClient();