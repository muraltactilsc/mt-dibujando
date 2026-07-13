import type { GoverningBodyItem } from '@dibujando/shared';

const NAME_REQUIRED = 'El campo Nombre del miembro es requerido.';
const POSITION_REQUIRED = 'El campo Cargo del miembro es requerido.';
const MEMBER_SINCE_REQUIRED = 'El campo Miembro desde es requerido.';
const IS_MEMBER_OF_OTHER_BODY_REQUIRED =
  'Se requiere seleccionar una opción del campo ¿Participa como miembro de otro órgano de gobierno en otra organización de la sociedad civil?.';
const MEMBER_OF_OTHER_BODY_REQUIRED =
  'El campo En caso de participar en otro órgano de gobierno de otra organización, escriba el nombre de la OSC y el cargo que desempeña en dicha institución es requerido.';
const RFC_REQUIRED = 'El campo RFC es requerido.';
const GOVERNING_BODY_REQUIRED =
  'Se requiere ingresar al menos un miembro de su Patronato o Consejo';

function isBlank(value: string | null | undefined): boolean {
  return value === undefined || value === null || value.trim().length === 0;
}

export function validateGoverningBodyItems(
  items: GoverningBodyItem[],
  isMexico: boolean,
): {
  errors: string[];
  validItems: GoverningBodyItem[];
} {
  const errors: string[] = [];
  const validItems: GoverningBodyItem[] = [];

  for (const item of items) {
    const nameBlank = isBlank(item.name);
    const positionBlank = isBlank(item.position);
    const memberSinceBlank = item.memberSince === undefined || item.memberSince === null;
    const isMemberOfOtherBodyBlank =
      item.isMemberOfOtherBody === undefined || item.isMemberOfOtherBody === null;
    const rfcBlank = isBlank(item.rfc);

    const requiredBlankChecks = [
      nameBlank,
      positionBlank,
      memberSinceBlank,
      isMemberOfOtherBodyBlank,
    ];

    if (isMexico) {
      requiredBlankChecks.push(rfcBlank);
    }

    const allRequiredBlank = requiredBlankChecks.every(Boolean);

    if (allRequiredBlank && !item.governingBodyId) {
      continue;
    }

    if (nameBlank) errors.push(NAME_REQUIRED);
    if (positionBlank) errors.push(POSITION_REQUIRED);
    if (memberSinceBlank) errors.push(MEMBER_SINCE_REQUIRED);
    if (isMemberOfOtherBodyBlank) errors.push(IS_MEMBER_OF_OTHER_BODY_REQUIRED);
    if (isMexico && rfcBlank) errors.push(RFC_REQUIRED);

    const isMemberOfOtherBody = item.isMemberOfOtherBody === true;
    if (isMemberOfOtherBody && isBlank(item.memberOfOtherBody)) {
      errors.push(MEMBER_OF_OTHER_BODY_REQUIRED);
    }

    const isValid =
      !nameBlank &&
      !positionBlank &&
      !memberSinceBlank &&
      !isMemberOfOtherBodyBlank &&
      !(isMexico && rfcBlank) &&
      !(isMemberOfOtherBody && isBlank(item.memberOfOtherBody));

    if (isValid) {
      validItems.push(item);
    }
  }

  if (errors.length > 0) {
    return { errors: [...new Set(errors)], validItems };
  }

  if (validItems.length === 0) {
    return { errors: [GOVERNING_BODY_REQUIRED], validItems: [] };
  }

  return { errors: [], validItems };
}
