import { useQuery } from '@tanstack/react-query';
import type { Country } from '@dibujando/shared';
import { catalogsApi } from './catalogs.api';

export const catalogsQueryKeys = {
  countries: ['catalogs', 'countries'] as const,
};

export function useCountriesQuery() {
  return useQuery<Country[], Error>({
    queryKey: catalogsQueryKeys.countries,
    queryFn: () => catalogsApi.getCountries(),
  });
}
