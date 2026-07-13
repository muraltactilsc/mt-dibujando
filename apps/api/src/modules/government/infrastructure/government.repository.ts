import { Injectable } from '@nestjs/common';
import type { Insertable, Selectable, Updateable } from 'kysely';
import { Kysely } from 'kysely';
import { db } from '../../../../db/database';
import type { DB, Government, Governingbody, Oscprofile, Userprofile } from '../../../../db/types';

export function client(trx?: Kysely<DB>): Kysely<DB> {
  return trx ?? db;
}

@Injectable()
export class GovernmentRepository {
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

  async findGovernmentByUserProfileId(
    userProfileId: number,
  ): Promise<Selectable<Government> | null | undefined> {
    return db
      .selectFrom('government')
      .selectAll()
      .where('userprofileid', '=', userProfileId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async findGovernmentByUserProfileIdAndOSCProfileId(
    userProfileId: number,
    oscProfileId: number,
  ): Promise<Selectable<Government> | null | undefined> {
    return db
      .selectFrom('government')
      .selectAll()
      .where('userprofileid', '=', userProfileId)
      .where('oscprofileid', '=', oscProfileId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async findGovernmentById(
    governmentId: number,
  ): Promise<Selectable<Government> | null | undefined> {
    return db
      .selectFrom('government')
      .selectAll()
      .where('governmentid', '=', governmentId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async createGovernment(
    values: Insertable<Government>,
    trx?: Kysely<DB>,
  ): Promise<Selectable<Government>> {
    return client(trx)
      .insertInto('government')
      .values(values)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async updateGovernment(
    governmentId: number,
    values: Updateable<Government>,
    trx?: Kysely<DB>,
  ): Promise<Selectable<Government>> {
    return client(trx)
      .updateTable('government')
      .set(values)
      .where('governmentid', '=', governmentId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }

  async findGoverningBodiesByGovernmentId(
    governmentId: number,
  ): Promise<Selectable<Governingbody>[]> {
    return db
      .selectFrom('governingbody')
      .selectAll()
      .where('governmentid', '=', governmentId)
      .where('statusid', '=', 1)
      .execute();
  }

  async findGoverningBodyById(id: number): Promise<Selectable<Governingbody> | null | undefined> {
    return db
      .selectFrom('governingbody')
      .selectAll()
      .where('governingbodyid', '=', id)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async replaceGoverningBodies(
    governmentId: number,
    items: Array<
      | { id: number; values: Updateable<Governingbody> }
      | { id: undefined; values: Insertable<Governingbody> }
    >,
    trx?: Kysely<DB>,
  ): Promise<void> {
    const keptIds = items
      .filter(
        (item): item is { id: number; values: Updateable<Governingbody> } => item.id !== undefined,
      )
      .map((item) => item.id);

    let deleteQuery = client(trx)
      .updateTable('governingbody')
      .set({ statusid: 2, datetimelastupdate: new Date() })
      .where('governmentid', '=', governmentId)
      .where('statusid', '=', 1);

    if (keptIds.length > 0) {
      deleteQuery = deleteQuery.where('governingbodyid', 'not in', keptIds);
    }

    await deleteQuery.execute();

    for (const item of items) {
      if (item.id) {
        await client(trx)
          .updateTable('governingbody')
          .set({ ...item.values, datetimelastupdate: new Date() })
          .where('governingbodyid', '=', item.id)
          .execute();
      } else {
        await client(trx)
          .insertInto('governingbody')
          .values(item.values as Insertable<Governingbody>)
          .execute();
      }
    }
  }

  async disableGoverningBody(id: number): Promise<void> {
    await db
      .updateTable('governingbody')
      .set({ statusid: 2, userupdateid: '1', datetimelastupdate: new Date() })
      .where('governingbodyid', '=', id)
      .where('statusid', '=', 1)
      .execute();
  }

  async withTransaction<T>(callback: (trx: Kysely<DB>) => Promise<T>): Promise<T> {
    return db.transaction().execute(callback);
  }
}
