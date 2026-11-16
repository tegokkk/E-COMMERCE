import { apiClient } from '@/lib/api-client';

export async function fetchCounters(filters = {}, signal) {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.providerId) params.set('providerId', filters.providerId);
  if (filters.regionId) params.set('regionId', filters.regionId);
  if (filters.province) params.set('province', filters.province);
  if (filters.city) params.set('city', filters.city);
  if (filters.page) params.set('page', filters.page);
  if (filters.limit) params.set('limit', filters.limit || 12);

  const query = params.toString();
  return apiClient(`/public/counters${query ? `?${query}` : ''}`, { signal });
}

export async function fetchCounterDetail(id, providerId, signal) {
  const params = new URLSearchParams();
  if (providerId) params.set('providerId', providerId);
  const query = params.toString();
  return apiClient(`/public/counters/${id}${query ? `?${query}` : ''}`, { signal });
}

export async function fetchProviders(signal) {
  return apiClient('/public/providers', { signal });
}

export async function fetchRegions(signal) {
  return apiClient('/public/regions', { signal });
}

export async function fetchLocations(signal) {
  return apiClient('/public/locations', { signal });
}

export async function fetchContact(counterId, packageId) {
  const params = new URLSearchParams();
  params.set('counterId', counterId);
  if (packageId) params.set('packageId', packageId);
  return apiClient(`/public/contact?${params.toString()}`);
}

