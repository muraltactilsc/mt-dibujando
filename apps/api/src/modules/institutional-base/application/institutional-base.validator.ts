import type { InterventionModelProgramItem, VolunteerActivityItem } from '@dibujando/shared';

const PROGRAM_NAME_REQUIRED = 'Se requiere ingresar Nombre del programa.';
const DESCRIPTION_REQUIRED = 'Se requiere ingresar Descripción.';
const MAIN_ACTIVITY_REQUIRED = 'Se requiere ingresar Principales actividades.';
const VERIFICATION_MEANS_REQUIRED = 'Se requiere ingresar Medios de Verificación.';

const INTERVENTION_REQUIRED_MESSAGES = [
  PROGRAM_NAME_REQUIRED,
  DESCRIPTION_REQUIRED,
  MAIN_ACTIVITY_REQUIRED,
  VERIFICATION_MEANS_REQUIRED,
];

const ACTIVITY_TYPE_REQUIRED = 'Se requiere ingresar Tipo de actividad que se requiere realizar.';
const IDEAL_VOLUNTEER_PROFILE_REQUIRED = 'Se requiere ingresar Perfil ideal del voluntario.';
const SPECIAL_PROVISIONS_REQUIRED =
  'Se requiere ingresar Disposiciones especiales que el voluntario deba tomar en cuenta.';

function isBlank(value: string | null | undefined): boolean {
  return value === undefined || value === null || value.trim().length === 0;
}

export function validateInterventionModelPrograms(items: InterventionModelProgramItem[]): {
  errors: string[];
  validItems: InterventionModelProgramItem[];
} {
  const errors: string[] = [];
  const validItems: InterventionModelProgramItem[] = [];

  for (const item of items) {
    const programNameBlank = isBlank(item.programName);
    const descriptionBlank = isBlank(item.description);
    const mainActivityBlank = isBlank(item.mainActivity);
    const verificationMeansBlank = isBlank(item.verificationMeans);

    const allBlank =
      programNameBlank && descriptionBlank && mainActivityBlank && verificationMeansBlank;

    if (allBlank && !item.interventionModelProgramsId) {
      continue;
    }

    if (programNameBlank) errors.push(PROGRAM_NAME_REQUIRED);
    if (descriptionBlank) errors.push(DESCRIPTION_REQUIRED);
    if (mainActivityBlank) errors.push(MAIN_ACTIVITY_REQUIRED);
    if (verificationMeansBlank) errors.push(VERIFICATION_MEANS_REQUIRED);

    if (!programNameBlank && !descriptionBlank && !mainActivityBlank && !verificationMeansBlank) {
      validItems.push(item);
    }
  }

  if (errors.length > 0) {
    return { errors: [...new Set(errors)], validItems };
  }

  if (validItems.length === 0) {
    return { errors: INTERVENTION_REQUIRED_MESSAGES, validItems: [] };
  }

  return { errors: [], validItems };
}

export function validateVolunteerActivities(items: VolunteerActivityItem[]): {
  errors: string[];
  validItems: VolunteerActivityItem[];
} {
  const errors: string[] = [];
  const validItems: VolunteerActivityItem[] = [];

  for (const item of items) {
    const activityTypeBlank = isBlank(item.activityType);
    const idealVolunteerProfileBlank = isBlank(item.idealVolunteerProfile);
    const specialProvitionsBlank = isBlank(item.specialProvitions);

    const allRequiredBlank =
      activityTypeBlank && idealVolunteerProfileBlank && specialProvitionsBlank;

    if (allRequiredBlank && !item.volunteerActivitiesId) {
      continue;
    }

    if (activityTypeBlank) errors.push(ACTIVITY_TYPE_REQUIRED);
    if (idealVolunteerProfileBlank) errors.push(IDEAL_VOLUNTEER_PROFILE_REQUIRED);
    if (specialProvitionsBlank) errors.push(SPECIAL_PROVISIONS_REQUIRED);

    if (!activityTypeBlank && !idealVolunteerProfileBlank && !specialProvitionsBlank) {
      validItems.push(item);
    }
  }

  return { errors: [...new Set(errors)], validItems };
}
