'use client';

import { useQuery } from '@tanstack/react-query';
import { directoryKeys } from '../query-keys';
import { fetchCounters } from '../api';

export function useCounters(filters = {}, initialData = null) {
  // Hanya gunakan initialData jika filters kosong / default (T07.01 & TECH_STACK 3.2)
  const isDefaultFilter = !filters.q && !filters.providerId && !filters.regionId && !filters.province && !filters.city && (!filters.page || filters.page === 1);

  return useQuery({
    queryKey: directoryKeys.counters(filters),
    queryFn: ({ signal }) => fetchCounters(filters, signal),
    initialData: isDefaultFilter ? initialData : undefined,
  });
}

