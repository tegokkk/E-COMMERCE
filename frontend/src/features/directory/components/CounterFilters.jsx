'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import clsx from 'clsx';

export function CounterFilters({
  searchQuery,
  onSearchChange,
  selectedProviderId,
  onProviderChange,
  selectedLocationId,
  onLocationChange,
  providers = [],
  locations = [],
  totalResults = 0,
  onResetFilters,
}) {
  const hasActiveFilters = Boolean(searchQuery || selectedProviderId || selectedLocationId);

  return (
    <div className="bg-surface rounded-panel p-5 md:p-6 border border-line shadow-card flex flex-col gap-5 w-full">
      {/* Search Input & Region Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <Input
            id="search-counter"
            label="Cari konter atau paket"
            icon="search"
            placeholder="Cari konter, paket (contoh: 10 GB), atau wilayah..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <Select
            id="select-region"
            label="Lokasi"
            placeholder="Semua Lokasi"
            value={selectedLocationId}
            onChange={(e) => onLocationChange(e.target.value)}
            options={locations.map((location) => ({ value: location.id, label: location.name }))}
          />
        </div>
      </div>

      {/* Provider Filter Chips */}
      <div className="flex flex-col gap-2 w-full min-w-0">
        <span className="text-xs font-semibold text-content-muted tracking-wide">
          Pilih Provider:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
          <button
            type="button"
            onClick={() => onProviderChange('')}
            className={clsx(
              'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer border select-none min-h-[44px] min-w-[44px]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/40 active:scale-[0.98]',
              '[@media(hover:hover)]:hover:-translate-y-0.5',
              !selectedProviderId
                ? 'bg-brand text-brand-on border-brand shadow-xs'
                : 'bg-surface-soft text-content-muted border-line hover:border-brand-ink/40 hover:text-content'
            )}
            aria-pressed={!selectedProviderId}
          >
            Semua Provider
          </button>
          {providers.map((p) => {
            const isSelected = selectedProviderId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onProviderChange(isSelected ? '' : p.id)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 shrink-0 cursor-pointer border select-none min-h-[44px] min-w-[44px] flex items-center gap-1.5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/40 active:scale-[0.98]',
                  '[@media(hover:hover)]:hover:-translate-y-0.5',
                  isSelected
                    ? 'bg-brand text-brand-on border-brand shadow-xs'
                    : 'bg-surface-soft text-content-muted border-line hover:border-brand-ink/40 hover:text-content'
                )}
                aria-pressed={isSelected}
              >
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter status & Reset CTA */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-line text-xs">
        <span className="font-medium text-content" aria-live="polite">
          Menampilkan <span className="text-brand-ink font-bold">{totalResults}</span> konter
        </span>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            icon="refresh"
            onClick={onResetFilters}
            className="text-xs text-brand-ink font-bold hover:bg-brand-soft"
          >
            Reset Filter
          </Button>
        )}
      </div>
    </div>
  );
}
