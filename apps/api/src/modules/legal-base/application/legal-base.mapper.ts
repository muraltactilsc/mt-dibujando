import type { Selectable } from 'kysely';
import type { LegalBaseData } from '@dibujando/shared';
import type { Legalbase, Oscprofile, Userprofile } from '../../../../db/types';
import { isOSCProfileReadOnly } from '../../../shared/osc-profile-lock';

export function mapRowToLegalBaseData(
  row: Selectable<Legalbase> | null | undefined,
  userProfile: Selectable<Userprofile>,
  oscProfile: Selectable<Oscprofile> | null | undefined,
  mexicoCountryId: number | null | undefined,
): LegalBaseData {
  const isMexico = userProfile.countryid === mexicoCountryId;
  const readOnly = isOSCProfileReadOnly(oscProfile?.dynamicsoscstatusid);

  if (!row) {
    return {
      legalBaseId: null,
      userProfileId: userProfile.userprofileid,
      oscProfileId: oscProfile?.oscprofileid ?? null,
      organizationConstitutionDate: null,
      lastProtocolizationDate: null,
      isAuthorized: null,
      goubernamentalAuthorizationDate: null,
      socialObjetive: null,
      isMexico,
      readOnly,
    };
  }

  return {
    legalBaseId: row.legalbaseid,
    userProfileId: row.userprofileid,
    oscProfileId: row.oscprofileid ?? oscProfile?.oscprofileid ?? null,
    organizationConstitutionDate: row.organizationconstitutiondate,
    lastProtocolizationDate: row.lastprotocolizationdate,
    isAuthorized: row.isauthorized,
    goubernamentalAuthorizationDate: row.goubernamentalauthorizationdate,
    socialObjetive: row.socialobjetive,
    isMexico,
    readOnly,
  };
}
