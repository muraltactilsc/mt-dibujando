import { describe, expect, it } from 'vitest';
import type { InterventionModelProgramItem, VolunteerActivityItem } from '@dibujando/shared';
import {
  validateInterventionModelPrograms,
  validateVolunteerActivities,
} from './institutional-base.validator';

describe('InstitutionalBaseValidator', () => {
  describe('validateInterventionModelPrograms', () => {
    it('drops an all-empty unsaved row without errors', () => {
      const items: InterventionModelProgramItem[] = [
        {
          programName: '',
          description: '',
          mainActivity: '',
          verificationMeans: '',
        },
      ];

      const result = validateInterventionModelPrograms(items);

      expect(result.errors).toContain('Se requiere ingresar Nombre del programa.');
      expect(result.validItems).toHaveLength(0);
    });

    it('returns specific errors for a partially filled row and does not keep it', () => {
      const items: InterventionModelProgramItem[] = [
        {
          programName: 'Programa',
          description: '',
          mainActivity: 'Actividad',
          verificationMeans: '',
        },
      ];

      const result = validateInterventionModelPrograms(items);

      expect(result.errors).toContain('Se requiere ingresar Descripción.');
      expect(result.errors).toContain('Se requiere ingresar Medios de Verificación.');
      expect(result.errors).not.toContain('Se requiere ingresar Nombre del programa.');
      expect(result.errors).not.toContain('Se requiere ingresar Principales actividades.');
      expect(result.validItems).toHaveLength(0);
    });

    it('keeps a fully filled row and reports no errors', () => {
      const items: InterventionModelProgramItem[] = [
        {
          programName: 'Programa',
          description: 'Descripción',
          mainActivity: 'Actividad',
          verificationMeans: 'Medios',
        },
      ];

      const result = validateInterventionModelPrograms(items);

      expect(result.errors).toHaveLength(0);
      expect(result.validItems).toHaveLength(1);
    });

    it('keeps an all-empty saved row and reports errors instead of silently deleting it', () => {
      const items: InterventionModelProgramItem[] = [
        {
          interventionModelProgramsId: 1,
          programName: '',
          description: '',
          mainActivity: '',
          verificationMeans: '',
        },
      ];

      const result = validateInterventionModelPrograms(items);

      expect(result.errors).toHaveLength(4);
      expect(result.validItems).toHaveLength(0);
    });
  });

  describe('validateVolunteerActivities', () => {
    it('drops an all-empty unsaved row without errors', () => {
      const items: VolunteerActivityItem[] = [
        {
          activityType: '',
          idealVolunteerProfile: '',
          specialProvitions: '',
        },
      ];

      const result = validateVolunteerActivities(items);

      expect(result.errors).toHaveLength(0);
      expect(result.validItems).toHaveLength(0);
    });

    it('returns specific errors for a partially filled row and does not keep it', () => {
      const items: VolunteerActivityItem[] = [
        {
          activityType: 'Tutorías',
          idealVolunteerProfile: '',
          specialProvitions: '',
        },
      ];

      const result = validateVolunteerActivities(items);

      expect(result.errors).toContain('Se requiere ingresar Perfil ideal del voluntario.');
      expect(result.errors).toContain(
        'Se requiere ingresar Disposiciones especiales que el voluntario deba tomar en cuenta.',
      );
      expect(result.errors).not.toContain(
        'Se requiere ingresar Tipo de actividad que se requiere realizar.',
      );
      expect(result.validItems).toHaveLength(0);
    });

    it('keeps a fully filled row and reports no errors', () => {
      const items: VolunteerActivityItem[] = [
        {
          activityType: 'Tutorías',
          idealVolunteerProfile: 'Estudiantes',
          specialProvitions: 'Traer identificación',
        },
      ];

      const result = validateVolunteerActivities(items);

      expect(result.errors).toHaveLength(0);
      expect(result.validItems).toHaveLength(1);
    });

    it('keeps an all-empty saved row and reports errors instead of silently deleting it', () => {
      const items: VolunteerActivityItem[] = [
        {
          volunteerActivitiesId: 1,
          activityType: '',
          idealVolunteerProfile: '',
          specialProvitions: '',
        },
      ];

      const result = validateVolunteerActivities(items);

      expect(result.errors).toHaveLength(3);
      expect(result.validItems).toHaveLength(0);
    });
  });
});
