import { Injectable } from '@nestjs/common';
import type { Insertable, Selectable, Updateable } from 'kysely';
import { Kysely } from 'kysely';
import { db } from '../../../../db/database';
import type {
  Agegroup,
  DB,
  Institutionalbase,
  Oscprofile,
  Personalsituation,
  Userprofile,
} from '../../../../db/types';

export function client(trx?: Kysely<DB>): Kysely<DB> {
  return trx ?? db;
}

@Injectable()
export class InstitutionalBaseRepository {
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

  async findInstitutionalBaseByUserProfileId(
    userProfileId: number,
  ): Promise<Selectable<Institutionalbase> | null | undefined> {
    return db
      .selectFrom('institutionalbase')
      .selectAll()
      .where('userprofileid', '=', userProfileId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async findInstitutionalBaseByUserProfileIdAndOSCProfileId(
    userProfileId: number,
    oscProfileId: number,
  ): Promise<Selectable<Institutionalbase> | null | undefined> {
    return db
      .selectFrom('institutionalbase')
      .selectAll()
      .where('userprofileid', '=', userProfileId)
      .where('oscprofileid', '=', oscProfileId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async findInstitutionalBaseById(
    institutionalBaseId: number,
  ): Promise<Selectable<Institutionalbase> | null | undefined> {
    return db
      .selectFrom('institutionalbase')
      .selectAll()
      .where('institutionalbaseid', '=', institutionalBaseId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async findActiveAgeGroups(): Promise<Selectable<Agegroup>[]> {
    return db
      .selectFrom('agegroup')
      .selectAll()
      .where('statusid', '=', 1)
      .orderBy('order', 'asc')
      .execute();
  }

  async findActivePersonalSituations(): Promise<Selectable<Personalsituation>[]> {
    return db
      .selectFrom('personalsituation')
      .selectAll()
      .where('statusid', '=', 1)
      .orderBy('order', 'asc')
      .execute();
  }

  async createInstitutionalBase(
    values: Insertable<Institutionalbase>,
    trx?: Kysely<DB>,
  ): Promise<Selectable<Institutionalbase>> {
    return client(trx)
      .insertInto('institutionalbase')
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updateInstitutionalBase(
    institutionalBaseId: number,
    values: Updateable<Institutionalbase>,
    trx?: Kysely<DB>,
  ): Promise<Selectable<Institutionalbase>> {
    return client(trx)
      .updateTable('institutionalbase')
      .set(values)
      .where('institutionalbaseid', '=', institutionalBaseId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async withTransaction<T>(callback: (trx: Kysely<DB>) => Promise<T>): Promise<T> {
    return db.transaction().execute(callback);
  }
}
