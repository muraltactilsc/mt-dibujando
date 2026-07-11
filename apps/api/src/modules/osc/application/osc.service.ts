import { Injectable } from '@nestjs/common';
import type { Insertable, Selectable, Updateable } from 'kysely';
import type { GeneralData, SaveGeneralDataBody, SaveGeneralDataResponse } from '@dibujando/shared';
import type { Oscprofile } from '../../../../db/types';
import { OSCRepository } from '../infrastructure/osc.repository';
import { isOSCProfileReadOnly, needsResubmission } from '../domain/osc-profile-lock';
import { oscProfileLocked, userProfileNotFound } from '../presentation/osc-error.exception';
import { mapRowToGeneralData } from './osc-general-data.mapper';

@Injectable()
export class OSCService {
  constructor(private readonly repository: OSCRepository) {}

  async getGeneralData(userProfileId: number): Promise<GeneralData> {
    const userProfile = await this.repository.findUserProfileById(userProfileId);

    if (!userProfile) {
      throw userProfileNotFound();
    }

    const oscProfile = await this.repository.findActiveProfileByUserProfileId(userProfileId);
    return mapRowToGeneralData(oscProfile, userProfile);
  }

  async saveGeneralData(body: SaveGeneralDataBody): Promise<SaveGeneralDataResponse> {
    const userProfile = await this.repository.findUserProfileById(body.userProfileId);

    if (!userProfile) {
      throw userProfileNotFound();
    }

    const existing = body.oscProfileId
      ? await this.repository.findActiveProfileById(body.oscProfileId)
      : null;

    if (existing && isOSCProfileReadOnly(existing.dynamicsoscstatusid)) {
      throw oscProfileLocked();
    }

    const now = new Date();

    const commonValues = {
      userprofileid: body.userProfileId,
      email: body.contactEmail,
      name: body.name,
      socialreason: body.socialReason,
      osctypeid: body.oscTypeId,
      actionlineid: body.actionLineId ?? null,
      actionlinesecondaryid: body.actionLineSecondaryId ?? null,
      nationalregistrynumber: body.nationalRegistryNumber,
      contactname: body.contactName,
      contactposition: body.contactPosition,
      contacttelephone: body.contactTelephone ?? null,
      contacttelephoneext: body.contactTelephoneExt ?? null,
      contactemail: body.contactEmail,
      contactmobilephone: body.contactMobilePhone ?? null,
      countryid: body.countryId,
      stateid: body.stateId,
      city: body.city,
      postalcode: body.postalCode,
      address: body.address ?? null,
      reference: body.reference ?? null,
      financeministrynumber: body.financeMinistryNumber ?? null,
      osctypeconstitutionid: body.oscTypeConstitutionId,
      statusid: 1,
    };

    let saved: Selectable<Oscprofile>;

    if (existing) {
      const updateValues: Updateable<Oscprofile> = {
        ...commonValues,
        userupdateid: '1',
        datetimelastupdate: now,
      };
      saved = await this.repository.updateProfile(existing.oscprofileid, updateValues);
    } else {
      const insertValues: Insertable<Oscprofile> = {
        ...commonValues,
        usercreateid: '1',
        datetimecreate: now,
      };
      saved = await this.repository.createProfile(insertValues);
    }

    return {
      oscProfileId: saved.oscprofileid,
      needsResubmission: needsResubmission(saved.dynamicsoscstatusid),
    };
  }
}
