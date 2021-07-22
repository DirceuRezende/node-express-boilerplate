import { Knex } from 'knex';
import dot from 'dotenv';

dot.config();

const config: Knex.Config = {
  client: 'postgres',

  connection: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
};

export default config;
