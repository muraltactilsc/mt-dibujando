import { Injectable } from '@nestjs/common';
import type { Insertable, Selectable, Updateable } from 'kysely';
import { Kysely } from 'kysely';
import { db } from '../../../../db/database';
import type { DB, Operativeteam, Populationserved } from '../../../../db/types';
import { client } from './institutional-base.repository';

@Injectable()
export class InstitutionalBaseFixedRepository {
  async findPopulationServedByInstitutionalBaseId(
    institutionalBaseId: number,
  ): Promise<Selectable<Populationserved>[]> {
    return db
      .selectFrom('populationserved')
      .selectAll()
      .where('institutionalbaseid', '=', institutionalBaseId)
      .where('statusid', '=', 1)
      .execute();
  }

  async findOperativeTeamByInstitutionalBaseId(
    institutionalBaseId: number,
  ): Promise<Selectable<Operativeteam>[]> {
    return db
      .selectFrom('operativeteam')
      .selectAll()
      .where('institutionalbaseid', '=', institutionalBaseId)
      .where('statusid', '=', 1)
      .execute();
  }

  async replacePopulationServed(
    institutionalBaseId: number,
    items: Array<
      | { id: number; values: Updateable<Populationserved> }
      | { id: undefined; values: Insertable<Populationserved> }
    >,
    trx?: Kysely<DB>,
  ): Promise<void> {
    const keptIds = items
      .filter(
        (item): item is { id: number; values: Updateable<Populationserved> } =>
          item.id !== undefined,
      )
      .map((item) => item.id);

    let deleteQuery = client(trx)
      .updateTable('populationserved')
      .set({ statusid: 2, datetimelastupdate: new Date() })
      .where('institutionalbaseid', '=', institutionalBaseId)
      .where('statusid', '=', 1);

    if (keptIds.length > 0) {
      deleteQuery = deleteQuery.where('populationservedid', 'not in', keptIds);
    }

    await deleteQuery.execute();

    for (const item of items) {
      if (item.id) {
        await client(trx)
          .updateTable('populationserved')
          .set({ ...item.values, datetimelastupdate: new Date() })
          .where('populationservedid', '=', item.id)
          .execute();
      } else {
        await client(trx)
          .insertInto('populationserved')
          .values(item.values as Insertable<Populationserved>)
          .execute();
      }
    }
  }

  async replaceOperativeTeam(
    institutionalBaseId: number,
    items: Array<
      | { id: number; values: Updateable<Operativeteam> }
      | { id: undefined; values: Insertable<Operativeteam> }
    >,
    trx?: Kysely<DB>,
  ): Promise<void> {
    const keptIds = items
      .filter(
        (item): item is { id: number; values: Updateable<Operativeteam> } => item.id !== undefined,
      )
      .map((item) => item.id);

    let deleteQuery = client(trx)
      .updateTable('operativeteam')
      .set({ statusid: 2, datetimelastupdate: new Date() })
      .where('institutionalbaseid', '=', institutionalBaseId)
      .where('statusid', '=', 1);

    if (keptIds.length > 0) {
      deleteQuery = deleteQuery.where('operativeteamid', 'not in', keptIds);
    }

    await deleteQuery.execute();

    for (const item of items) {
      if (item.id) {
        await client(trx)
          .updateTable('operativeteam')
          .set({ ...item.values, datetimelastupdate: new Date() })
          .where('operativeteamid', '=', item.id)
          .execute();
      } else {
        await client(trx)
          .insertInto('operativeteam')
          .values(item.values as Insertable<Operativeteam>)
          .execute();
      }
    }
  }
}
