import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { CounterCard } from './components/CounterCard';
import { CounterFilters } from './components/CounterFilters';
import { PackageCard } from './components/PackageCard';

describe('Frontend Directory Components', () => {
  const mockCounter = {
    id: 'd0000000-0000-0000-0000-000000000001',
    name: 'Berkah Cell',
    address: 'Jl. Tamansari No. 42, Bandung Wetan',
    regionName: 'Bandung Wetan',
    whatsapp: '081234567890',
    operatingHours: '08:00 - 22:00 WIB',
    minPrice: 35000,
    hasPublicPackages: true,
    providers: [{ id: 'p1', name: 'Telkomsel' }, { id: 'p2', name: 'Indosat' }],
  };

  it('renders CounterCard with name, address, hours, and minPrice', () => {
    const onOpenDetail = vi.fn();
    render(<CounterCard counter={mockCounter} onOpenDetail={onOpenDetail} />);

    expect(screen.getByText('Berkah Cell')).toBeInTheDocument();
    expect(screen.getByText(/Jl. Tamansari No. 42/)).toBeInTheDocument();
    expect(screen.getByText('08:00 - 22:00 WIB')).toBeInTheDocument();
    expect(screen.getByText('Rp35.000')).toBeInTheDocument();
    expect(screen.getByText('Lihat Paket')).toBeInTheDocument();
    expect(screen.getByText('Hubungi')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Lihat Paket'));
    expect(onOpenDetail).toHaveBeenCalledWith(mockCounter);
  });

  it('renders counter without packages with placeholder message', () => {
    const emptyCounter = {
      ...mockCounter,
      minPrice: null,
      hasPublicPackages: false,
      providers: [],
    };
    render(<CounterCard counter={emptyCounter} onOpenDetail={() => {}} />);

    expect(screen.getByText('Informasi paket sedang diperbarui')).toBeInTheDocument();
  });

  it('renders CounterFilters with search input and provider chips', () => {
    const onSearchChange = vi.fn();
    const onProviderChange = vi.fn();

    render(
      <CounterFilters
        searchQuery=""
        onSearchChange={onSearchChange}
        selectedProviderId=""
        onProviderChange={onProviderChange}
        selectedLocationId=""
        onLocationChange={() => {}}
        providers={[{ id: 'p1', name: 'Telkomsel' }]}
        locations={[{ id: 'r1', name: 'Tamansari', regionId: 'r1' }]}
        totalResults={5}
        onResetFilters={() => {}}
      />
    );

    expect(screen.getByPlaceholderText(/Cari konter/)).toBeInTheDocument();
    expect(screen.getByText('Semua Provider')).toBeInTheDocument();
    expect(screen.getByText('Telkomsel')).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();

    fireEvent.click(screen.getByText('Telkomsel'));
    expect(onProviderChange).toHaveBeenCalledWith('p1');
  });

  it('renders PackageCard with quota, formatted price, and correct CTA', () => {
    const mockPackage = {
      id: 'pkg-1',
      name: 'InternetMAX 14 GB',
      providerName: 'Telkomsel',
      quotaSummary: '14 GB',
      quotaDetails: '10 GB Utama + 4 GB Lokal',
      activePeriod: '30 Hari',
      price: 35000,
      availabilityStatus: 'available',
      updatedAt: '2026-11-06T00:00:00.000Z',
    };

    render(
      <PackageCard
        pkg={mockPackage}
        counterId="d0000000-0000-0000-0000-000000000001"
        onPackageUnavailable={() => {}}
      />
    );

    expect(screen.getByText('InternetMAX 14 GB')).toBeInTheDocument();
    expect(screen.getByText('14 GB')).toBeInTheDocument();
    expect(screen.getByText('Rp35.000')).toBeInTheDocument();
    expect(screen.getByText('Tanya Paket')).toBeInTheDocument();
  });
});

