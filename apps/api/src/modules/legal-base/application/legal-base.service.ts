import { Injectable } from '@nestjs/common';
import type { Insertable, Selectable, Updateable } from 'kysely';
import type { LegalBaseData, SaveLegalBaseBody, SaveLegalBaseResponse } from '@dibujando/shared';
import type { Legalbase } from '../../../../db/types';
import { isOSCProfileReadOnly, needsResubmission } from '../../../shared/osc-profile-lock';
import { LegalBaseRepository } from '../infrastructure/legal-base.repository';
import {
  lastProtocolizationRequired,
  oscProfileLocked,
  userProfileNotFound,
} from '../presentation/legal-base-error.exception';
import { mapRowToLegalBaseData } from './legal-base.mapper';

@Injectable()
export class LegalBaseService {
  constructor(private readonly repository: LegalBaseRepository) {}

  async getLegalData(userProfileId: number, oscProfileId?: number): Promise<LegalBaseData> {
    const userProfile = await this.repository.findUserProfileById(userProfileId);

    if (!userProfile) {
      throw userProfileNotFound();
    }

    const oscProfile = await this.repository.findActiveOSCProfileByUserProfileId(userProfileId);
    const mexicoCountryId = await this.repository.findMexicoCountryId();

    const legalBase = oscProfileId
      ? await this.findWithFallback(userProfileId, oscProfileId)
      : await this.repository.findLegalBaseByUserProfileId(userProfileId);

    return mapRowToLegalBaseData(legalBase, userProfile, oscProfile, mexicoCountryId);
  }

  async saveLegalData(body: SaveLegalBaseBody): Promise<SaveLegalBaseResponse> {
    const userProfile = await this.repository.findUserProfileById(body.userProfileId);

    if (!userProfile) {
      throw userProfileNotFound();
    }

    const mexicoCountryId = await this.repository.findMexicoCountryId();
    const isMexico = userProfile.countryid === mexicoCountryId;

    if (isMexico && !body.lastProtocolizationDate) {
      throw lastProtocolizationRequired();
    }

    const oscProfile = await this.repository.findActiveOSCProfileByUserProfileId(
      body.userProfileId,
    );

    if (oscProfile && isOSCProfileReadOnly(oscProfile.dynamicsoscstatusid)) {
      throw oscProfileLocked();
    }

    const existing = body.legalBaseId
      ? await this.repository.findLegalBaseById(body.legalBaseId)
      : null;

    const now = new Date();

    const commonValues = {
      userprofileid: body.userProfileId,
      oscprofileid: existing?.oscprofileid ?? oscProfile?.oscprofileid ?? null,
      organizationconstitutiondate: body.organizationConstitutionDate,
      lastprotocolizationdate: body.lastProtocolizationDate ?? null,
      isauthorized: body.isAuthorized,
      goubernamentalauthorizationdate: body.goubernamentalAuthorizationDate,
      socialobjetive: body.socialObjetive.trim(),
      statusid: 1,
    };

    let saved: Selectable<Legalbase>;

    if (existing) {
      const updateValues: Updateable<Legalbase> = {
        ...commonValues,
        userupdatedid: '1',
        datetimelastupdate: now,
      };
      saved = await this.repository.updateLegalBase(existing.legalbaseid, updateValues);
    } else {
      const insertValues: Insertable<Legalbase> = {
        ...commonValues,
        usercreated: '1',
        datetimecreate: now,
      };
      saved = await this.repository.createLegalBase(insertValues);
    }

    return {
      legalBaseId: saved.legalbaseid,
      needsResubmission: needsResubmission(oscProfile?.dynamicsoscstatusid),
    };
  }

  private async findWithFallback(
    userProfileId: number,
    oscProfileId: number,
  ): Promise<Selectable<Legalbase> | null | undefined> {
    const byBoth = await this.repository.findLegalBaseByUserProfileIdAndOSCProfileId(
      userProfileId,
      oscProfileId,
    );

    return byBoth ?? this.repository.findLegalBaseByUserProfileId(userProfileId);
  }
}
