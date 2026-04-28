import { createApp } from "./app";
import { initializeDatabase } from "./config/database";
import { env } from "./config/env";
import { logger } from "./config/logger";

/**
 * API server startup entrypoint.
 */
const bootstrap = async () => {
  await initializeDatabase();

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`API running on http://localhost:${env.PORT}`);
  });
};

bootstrap().catch((error) => {
  logger.error(error, "Failed to start API");
  process.exit(1);
});