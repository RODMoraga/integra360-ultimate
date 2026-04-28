import { PrismaClient } from "@prisma/client";
import { env } from "./env";
import { logger } from "./logger";

/**
 * Shared Prisma client instance used by repositories.
 */
export const prisma = new PrismaClient();

let isDatabaseInitialized = false;

export const initializeDatabase = async () => {
	if (isDatabaseInitialized) {
		return;
	}

	await prisma.$connect();
	await prisma.$executeRaw`SET time_zone = ${env.DB_SESSION_TIME_ZONE}`;

	const status = await prisma.$queryRaw<Array<{
		now_local: Date;
		now_utc: Date;
		session_tz: string;
		global_tz: string;
	}>>`SELECT NOW() AS now_local, UTC_TIMESTAMP() AS now_utc, @@session.time_zone AS session_tz, @@global.time_zone AS global_tz`;

	const current = status[0];
	logger.info({
		processTz: process.env.TZ,
		dbSessionTz: current?.session_tz,
		dbGlobalTz: current?.global_tz,
		dbNowLocal: current?.now_local?.toISOString?.(),
		dbNowUtc: current?.now_utc?.toISOString?.()
	}, "Database timezone status initialized");

	isDatabaseInitialized = true;
};