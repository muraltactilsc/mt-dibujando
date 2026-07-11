import { Injectable } from '@nestjs/common';
import type { Selectable } from 'kysely';
import { db } from '../../../../db/database';
import type { AuthSessions, Aspnetusers, Userprofile } from '../../../../db/types';

export interface UserWithRoleAndProfile {
  user: Selectable<Aspnetusers>;
  roleName: string | null;
  profile: Selectable<Userprofile> | null;
}

export interface SessionWithUser {
  session: Selectable<AuthSessions>;
  user: Selectable<Aspnetusers>;
}

@Injectable()
export class AuthRepository {
  async findUserWithRoleAndProfileByEmail(email: string): Promise<UserWithRoleAndProfile | null> {
    const user = await db
      .selectFrom('aspnetusers')
      .selectAll()
      .where((eb) =>
        eb.or([eb('email', '=', email.toLowerCase()), eb('username', '=', email.toLowerCase())]),
      )
      .executeTakeFirst();

    if (!user) {
      return null;
    }

    const roleRow = await db
      .selectFrom('aspnetuserroles')
      .innerJoin('aspnetroles', 'aspnetroles.id', 'aspnetuserroles.roleid')
      .select('aspnetroles.name')
      .where('aspnetuserroles.userid', '=', user.id)
      .executeTakeFirst();

    const profile = await db
      .selectFrom('userprofile')
      .selectAll()
      .where('internalid', '=', user.id)
      .where('statusid', '=', 1)
      .executeTakeFirst();

    return {
      user,
      roleName: roleRow?.name ?? null,
      profile: profile ?? null,
    };
  }

  async findUserWithRoleAndProfileById(id: string): Promise<UserWithRoleAndProfile | null> {
    const user = await db
      .selectFrom('aspnetusers')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!user) {
      return null;
    }

    const roleRow = await db
      .selectFrom('aspnetuserroles')
      .innerJoin('aspnetroles', 'aspnetroles.id', 'aspnetuserroles.roleid')
      .select('aspnetroles.name')
      .where('aspnetuserroles.userid', '=', user.id)
      .executeTakeFirst();

    const profile = await db
      .selectFrom('userprofile')
      .selectAll()
      .where('internalid', '=', user.id)
      .where('statusid', '=', 1)
      .executeTakeFirst();

    return {
      user,
      roleName: roleRow?.name ?? null,
      profile: profile ?? null,
    };
  }

  async findSessionById(id: string): Promise<SessionWithUser | null> {
    const session = await db
      .selectFrom('auth_sessions')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!session) {
      return null;
    }

    const user = await db
      .selectFrom('aspnetusers')
      .selectAll()
      .where('id', '=', session.user_id)
      .executeTakeFirst();

    if (!user) {
      return null;
    }

    return { session, user };
  }

  async createSession(
    id: string,
    values: {
      user_id: string;
      security_stamp_at_issue: string;
      expires_at: Date;
      created_at: Date;
    },
  ): Promise<void> {
    await db
      .insertInto('auth_sessions')
      .values({ id, ...values })
      .execute();
  }

  async deleteSessionById(id: string): Promise<void> {
    await db.deleteFrom('auth_sessions').where('id', '=', id).execute();
  }
}
