import { Injectable } from '@nestjs/common';
import type { Selectable } from 'kysely';
import type { Kysely } from 'kysely';
import type { GovernmentData, SaveGovernmentBody, SaveGovernmentResponse } from '@dibujando/shared';
import { db } from '../../../../db/database';
import type { DB, Government } from '../../../../db/types';
import { findMexicoCountryId } from '../../../shared/mexico-country-id';
import { isOSCProfileReadOnly, needsResubmission } from '../../../shared/osc-profile-lock';
import { GovernmentRepository } from '../infrastructure/government.repository';
import {
  governingBodyNotFound,
  oscProfileLocked,
  userProfileNotFound,
  validationFailed,
} from '../presentation/government-error.exception';
import { mapToGovernmentData } from './government.mapper';
import {
  buildGoverningBodyItem,
  buildGovernmentInsertValues,
  buildGovernmentUpdateValues,
} from './government-save-values';
import { validateGoverningBodyItems } from './government.validator';

@Injectable()
export class GovernmentService {
  constructor(private readonly repository: GovernmentRepository) {}

  async getGovernment(userProfileId: number, oscProfileId?: number): Promise<GovernmentData> {
    const userProfile = await this.repository.findUserProfileById(userProfileId);

    if (!userProfile) {
      throw userProfileNotFound();
    }

    const oscProfile = await this.repository.findActiveOSCProfileByUserProfileId(userProfileId);
    const mexicoCountryId = await findMexicoCountryId(db);

    const government = oscProfileId
      ? await this.findWithFallback(userProfileId, oscProfileId)
      : await this.repository.findGovernmentByUserProfileId(userProfileId);

    const governingBodies = government
      ? await this.repository.findGoverningBodiesByGovernmentId(government.governmentid)
      : [];

    const isMexico = userProfile.countryid === mexicoCountryId;

    return mapToGovernmentData(
      government,
      userProfileId,
      oscProfile?.oscprofileid,
      governingBodies,
      isMexico,
      isOSCProfileReadOnly(oscProfile?.dynamicsoscstatusid),
    );
  }

  async saveGovernment(body: SaveGovernmentBody): Promise<SaveGovernmentResponse> {
    const userProfile = await this.repository.findUserProfileById(body.userProfileId);

    if (!userProfile) {
      throw userProfileNotFound();
    }

    const oscProfile = await this.repository.findActiveOSCProfileByUserProfileId(
      body.userProfileId,
    );

    if (oscProfile && isOSCProfileReadOnly(oscProfile.dynamicsoscstatusid)) {
      throw oscProfileLocked();
    }

    const mexicoCountryId = await findMexicoCountryId(db);
    const isMexico = userProfile.countryid === mexicoCountryId;

    const validation = validateGoverningBodyItems(body.governingBody, isMexico);

    if (validation.errors.length > 0) {
      throw validationFailed(validation.errors);
    }

    const existing = body.governmentId
      ? await this.repository.findGovernmentById(body.governmentId)
      : await this.repository.findGovernmentByUserProfileId(body.userProfileId);

    const saved = await this.repository.withTransaction(async (trx) => {
      const government = await this.upsertGovernment(trx, body, existing, oscProfile?.oscprofileid);
      await this.replaceGoverningBodies(trx, government.governmentid, validation.validItems);
      return government;
    });

    return {
      governmentId: saved.governmentid,
      needsResubmission: needsResubmission(oscProfile?.dynamicsoscstatusid),
    };
  }

  async disableGoverningBody(id: number): Promise<void> {
    const row = await this.repository.findGoverningBodyById(id);

    if (!row) {
      throw governingBodyNotFound();
    }

    await this.repository.disableGoverningBody(id);
  }

  private async findWithFallback(
    userProfileId: number,
    oscProfileId: number,
  ): Promise<Selectable<Government> | null | undefined> {
    const byBoth = await this.repository.findGovernmentByUserProfileIdAndOSCProfileId(
      userProfileId,
      oscProfileId,
    );

    return byBoth ?? this.repository.findGovernmentByUserProfileId(userProfileId);
  }

  private async upsertGovernment(
    trx: Kysely<DB>,
    body: SaveGovernmentBody,
    existing: Selectable<Government> | null | undefined,
    oscProfileId: number | null | undefined,
  ): Promise<Selectable<Government>> {
    const now = new Date();
    const oscprofileid = existing?.oscprofileid ?? oscProfileId ?? null;

    if (existing) {
      return this.repository.updateGovernment(
        existing.governmentid,
        { ...buildGovernmentUpdateValues(body, now), oscprofileid },
        trx,
      );
    }

    return this.repository.createGovernment(
      { ...buildGovernmentInsertValues(body, now), oscprofileid },
      trx,
    );
  }

  private async replaceGoverningBodies(
    trx: Kysely<DB>,
    governmentId: number,
    items: SaveGovernmentBody['governingBody'],
  ): Promise<void> {
    const now = new Date();

    await this.repository.replaceGoverningBodies(
      governmentId,
      items.map((item) => buildGoverningBodyItem(item, governmentId, now)),
      trx,
    );
  }
}
