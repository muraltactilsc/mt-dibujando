import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { Database } from './types';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://dibujando:dibujando@localhost:5432/dibujando';

export const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString,
    }),
  }),
});
