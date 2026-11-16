'use client';

import { useQuery } from '@tanstack/react-query';
import { directoryKeys } from '../query-keys';
import { fetchCounterDetail } from '../api';

export function useCounterDetail(counterId, providerId = null) {
  return useQuery({
    queryKey: directoryKeys.detail(counterId, providerId),
    queryFn: ({ signal }) => fetchCounterDetail(counterId, providerId, signal),
    enabled: !!counterId,
  });
}

