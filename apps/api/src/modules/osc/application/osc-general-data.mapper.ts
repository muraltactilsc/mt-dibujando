import type { Selectable } from 'kysely';
import type { GeneralData } from '@dibujando/shared';
import type { Oscprofile, Userprofile } from '../../../../db/types';
import { isOSCProfileReadOnly } from '../domain/osc-profile-lock';

export function mapRowToGeneralData(
  row: Selectable<Oscprofile> | null | undefined,
  userProfile: Selectable<Userprofile>,
): GeneralData {
  const readOnly = isOSCProfileReadOnly(row?.dynamicsoscstatusid);

  if (!row) {
    return {
      oscProfileId: null,
      userProfileId: userProfile.userprofileid,
      email: userProfile.email,
      name: userProfile.institutionname,
      socialReason: null,
      oscTypeId: null,
      actionLineId: null,
      actionLineSecondaryId: null,
      nationalRegistryNumber: userProfile.nationalregistrynumber,
      financeMinistryNumber: null,
      contactName: null,
      contactPosition: null,
      contactTelephone: null,
      contactTelephoneExt: null,
      contactMobilePhone: null,
      contactEmail: null,
      countryId: userProfile.countryid,
      stateId: null,
      city: null,
      postalCode: null,
      address: null,
      reference: null,
      oscTypeConstitutionId: null,
      readOnly,
    };
  }

  return {
    oscProfileId: row.oscprofileid,
    userProfileId: row.userprofileid,
    email: row.email,
    name: row.name,
    socialReason: row.socialreason,
    oscTypeId: row.osctypeid,
    actionLineId: row.actionlineid,
    actionLineSecondaryId: row.actionlinesecondaryid,
    nationalRegistryNumber: row.nationalregistrynumber,
    financeMinistryNumber: row.financeministrynumber,
    contactName: row.contactname,
    contactPosition: row.contactposition,
    contactTelephone: row.contacttelephone,
    contactTelephoneExt: row.contacttelephoneext,
    contactMobilePhone: row.contactmobilephone,
    contactEmail: row.contactemail,
    countryId: row.countryid,
    stateId: row.stateid,
    city: row.city,
    postalCode: row.postalcode,
    address: row.address,
    reference: row.reference,
    oscTypeConstitutionId: row.osctypeconstitutionid,
    readOnly,
  };
}
