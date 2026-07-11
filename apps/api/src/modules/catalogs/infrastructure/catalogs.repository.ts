import { Injectable } from '@nestjs/common';
import type { Selectable } from 'kysely';
import { db } from '../../../../db/database';
import type {
  Actionline,
  Actionlinesecondary,
  Oscstatus,
  Osctype,
  Osctypeconstitution,
  State,
} from '../../../../db/types';

@Injectable()
export class CatalogsRepository {
  async findActiveStatesByCountry(countryId: number): Promise<Array<Selectable<State>>> {
    return db
      .selectFrom('state')
      .selectAll()
      .where('statusid', '=', 1)
      .where('countryid', '=', countryId)
      .orderBy('name', 'asc')
      .execute();
  }

  async findActiveOSCTypes(): Promise<Array<Selectable<Osctype>>> {
    return db
      .selectFrom('osctype')
      .selectAll()
      .where('statusid', '=', 1)
      .orderBy('name', 'asc')
      .execute();
  }

  async findActiveOSCTypeConstitutions(): Promise<Array<Selectable<Osctypeconstitution>>> {
    return db
      .selectFrom('osctypeconstitution')
      .selectAll()
      .where('statusid', '=', 1)
      .orderBy('name', 'asc')
      .execute();
  }

  async findActiveActionLines(): Promise<Array<Selectable<Actionline>>> {
    return db
      .selectFrom('actionline')
      .selectAll()
      .where('statusid', '=', 1)
      .orderBy('name', 'asc')
      .execute();
  }

  async findActiveActionLinesSecondary(): Promise<Array<Selectable<Actionlinesecondary>>> {
    return db
      .selectFrom('actionlinesecondary')
      .selectAll()
      .where('statusid', '=', 1)
      .orderBy('name', 'asc')
      .execute();
  }

  async findActiveOSCStatuses(): Promise<Array<Selectable<Oscstatus>>> {
    return db
      .selectFrom('oscstatus')
      .selectAll()
      .where('statusid', '=', 1)
      .orderBy('name', 'asc')
      .execute();
  }
}
