import { Server } from 'http';
import logger from './config/logger';
import App from './App';

type ShutdownHandler = () => void;

function getShutdownHandler(app: App, server: Server): ShutdownHandler {
  return function () {
    server.close(async (err) => {
      logger.info('Stopping...');
      await app.stop();
      logger.info('Stopped');
      process.exit(err ? 1 : 0);
    });
  };
}

const port = process.env.PORT || 3002;

async function server(): Promise<void> {
  const app = new App();
  const application = await app.start();
  const server = application.listen(port);
  const shutdown = getShutdownHandler(app, server);

  process.on('SIGINT', shutdown);
  process.on('SIGQUIT', shutdown);
  process.on('SIGTERM', shutdown);
}

Promise.resolve()
  .then(server)
  .then(() => logger.info(`Server is running on port: ${port}`))
  .catch(logger.error);
