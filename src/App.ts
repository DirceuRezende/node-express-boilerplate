import dotenv from 'dotenv';
dotenv.config();
import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import db from './database/db';
import { router } from './routes';
import errorMiddleware from './middlewares/error-middleware';
import notFoundMiddleware from './middlewares/not-found-middleware';
import Logger, { stream } from './config/logger';

export class App {
  private readonly app = express();
  private readonly database = db;
  private readonly dev =
    (process.env.NODE_ENV || 'development') === 'development';

  private middlewares() {
    this.app.use(morgan('common', { skip: () => !this.dev, stream: stream }));
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes() {
    this.app.use(router);
    this.app.all('*', notFoundMiddleware);
    this.app.use(errorMiddleware);
  }

  async assertDatabaseConnection(): Promise<void> {
    return this.database.raw('select 1+1 as result').catch((err) => {
      Logger.error(
        '[Fatal] Failed to establish connection to database! Exiting...',
      );
      Logger.error(err);
      process.exit(1);
    });
  }

  public async start(): Promise<Application> {
    await this.assertDatabaseConnection();
    this.middlewares();
    this.routes();

    return this.app;
  }

  public async stop(): Promise<void> {
    await this.database.destroy();
  }
}
