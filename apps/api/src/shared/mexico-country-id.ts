import type { Kysely } from 'kysely';
import type { DB } from '../../db/types';

export async function findMexicoCountryId(db: Kysely<DB>): Promise<number | null | undefined> {
  const row = await db
    .selectFrom('country')
    .select('countryid')
    .where('name', '=', 'México')
    .where('statusid', '=', 1)
    .executeTakeFirst();

  return row?.countryid;
}
