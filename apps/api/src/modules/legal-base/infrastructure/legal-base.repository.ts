import { Injectable } from '@nestjs/common';
import type { Insertable, Selectable, Updateable } from 'kysely';
import { db } from '../../../../db/database';
import type { Legalbase, Oscprofile, Userprofile } from '../../../../db/types';

@Injectable()
export class LegalBaseRepository {
  async findUserProfileById(
    userProfileId: number,
  ): Promise<Selectable<Userprofile> | null | undefined> {
    return db
      .selectFrom('userprofile')
      .selectAll()
      .where('userprofileid', '=', userProfileId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async findActiveOSCProfileByUserProfileId(
    userProfileId: number,
  ): Promise<Selectable<Oscprofile> | null | undefined> {
    return db
      .selectFrom('oscprofile')
      .selectAll()
      .where('userprofileid', '=', userProfileId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async findLegalBaseByUserProfileId(
    userProfileId: number,
  ): Promise<Selectable<Legalbase> | null | undefined> {
    return db
      .selectFrom('legalbase')
      .selectAll()
      .where('userprofileid', '=', userProfileId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async findLegalBaseByUserProfileIdAndOSCProfileId(
    userProfileId: number,
    oscProfileId: number,
  ): Promise<Selectable<Legalbase> | null | undefined> {
    return db
      .selectFrom('legalbase')
      .selectAll()
      .where('userprofileid', '=', userProfileId)
      .where('oscprofileid', '=', oscProfileId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async findLegalBaseById(legalBaseId: number): Promise<Selectable<Legalbase> | null | undefined> {
    return db
      .selectFrom('legalbase')
      .selectAll()
      .where('legalbaseid', '=', legalBaseId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async findMexicoCountryId(): Promise<number | null | undefined> {
    const row = await db
      .selectFrom('country')
      .select('countryid')
      .where('name', '=', 'México')
      .where('statusid', '=', 1)
      .executeTakeFirst();

    return row?.countryid;
  }

  async createLegalBase(values: Insertable<Legalbase>): Promise<Selectable<Legalbase>> {
    return db.insertInto('legalbase').values(values).returningAll().executeTakeFirstOrThrow();
  }

  async updateLegalBase(
    legalBaseId: number,
    values: Updateable<Legalbase>,
  ): Promise<Selectable<Legalbase>> {
    return db
      .updateTable('legalbase')
      .set(values)
      .where('legalbaseid', '=', legalBaseId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
