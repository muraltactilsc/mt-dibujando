import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { sql } from 'kysely';
import { db } from './database';

async function runSqlFile(path: string): Promise<void> {
  const content = await readFile(path, 'utf-8');
  await sql.raw(content).execute(db);
}

function dbFile(name: string): string {
  // __dirname is apps/api/dist/db at runtime; SQL sources live in apps/api/db.
  return resolve(__dirname, '..', '..', 'db', name);
}

export async function initializeSchema(): Promise<void> {
  await runSqlFile(dbFile('scripts/001_auth_core.sql'));
  await runSqlFile(dbFile('scripts/002_registration_core.sql'));
  await runSqlFile(dbFile('scripts/003_osc_general_data.sql'));
  await runSqlFile(dbFile('scripts/004_osc_legalbase.sql'));
  await runSqlFile(dbFile('scripts/005_finance_institutionalbase_catalogs.sql'));
}

export async function seedFixtures(): Promise<void> {
  await runSqlFile(dbFile('seeds/000_catalogs.sql'));
  await runSqlFile(dbFile('seeds/001_auth_fixture.sql'));
  await runSqlFile(dbFile('seeds/002_registration_fixture.sql'));
  await runSqlFile(dbFile('seeds/003_osc_legalbase_fixture.sql'));
}
