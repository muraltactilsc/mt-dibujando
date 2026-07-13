import { Injectable } from '@nestjs/common';
import type { Selectable } from 'kysely';
import type { InstitutionalBaseData } from '@dibujando/shared';
import type { Institutionalbase } from '../../../../db/types';
import { isOSCProfileReadOnly } from '../../../shared/osc-profile-lock';
import { InstitutionalBaseFixedRepository } from '../infrastructure/institutional-base-fixed.repository';
import { InstitutionalBaseRepeatableRepository } from '../infrastructure/institutional-base-repeatable.repository';
import { InstitutionalBaseRepository } from '../infrastructure/institutional-base.repository';
import { userProfileNotFound } from '../presentation/institutional-base-error.exception';
import { mapToInstitutionalBaseData } from './institutional-base.mapper';

@Injectable()
export class InstitutionalBaseService {
  constructor(
    private readonly repository: InstitutionalBaseRepository,
    private readonly repeatableRepository: InstitutionalBaseRepeatableRepository,
    private readonly fixedRepository: InstitutionalBaseFixedRepository,
  ) {}

  async getInstitutionalBase(
    userProfileId: number,
    oscProfileId?: number,
  ): Promise<InstitutionalBaseData> {
    const userProfile = await this.repository.findUserProfileById(userProfileId);

    if (!userProfile) {
      throw userProfileNotFound();
    }

    const oscProfile = await this.repository.findActiveOSCProfileByUserProfileId(userProfileId);
    const institutionalBase = oscProfileId
      ? await this.findWithFallback(userProfileId, oscProfileId)
      : await this.repository.findInstitutionalBaseByUserProfileId(userProfileId);

    const [
      ageGroups,
      personalSituations,
      interventionModelPrograms,
      populationServed,
      operativeTeam,
      volunteerActivities,
    ] = await Promise.all([
      this.repository.findActiveAgeGroups(),
      this.repository.findActivePersonalSituations(),
      institutionalBase
        ? this.repeatableRepository.findInterventionModelProgramsByInstitutionalBaseId(
            institutionalBase.institutionalbaseid,
          )
        : Promise.resolve([]),
      institutionalBase
        ? this.fixedRepository.findPopulationServedByInstitutionalBaseId(
            institutionalBase.institutionalbaseid,
          )
        : Promise.resolve([]),
      institutionalBase
        ? this.fixedRepository.findOperativeTeamByInstitutionalBaseId(
            institutionalBase.institutionalbaseid,
          )
        : Promise.resolve([]),
      institutionalBase
        ? this.repeatableRepository.findVolunteerActivitiesByInstitutionalBaseId(
            institutionalBase.institutionalbaseid,
          )
        : Promise.resolve([]),
    ]);

    return mapToInstitutionalBaseData(
      institutionalBase,
      userProfileId,
      oscProfile?.oscprofileid,
      ageGroups,
      personalSituations,
      interventionModelPrograms,
      populationServed,
      operativeTeam,
      volunteerActivities,
      isOSCProfileReadOnly(oscProfile?.dynamicsoscstatusid),
    );
  }

  private async findWithFallback(
    userProfileId: number,
    oscProfileId: number,
  ): Promise<Selectable<Institutionalbase> | null | undefined> {
    const byBoth = await this.repository.findInstitutionalBaseByUserProfileIdAndOSCProfileId(
      userProfileId,
      oscProfileId,
    );

    return byBoth ?? this.repository.findInstitutionalBaseByUserProfileId(userProfileId);
  }
}
