import { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
interface IKnexConfig {
  [key: string]: Knex.Config;
}

const config: IKnexConfig = {
  development: {
    client: 'postgres',
    connection: {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      port: Number(process.env.DATABASE_PORT),
    },
    migrations: {
      tableName: 'migrations',
    },
  },
  test: {
    client: 'postgres',
    connection: {
      host: process.env.DATABASE_HOST,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME + '_test',
      port: 5433,
    },
    migrations: {
      tableName: 'migrations',
    },
  },
};

export default config;
