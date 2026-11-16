import React from 'react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CounterPackagesScreen } from './CounterPackagesScreen';
import { apiClient } from '@/lib/api-client';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/lib/api-client', () => ({ apiClient: vi.fn() }));

const counters = {
  a: { id: 'a', name: 'Konter A', publicationStatus: 'published' },
  b: { id: 'b', name: 'Konter B', publicationStatus: 'published' },
  draft: { id: 'draft', name: 'Konter Draft', publicationStatus: 'draft' },
};
const packageA = { id: 'package-a', counterId: 'a', name: 'Paket A', providerId: 'provider', providerName: 'Provider Uji', quotaSummary: '10 GB', activePeriod: '30 Hari', price: 25000, publicationStatus: 'draft', availabilityStatus: 'available' };

function renderScreen(props) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } });
  const view = render(<QueryClientProvider client={client}><CounterPackagesScreen {...props} /></QueryClientProvider>);
  return { ...view, show: (next) => view.rerender(<QueryClientProvider client={client}><CounterPackagesScreen {...next} /></QueryClientProvider>) };
}

beforeEach(() => {
  push.mockReset();
  apiClient.mockReset();
  apiClient.mockImplementation(async (endpoint, options = {}) => {
    if (endpoint === '/admin/providers') return { data: [{ id: 'provider', name: 'Provider Uji', isActive: true }] };
    const counterMatch = endpoint.match(/^\/admin\/counters\/([^/]+)$/);
    if (counterMatch) return { data: counters[counterMatch[1]] };
    if (options.method === 'POST' || options.method === 'PATCH') return { data: packageA };
    if (endpoint === '/admin/counters/a/packages/package-b') throw new Error('Paket tidak ditemukan');
    if (endpoint === '/admin/counters/a/packages/package-a') return { data: packageA };
    if (endpoint.startsWith('/admin/counters/a/packages')) return { data: [packageA], meta: { total: 1, totalPages: 1 } };
    if (endpoint.startsWith('/admin/counters/b/packages')) return { data: [], meta: { total: 0, totalPages: 1 } };
    throw new Error(`Unexpected request ${endpoint}`);
  });
});
afterEach(cleanup);

describe('Counter package workflow', () => {
  it('switches counters without retaining the previous counter packages or search', async () => {
    const view = renderScreen({ counterId: 'a' });
    await screen.findByRole('heading', { name: 'Paket Konter A' });
    await screen.findAllByText('Paket A');
    fireEvent.change(screen.getByLabelText('Cari paket'), { target: { value: 'Paket A' } });
    await waitFor(() => expect(apiClient).toHaveBeenCalledWith(expect.stringContaining('/admin/counters/a/packages?q=Paket+A')));
    view.show({ counterId: 'b' });
    await screen.findByRole('heading', { name: 'Paket Konter B' });
    await screen.findByText('Belum ada paket untuk konter ini');
    expect(screen.queryByText('Paket A')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Cari paket')).toHaveValue('');
  });

  it('locks the owner, submits to its nested endpoint, and returns to the same counter', async () => {
    renderScreen({ counterId: 'a', isNew: true });
    const owner = await screen.findByLabelText('Konter Pemilik');
    expect(owner).toHaveValue('Konter A');
    expect(owner).toHaveAttribute('readonly');
    expect(screen.queryByLabelText(/Pilih Konter/)).not.toBeInTheDocument();
    await screen.findByRole('option', { name: 'Provider Uji' });
    fireEvent.change(screen.getByLabelText(/Pilih Provider/), { target: { value: 'provider' } });
    fireEvent.change(screen.getByLabelText(/Nama Paket/), { target: { value: 'Paket Baru A' } });
    fireEvent.change(screen.getByLabelText(/Harga/), { target: { value: '30000' } });
    fireEvent.change(screen.getByLabelText(/Ringkasan Kuota/), { target: { value: '15 GB' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Draft' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/konter/a/paket'));
    const call = apiClient.mock.calls.find(([, options]) => options?.method === 'POST');
    expect(call[0]).toBe('/admin/counters/a/packages');
    expect(JSON.parse(call[1].body)).toMatchObject({ name: 'Paket Baru A', price: 30000, providerId: 'provider', publicationStatus: 'draft' });
    expect(JSON.parse(call[1].body)).not.toHaveProperty('counterId');
  });

  it('returns cancellation to the owner list without relying on browser history', async () => {
    renderScreen({ counterId: 'a', packageId: 'package-a' });
    fireEvent.click(await screen.findByRole('button', { name: 'Batal' }));
    expect(push).toHaveBeenCalledWith('/admin/konter/a/paket');
  });

  it('does not expose a form for another counter package or an unpublished new owner', async () => {
    const view = renderScreen({ counterId: 'a', packageId: 'package-b' });
    await screen.findByText('Paket tidak ditemukan');
    expect(screen.queryByLabelText(/Nama Paket/)).not.toBeInTheDocument();
    view.show({ counterId: 'draft', isNew: true });
    await screen.findByText(/Terbitkan konter terlebih dahulu/);
    expect(screen.queryByLabelText(/Nama Paket/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Terbitkan Sekarang' })).not.toBeInTheDocument();
  });

  it('retains form values when saving fails', async () => {
    renderScreen({ counterId: 'a', isNew: true });
    await screen.findByRole('option', { name: 'Provider Uji' });
    fireEvent.change(screen.getByLabelText(/Nama Paket/), { target: { value: 'Tetap Tersimpan' } });
    apiClient.mockImplementation(async () => { throw new Error('Koneksi gagal'); });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Draft' }));
    await screen.findByText('Koneksi gagal');
    expect(screen.getByLabelText(/Nama Paket/)).toHaveValue('Tetap Tersimpan');
    expect(push).not.toHaveBeenCalled();
  });

  it('preserves the exact existing cutoff when only another field is edited', async () => {
    const original = '2028-01-02T12:34:56.789Z';
    const normalApi = apiClient.getMockImplementation();
    apiClient.mockImplementation((endpoint, options) => endpoint === '/admin/counters/a/packages/package-a' && !options?.method
      ? Promise.resolve({ data: { ...packageA, displayUntil: original } })
      : normalApi(endpoint, options));
    renderScreen({ counterId: 'a', packageId: 'package-a' });
    await screen.findByRole('option', { name: 'Provider Uji' });
    fireEvent.change(screen.getByLabelText(/Harga/), { target: { value: '36000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan & Terbitkan' }));
    await waitFor(() => expect(push).toHaveBeenCalledWith('/admin/konter/a/paket'));
    const update = apiClient.mock.calls.find(([, options]) => options?.method === 'PATCH');
    expect(JSON.parse(update[1].body)).toMatchObject({ price: 36000, displayUntil: original });
  });
});
