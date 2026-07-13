import { describe, expect, it } from 'vitest';
import type { GoverningBodyItem } from '@dibujando/shared';
import { validateGoverningBodyItems } from './government.validator';

function buildItem(overrides?: Partial<GoverningBodyItem>): GoverningBodyItem {
  return {
    name: 'Juan Pérez',
    position: 'Tesorero',
    memberSince: 2020,
    isMemberOfOtherBody: false,
    memberOfOtherBody: undefined,
    rfc: 'RFC123456789',
    ...overrides,
  };
}

describe('GovernmentValidator', () => {
  describe('validateGoverningBodyItems', () => {
    it('drops an all-empty unsaved row and returns the list-level required error', () => {
      const items: GoverningBodyItem[] = [
        {
          name: '',
          position: '',
          memberSince: undefined,
          isMemberOfOtherBody: undefined,
          memberOfOtherBody: undefined,
          rfc: '',
        },
      ];

      const result = validateGoverningBodyItems(items, true);

      expect(result.errors).toContain(
        'Se requiere ingresar al menos un miembro de su Patronato o Consejo',
      );
      expect(result.validItems).toHaveLength(0);
    });

    it('returns specific errors for a partially filled row and does not keep it', () => {
      const items: GoverningBodyItem[] = [buildItem({ position: '', rfc: '' })];

      const result = validateGoverningBodyItems(items, true);

      expect(result.errors).toContain('El campo Cargo del miembro es requerido.');
      expect(result.errors).toContain('El campo RFC es requerido.');
      expect(result.errors).not.toContain('El campo Nombre del miembro es requerido.');
      expect(result.validItems).toHaveLength(0);
    });

    it('keeps a fully filled row and reports no errors', () => {
      const items: GoverningBodyItem[] = [buildItem()];

      const result = validateGoverningBodyItems(items, true);

      expect(result.errors).toHaveLength(0);
      expect(result.validItems).toHaveLength(1);
    });

    it('keeps an all-empty saved row and reports errors instead of silently deleting it', () => {
      const items: GoverningBodyItem[] = [
        {
          governingBodyId: 1,
          name: '',
          position: '',
          memberSince: undefined,
          isMemberOfOtherBody: undefined,
          memberOfOtherBody: undefined,
          rfc: '',
        },
      ];

      const result = validateGoverningBodyItems(items, true);

      expect(result.errors).toContain('El campo Nombre del miembro es requerido.');
      expect(result.errors).toContain('El campo Cargo del miembro es requerido.');
      expect(result.errors).toContain('El campo Miembro desde es requerido.');
      expect(result.errors).toContain(
        'Se requiere seleccionar una opción del campo ¿Participa como miembro de otro órgano de gobierno en otra organización de la sociedad civil?.',
      );
      expect(result.errors).toContain('El campo RFC es requerido.');
      expect(result.validItems).toHaveLength(0);
    });

    it('requires RFC for a Mexican OSC', () => {
      const items: GoverningBodyItem[] = [buildItem({ rfc: '' })];

      const result = validateGoverningBodyItems(items, true);

      expect(result.errors).toContain('El campo RFC es requerido.');
      expect(result.validItems).toHaveLength(0);
    });

    it('does not require RFC for a non-Mexican OSC', () => {
      const items: GoverningBodyItem[] = [buildItem({ rfc: '' })];

      const result = validateGoverningBodyItems(items, false);

      expect(result.errors).toHaveLength(0);
      expect(result.validItems).toHaveLength(1);
    });

    it('requires memberOfOtherBody when isMemberOfOtherBody is true', () => {
      const items: GoverningBodyItem[] = [
        buildItem({ isMemberOfOtherBody: true, memberOfOtherBody: '' }),
      ];

      const result = validateGoverningBodyItems(items, true);

      expect(result.errors).toContain(
        'El campo En caso de participar en otro órgano de gobierno de otra organización, escriba el nombre de la OSC y el cargo que desempeña en dicha institución es requerido.',
      );
      expect(result.validItems).toHaveLength(0);
    });

    it('allows empty memberOfOtherBody when isMemberOfOtherBody is false', () => {
      const items: GoverningBodyItem[] = [
        buildItem({ isMemberOfOtherBody: false, memberOfOtherBody: '' }),
      ];

      const result = validateGoverningBodyItems(items, true);

      expect(result.errors).toHaveLength(0);
      expect(result.validItems).toHaveLength(1);
    });

    it('silently drops an empty new row when other rows are valid', () => {
      const items: GoverningBodyItem[] = [
        buildItem(),
        {
          name: '',
          position: '',
          memberSince: undefined,
          isMemberOfOtherBody: undefined,
          memberOfOtherBody: undefined,
          rfc: '',
        },
      ];

      const result = validateGoverningBodyItems(items, true);

      expect(result.errors).toHaveLength(0);
      expect(result.validItems).toHaveLength(1);
    });
  });
});
