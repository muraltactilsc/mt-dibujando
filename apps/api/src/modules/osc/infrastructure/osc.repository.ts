import { Injectable } from '@nestjs/common';
import type { Insertable, Selectable, Updateable } from 'kysely';
import { db } from '../../../../db/database';
import type { Oscprofile, Userprofile } from '../../../../db/types';

@Injectable()
export class OSCRepository {
  async findActiveProfileByUserProfileId(
    userProfileId: number,
  ): Promise<Selectable<Oscprofile> | null | undefined> {
    return db
      .selectFrom('oscprofile')
      .selectAll()
      .where('userprofileid', '=', userProfileId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

  async findActiveProfileById(
    oscProfileId: number,
  ): Promise<Selectable<Oscprofile> | null | undefined> {
    return db
      .selectFrom('oscprofile')
      .selectAll()
      .where('oscprofileid', '=', oscProfileId)
      .where('statusid', '=', 1)
      .executeTakeFirst();
  }

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

  async createProfile(values: Insertable<Oscprofile>): Promise<Selectable<Oscprofile>> {
    return db.insertInto('oscprofile').values(values).returningAll().executeTakeFirstOrThrow();
  }

  async updateProfile(
    oscProfileId: number,
    values: Updateable<Oscprofile>,
  ): Promise<Selectable<Oscprofile>> {
    return db
      .updateTable('oscprofile')
      .set(values)
      .where('oscprofileid', '=', oscProfileId)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
