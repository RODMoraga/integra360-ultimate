import { createApp } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";

/**
 * API server startup entrypoint.
 */
const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`API running on http://localhost:${env.PORT}`);
});