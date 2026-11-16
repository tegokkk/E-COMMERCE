'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CounterFilters } from './CounterFilters';
import { CounterCard } from './CounterCard';
import { CounterDetailDialog } from './CounterDetailDialog';
import { useCounters } from '../hooks/useCounters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { trackEvent } from '@/features/analytics/track-event';

export function CounterDirectory({ initialData, initialProviders = [], initialLocations = [], initialSearch = '' }) {
  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const [providerId, setProviderId] = useState('');
  const [locationId, setLocationId] = useState('');
  const selectedLocation = initialLocations.find((location) => location.id === locationId);
  const regionId = selectedLocation?.regionId || '';
  const [page, setPage] = useState(1);

  const [activeCounter, setActiveCounter] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const filters = {
    q: debouncedSearch,
    providerId,
    regionId,
    province: selectedLocation?.province || '',
    city: selectedLocation?.city || '',
    page,
    limit: 12,
  };

  const { data, isLoading, isError, refetch } = useCounters(filters, initialData);

  const counters = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };
  const hasActiveFilters = Boolean(debouncedSearch || providerId || locationId);

  // Track search & filter events
  const prevSearch = useRef(debouncedSearch);
  useEffect(() => {
    if (debouncedSearch && debouncedSearch !== prevSearch.current) {
      trackEvent('search_used');
      prevSearch.current = debouncedSearch;
    }
  }, [debouncedSearch]);

  const handleProviderChange = (newProviderId) => {
    setProviderId(newProviderId);
    setPage(1);
    trackEvent('filter_applied', { providerId: newProviderId, regionId });
  };

  const handleLocationChange = (newLocationId) => {
    setLocationId(newLocationId);
    setPage(1);
    const location = initialLocations.find((item) => item.id === newLocationId);
    trackEvent('filter_applied', { providerId, regionId: location?.regionId || '' });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setProviderId('');
    setLocationId('');
    setPage(1);
  };

  const handleOpenDetail = (counter) => {
    setActiveCounter(counter);
    setIsDetailOpen(true);
    trackEvent('counter_detail_opened', { counterId: counter.id, source: 'directory_card' });
  };

  const handleDetailOpenChange = (nextOpen) => {
    setIsDetailOpen(nextOpen);
    if (!nextOpen) setActiveCounter(null);
  };

  return (
    <section id="direktori" className="scroll-mt-24 flex flex-col gap-8">
      {/* Filters Bar */}
      <CounterFilters
        searchQuery={searchInput}
        onSearchChange={(value) => { setSearchInput(value); setPage(1); }}
        selectedProviderId={providerId}
        onProviderChange={handleProviderChange}
        selectedLocationId={locationId}
        onLocationChange={handleLocationChange}
        providers={initialProviders}
        locations={initialLocations}
        totalResults={meta.total}
        onResetFilters={handleResetFilters}
      />

      {/* Counter Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-card p-4 border border-line flex flex-col gap-3">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="Gagal Memuat Direktori"
          message="Tidak dapat mengambil daftar konter. Silakan periksa koneksi Anda."
          onRetry={refetch}
        />
      ) : counters.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon="search"
            title="Tidak Ada Konter yang Sesuai"
            description="Coba ubah kata kunci pencarian, atau pilih provider dan wilayah lain."
            actionLabel="Reset Semua Filter"
            onAction={handleResetFilters}
          />
        ) : (
          <EmptyState
            icon="store"
            title="Belum Ada Konter Terdaftar"
            description="Saat ini belum ada data konter yang diterbitkan di direktori. Silakan kembali lagi nanti atau daftarkan konter Anda."
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counters.map((counter) => (
            <CounterCard
              key={counter.id}
              counter={counter}
              onOpenDetail={handleOpenDetail}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Sebelumnya
          </Button>
          <span className="text-xs font-semibold text-content px-3 py-1 bg-surface rounded-[8px] border border-line">
            Halaman {page} dari {meta.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
          >
            Selanjutnya
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      {isDetailOpen && activeCounter && (
        <CounterDetailDialog
          counter={activeCounter}
          open={isDetailOpen}
          onOpenChange={handleDetailOpenChange}
          initialProviderId={providerId}
        />
      )}
    </section>
  );
}

