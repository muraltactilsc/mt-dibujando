import type { Country } from '@dibujando/shared';
import { apiGet } from './client';

interface SuccessEnvelope<T> {
  success: true;
  data: T;
}

export const catalogsApi = {
  getCountries: async (): Promise<Country[]> => {
    const response = await apiGet<SuccessEnvelope<Country[]>>('/api/catalogs/countries');
    return response.data;
  },
};
