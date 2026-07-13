import { Injectable } from '@nestjs/common';
import type { Insertable, Selectable, Updateable } from 'kysely';
import { Kysely } from 'kysely';
import { db } from '../../../../db/database';
import type { DB, Interventionmodelprograms, Volunteeractivities } from '../../../../db/types';
import { client } from './institutional-base.repository';

@Injectable()
export class InstitutionalBaseRepeatableRepository {
  async findInterventionModelProgramsByInstitutionalBaseId(
    institutionalBaseId: number,
  ): Promise<Selectable<Interventionmodelprograms>[]> {
    return db
      .selectFrom('interventionmodelprograms')
      .selectAll()
      .where('institutionalbaseid', '=', institutionalBaseId)
      .where('statusid', '=', 1)
      .execute();
  }

  async findVolunteerActivitiesByInstitutionalBaseId(
    institutionalBaseId: number,
  ): Promise<Selectable<Volunteeractivities>[]> {
    return db
      .selectFrom('volunteeractivities')
      .selectAll()
      .where('institutionalbaseid', '=', institutionalBaseId)
      .where('statusid', '=', 1)
      .execute();
  }

  async findInterventionModelProgramById(
    id: number,
  ): Promise<Selectable<Interventionmodelprograms> | null | undefined> {
    return db
      .selectFrom('interventionmodelprograms')
      .selectAll()
      .where('interventionmodelprogramsid', '=', id)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async findVolunteerActivityById(
    id: number,
  ): Promise<Selectable<Volunteeractivities> | null | undefined> {
    return db
      .selectFrom('volunteeractivities')
      .selectAll()
      .where('volunteeractivitiesid', '=', id)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async replaceInterventionModelPrograms(
    institutionalBaseId: number,
    items: Array<
      | { id: number; values: Updateable<Interventionmodelprograms> }
      | { id: undefined; values: Insertable<Interventionmodelprograms> }
    >,
    trx?: Kysely<DB>,
  ): Promise<void> {
    const keptIds = items
      .filter(
        (item): item is { id: number; values: Updateable<Interventionmodelprograms> } =>
          item.id !== undefined,
      )
      .map((item) => item.id);

    let deleteQuery = client(trx)
      .updateTable('interventionmodelprograms')
      .set({ statusid: 2, datetimelastupdate: new Date() })
      .where('institutionalbaseid', '=', institutionalBaseId)
      .where('statusid', '=', 1);

    if (keptIds.length > 0) {
      deleteQuery = deleteQuery.where('interventionmodelprogramsid', 'not in', keptIds);
    }

    await deleteQuery.execute();

    for (const item of items) {
      if (item.id) {
        await client(trx)
          .updateTable('interventionmodelprograms')
          .set({ ...item.values, datetimelastupdate: new Date() })
          .where('interventionmodelprogramsid', '=', item.id)
          .execute();
      } else {
        await client(trx)
          .insertInto('interventionmodelprograms')
          .values(item.values as Insertable<Interventionmodelprograms>)
          .execute();
      }
    }
  }

  async replaceVolunteerActivities(
    institutionalBaseId: number,
    items: Array<
      | { id: number; values: Updateable<Volunteeractivities> }
      | { id: undefined; values: Insertable<Volunteeractivities> }
    >,
    trx?: Kysely<DB>,
  ): Promise<void> {
    const keptIds = items
      .filter(
        (item): item is { id: number; values: Updateable<Volunteeractivities> } =>
          item.id !== undefined,
      )
      .map((item) => item.id);

    let deleteQuery = client(trx)
      .updateTable('volunteeractivities')
      .set({ statusid: 2, datetimelastupdate: new Date() })
      .where('institutionalbaseid', '=', institutionalBaseId)
      .where('statusid', '=', 1);

    if (keptIds.length > 0) {
      deleteQuery = deleteQuery.where('volunteeractivitiesid', 'not in', keptIds);
    }

    await deleteQuery.execute();

    for (const item of items) {
      if (item.id) {
        await client(trx)
          .updateTable('volunteeractivities')
          .set({ ...item.values, datetimelastupdate: new Date() })
          .where('volunteeractivitiesid', '=', item.id)
          .execute();
      } else {
        await client(trx)
          .insertInto('volunteeractivities')
          .values(item.values as Insertable<Volunteeractivities>)
          .execute();
      }
    }
  }

  async disableInterventionModelProgram(id: number): Promise<void> {
    await db
      .updateTable('interventionmodelprograms')
      .set({ statusid: 2, userupdateid: '1', datetimelastupdate: new Date() })
      .where('interventionmodelprogramsid', '=', id)
      .where('statusid', '=', 1)
      .execute();
  }

  async disableVolunteerActivity(id: number): Promise<void> {
    await db
      .updateTable('volunteeractivities')
      .set({ statusid: 2, userupdateid: '1', datetimelastupdate: new Date() })
      .where('volunteeractivitiesid', '=', id)
      .where('statusid', '=', 1)
      .execute();
  }
}
