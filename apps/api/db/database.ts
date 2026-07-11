import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import type { DB } from './types';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://dibujando:dibujando@localhost:5432/dibujando';

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString,
    }),
  }),
});
