import { Injectable } from '@nestjs/common';
import type { Selectable } from 'kysely';
import type { Kysely } from 'kysely';
import type {
  InterventionModelProgramItem,
  SaveInstitutionalBaseBody,
  SaveInstitutionalBaseResponse,
  VolunteerActivityItem,
} from '@dibujando/shared';
import type { DB, Institutionalbase } from '../../../../db/types';
import { isOSCProfileReadOnly, needsResubmission } from '../../../shared/osc-profile-lock';
import { InstitutionalBaseFixedRepository } from '../infrastructure/institutional-base-fixed.repository';
import { InstitutionalBaseRepeatableRepository } from '../infrastructure/institutional-base-repeatable.repository';
import { InstitutionalBaseRepository } from '../infrastructure/institutional-base.repository';
import {
  interventionModelProgramNotFound,
  oscProfileLocked,
  userProfileNotFound,
  validationFailed,
  volunteerActivityNotFound,
} from '../presentation/institutional-base-error.exception';
import {
  buildInterventionModelProgramItem,
  buildOperativeTeamItem,
  buildPopulationServedItem,
  buildVolunteerActivityItem,
} from './institutional-base-child-values';
import {
  buildInstitutionalBaseInsertValues,
  buildInstitutionalBaseUpdateValues,
} from './institutional-base-save-values';
import {
  validateInterventionModelPrograms,
  validateVolunteerActivities,
} from './institutional-base.validator';

@Injectable()
export class InstitutionalBaseWriteService {
  constructor(
    private readonly repository: InstitutionalBaseRepository,
    private readonly repeatableRepository: InstitutionalBaseRepeatableRepository,
    private readonly fixedRepository: InstitutionalBaseFixedRepository,
  ) {}

  async saveInstitutionalBase(
    body: SaveInstitutionalBaseBody,
  ): Promise<SaveInstitutionalBaseResponse> {
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

    const interventionValidation = validateInterventionModelPrograms(
      body.interventionModelPrograms,
    );
    const volunteerValidation = validateVolunteerActivities(body.volunteerActivities);

    const validationErrors = [...interventionValidation.errors, ...volunteerValidation.errors];

    if (validationErrors.length > 0) {
      throw validationFailed([...new Set(validationErrors)]);
    }

    const existing = body.institutionalBaseId
      ? await this.repository.findInstitutionalBaseById(body.institutionalBaseId)
      : await this.repository.findInstitutionalBaseByUserProfileId(body.userProfileId);

    const saved = await this.repository.withTransaction(async (trx) => {
      const institutionalBase = await this.upsertInstitutionalBase(
        trx,
        body,
        existing,
        oscProfile?.oscprofileid,
      );
      await this.replaceChildren(
        trx,
        institutionalBase.institutionalbaseid,
        body,
        interventionValidation.validItems,
        volunteerValidation.validItems,
      );
      return institutionalBase;
    });

    return {
      institutionalBaseId: saved.institutionalbaseid,
      needsResubmission: needsResubmission(oscProfile?.dynamicsoscstatusid),
    };
  }

  async disableInterventionModelProgram(id: number): Promise<void> {
    const row = await this.repeatableRepository.findInterventionModelProgramById(id);

    if (!row) {
      throw interventionModelProgramNotFound();
    }

    await this.repeatableRepository.disableInterventionModelProgram(id);
  }

  async disableVolunteerActivity(id: number): Promise<void> {
    const row = await this.repeatableRepository.findVolunteerActivityById(id);

    if (!row) {
      throw volunteerActivityNotFound();
    }

    await this.repeatableRepository.disableVolunteerActivity(id);
  }

  private async upsertInstitutionalBase(
    trx: Kysely<DB>,
    body: SaveInstitutionalBaseBody,
    existing: Selectable<Institutionalbase> | null | undefined,
    oscProfileId: number | null | undefined,
  ): Promise<Selectable<Institutionalbase>> {
    const now = new Date();
    const oscprofileid = existing?.oscprofileid ?? oscProfileId ?? null;

    if (existing) {
      return this.repository.updateInstitutionalBase(
        existing.institutionalbaseid,
        { ...buildInstitutionalBaseUpdateValues(body, now), oscprofileid },
        trx,
      );
    }

    return this.repository.createInstitutionalBase(
      { ...buildInstitutionalBaseInsertValues(body, now), oscprofileid },
      trx,
    );
  }

  private async replaceChildren(
    trx: Kysely<DB>,
    institutionalBaseId: number,
    body: SaveInstitutionalBaseBody,
    interventionPrograms: InterventionModelProgramItem[],
    volunteerActivities: VolunteerActivityItem[],
  ): Promise<void> {
    const now = new Date();

    await this.repeatableRepository.replaceInterventionModelPrograms(
      institutionalBaseId,
      interventionPrograms.map((item) =>
        buildInterventionModelProgramItem(item, institutionalBaseId, now),
      ),
      trx,
    );

    await this.fixedRepository.replacePopulationServed(
      institutionalBaseId,
      body.populationServed.map((item) =>
        buildPopulationServedItem(item, institutionalBaseId, now),
      ),
      trx,
    );

    await this.fixedRepository.replaceOperativeTeam(
      institutionalBaseId,
      body.operativeTeam.map((item) => buildOperativeTeamItem(item, institutionalBaseId, now)),
      trx,
    );

    await this.repeatableRepository.replaceVolunteerActivities(
      institutionalBaseId,
      volunteerActivities.map((item) => buildVolunteerActivityItem(item, institutionalBaseId, now)),
      trx,
    );
  }
}
