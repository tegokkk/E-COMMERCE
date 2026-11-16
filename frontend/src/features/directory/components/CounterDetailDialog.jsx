'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useCounterDetail } from '../hooks/useCounterDetail';
import { PackageCard } from './PackageCard';
import { ContactButton } from './ContactButton';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { isAllowedMapUrl } from '@konter/shared';

export function CounterDetailDialog({ counter, open, onOpenChange, initialProviderId = '' }) {
  const [selectedProviderId, setSelectedProviderId] = useState(initialProviderId);
  const [failedPhotoUrl, setFailedPhotoUrl] = useState(null);

  const {
    data: detailData,
    isLoading,
    isError,
    refetch,
  } = useCounterDetail(counter?.id, selectedProviderId);

  if (!counter) return null;

  const detail = detailData?.data || counter;
  const packages = detailData?.data?.packages || [];
  const rawPhotoUrl = detail.photoUrl;
  const photoSrc = rawPhotoUrl && failedPhotoUrl !== rawPhotoUrl ? rawPhotoUrl : '/images/counter-placeholder.svg';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={detail.name}
        description={`Katalog kuota dan profil konter ${detail.name}`}
        maxWidth="max-w-3xl"
      >
        <div className="flex flex-col gap-6">
          {/* Header Store Profile Banner */}
          <div className="flex flex-col md:flex-row gap-5 items-start bg-surface-soft p-4 rounded-card border border-line">
            <div className="relative w-full md:w-36 h-32 md:h-32 rounded-[12px] overflow-hidden bg-surface-muted shrink-0">
              <Image
                src={photoSrc}
                alt={detail.name}
                fill
                sizes="(max-width: 768px) 100vw, 150px"
                className="object-cover"
                onError={() => {
                  if (rawPhotoUrl) setFailedPhotoUrl(rawPhotoUrl);
                }}
              />
            </div>

            <div className="flex-1 flex flex-col justify-between gap-3 w-full">
              <div>
                <h3 className="text-xl font-bold text-content">{detail.name}</h3>
                {detail.isDemo && (
                  <p className="text-xs font-bold text-warning-ink mt-1">
                    Data contoh. Harga, alamat, dan kontak bukan penawaran nyata.
                  </p>
                )}
                {detail.description && (
                  <p className="text-xs text-content-muted mt-1 leading-relaxed">
                    {detail.description}
                  </p>
                )}

                <div className="flex flex-col gap-1.5 mt-3 text-xs text-content-muted">
                  <div className="flex items-start gap-2">
                    <Icon name="map_pin" size={16} className="text-brand-ink shrink-0 mt-0.5" />
                    <span>
                      {detail.address}
                      {[detail.city, detail.province].filter(Boolean).length > 0 ? ` • ${[detail.city, detail.province].filter(Boolean).join(', ')}` : ''}
                      {detail.regionName ? ` (${detail.regionName})` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Icon name="clock" size={16} className="text-brand-ink shrink-0" />
                    <span>
                      {detail.operatingHours || 'Hubungi konter untuk jam operasional'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line/60">
                {!detail.isDemo && detail.mapUrl && isAllowedMapUrl(detail.mapUrl) && (
                  <Button
                    variant="outline"
                    size="sm"
                    href={detail.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    icon="external_link"
                  >
                    Buka Peta
                  </Button>
                )}
                <ContactButton
                  counterId={detail.id}
                  label={detail.isDemo ? 'Kontak contoh' : 'Hubungi Konter'}
                  disabled={detail.isDemo}
                  variant="whatsapp"
                  size="sm"
                  buttonPosition="detail_modal_header"
                />
              </div>
            </div>
          </div>

          {/* Package Catalog Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-base font-bold text-content flex items-center gap-2">
                <Icon name="package" size={20} className="text-brand-ink" />
                <span>Pilihan Paket Kuota</span>
                <span className="text-xs font-normal text-content-muted">
                  ({packages.length} paket ditampilkan)
                </span>
              </h4>

              {/* Filter Provider Chip Inside Dialog */}
              {selectedProviderId && (
                <button
                  type="button"
                  onClick={() => setSelectedProviderId('')}
                  className="text-xs text-brand-ink hover:underline font-semibold flex items-center gap-1 min-h-[44px]"
                >
                  <Icon name="close" size={14} />
                  <span>Tampilkan Semua Provider</span>
                </button>
              )}
            </div>

            {/* Packages State */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-44" />
                <Skeleton className="h-44" />
              </div>
            ) : isError ? (
              <ErrorState
                title="Gagal Memuat Paket"
                message="Terjadi kendala saat mengambil paket kuota konter ini."
                onRetry={refetch}
              />
            ) : packages.length === 0 ? (
              <div className="bg-surface-muted rounded-card p-6 text-center text-sm text-content-muted">
                Belum ada paket kuota yang sesuai dengan filter ini.
                {selectedProviderId && (
                  <div className="mt-3 flex justify-center">
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => setSelectedProviderId('')}
                    >
                      Reset Filter Provider
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    pkg={pkg}
                    counterId={detail.id}
                    onPackageUnavailable={refetch}
                    isDemo={detail.isDemo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

