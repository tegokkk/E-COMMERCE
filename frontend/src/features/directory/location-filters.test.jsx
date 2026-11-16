import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CounterDirectory } from './components/CounterDirectory';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({ apiClient: vi.fn() }));
vi.mock('@/features/analytics/track-event', () => ({ trackEvent: vi.fn() }));

const counterA = { id: 'a', name: 'Konter Alpha', address: 'Jalan Alpha', city: 'Kota Kembar', province: 'Alpha', providers: [], minPrice: 25000, hasPublicPackages: true };
const counterB = { ...counterA, id: 'b', name: 'Konter Beta', province: 'Beta' };
const initialData = { data: [counterA, counterB], meta: { total: 2, totalPages: 1 } };
const locations = [
  { id: 'province:alpha', name: 'Alpha (Provinsi)', type: 'province', province: 'Alpha' },
  { id: 'city:alpha:kembar', name: 'Kota Kembar · Alpha', type: 'city', city: 'Kota Kembar', province: 'Alpha' },
  { id: 'region-id', name: 'Wilayah Lama', type: 'region', regionId: 'region-id' },
];

function showDirectory() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(<QueryClientProvider client={client}><CounterDirectory initialData={initialData} initialLocations={locations} initialProviders={[{ id: 'provider', name: 'Provider Uji' }]} /></QueryClientProvider>);
}

beforeEach(() => {
  apiClient.mockReset();
  apiClient.mockImplementation(async (endpoint) => {
    const query = new URL(endpoint, 'http://example.test').searchParams;
    return query.has('province') || query.has('regionId')
      ? { data: [counterA], meta: { total: 1, totalPages: 1 } }
      : initialData;
  });
});
afterEach(cleanup);

describe('Public location selection', () => {
  it('waits for city-scoped data instead of showing the unfiltered initial records', async () => {
    let finish;
    apiClient.mockImplementation((endpoint) => endpoint.includes('city=')
      ? new Promise((resolve) => { finish = resolve; })
      : Promise.resolve(initialData));
    showDirectory();
    await screen.findByText('Konter Beta');
    fireEvent.change(screen.getByLabelText('Lokasi'), { target: { value: 'city:alpha:kembar' } });
    await waitFor(() => expect(finish).toBeTypeOf('function'));
    expect(screen.queryByText('Konter Beta')).not.toBeInTheDocument();
    const endpoint = apiClient.mock.calls.find(([url]) => url.includes('city='))[0];
    const params = new URL(endpoint, 'http://example.test').searchParams;
    expect(params.get('province')).toBe('Alpha');
    expect(params.get('city')).toBe('Kota Kembar');
    expect(params.get('regionId')).toBeNull();
    finish({ data: [counterA], meta: { total: 1, totalPages: 1 } });
    await screen.findByText('Konter Alpha');
    expect(screen.queryByText('Konter Beta')).not.toBeInTheDocument();
    expect(screen.getByText('Rp25.000')).toBeInTheDocument();
  });

  it('maps provinces and legacy regions to distinct API filters and resets them', async () => {
    showDirectory();
    fireEvent.change(screen.getByLabelText('Lokasi'), { target: { value: 'province:alpha' } });
    await waitFor(() => expect(apiClient).toHaveBeenCalledWith(expect.stringContaining('province=Alpha'), expect.anything()));
    fireEvent.click(screen.getByRole('button', { name: 'Provider Uji' }));
    await waitFor(() => expect(apiClient).toHaveBeenCalledWith(expect.stringMatching(/providerId=provider.*province=Alpha/), expect.anything()));
    fireEvent.change(screen.getByLabelText('Lokasi'), { target: { value: 'region-id' } });
    await waitFor(() => expect(apiClient).toHaveBeenCalledWith(expect.stringContaining('regionId=region-id'), expect.anything()));
    const endpoint = apiClient.mock.calls.findLast(([url]) => url.includes('regionId=region-id'))[0];
    expect(endpoint).not.toContain('province=');
    expect(endpoint).not.toContain('city=');
    fireEvent.click(screen.getByRole('button', { name: 'Reset Filter' }));
    expect(screen.getByLabelText('Lokasi')).toHaveValue('');
    await screen.findByText('Konter Beta');
  });
});
