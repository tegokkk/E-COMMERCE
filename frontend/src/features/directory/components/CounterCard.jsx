'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { formatRupiah } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { ContactButton } from './ContactButton';

export function CounterCard({ counter, onOpenDetail }) {
  const [failedPhotoUrl, setFailedPhotoUrl] = useState(null);
  const rawPhotoUrl = counter.photoUrl;
  const photoSrc = rawPhotoUrl && failedPhotoUrl !== rawPhotoUrl ? rawPhotoUrl : '/images/counter-placeholder.svg';

  return (
    <div
      data-testid="counter-card"
      className="bg-surface rounded-card border border-line shadow-card overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-panel hover:border-brand-ink/40 group min-w-0"
    >
      {/* Top Image Banner */}
      <div className="relative w-full h-44 bg-surface-muted overflow-hidden">
        <Image
          src={photoSrc}
          alt={`Foto konter ${counter.name}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => {
            if (rawPhotoUrl) setFailedPhotoUrl(rawPhotoUrl);
          }}
        />
        {/* Region Badge */}
        <div className="absolute top-3 left-3 max-w-[calc(100%-6.5rem)] bg-surface/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold text-content border border-line shadow-xs flex items-center gap-1">
          <Icon name="map_pin" size={14} className="text-brand-ink shrink-0" />
          <span className="truncate">{[counter.city, counter.regionName].filter(Boolean).join(', ') || counter.province || 'Indonesia'}</span>
        </div>
        {counter.isDemo && (
          <span className="absolute top-3 right-3 bg-warning-soft/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold text-warning-ink border border-warning-ink/30">
            Data contoh
          </span>
        )}
      </div>

      {/* Body Content */}
      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-content leading-tight group-hover:text-brand-ink transition-colors line-clamp-1 break-words">
            {counter.name}
          </h3>
          <p className="text-xs text-content-muted mt-1 line-clamp-2 leading-relaxed break-words">
            {counter.address}
          </p>

          {counter.operatingHours && (
            <div className="flex items-center gap-1.5 text-xs text-content-muted mt-2">
              <Icon name="clock" size={14} className="text-brand-ink/80" />
              <span>{counter.operatingHours}</span>
            </div>
          )}

          {/* Providers tag */}
          {counter.providers && counter.providers.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-3">
              {counter.providers.map((p) => (
                <span
                  key={p.id}
                  className="text-[11px] font-semibold bg-surface-muted text-content-muted px-2 py-0.5 rounded-full border border-line"
                >
                  {p.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & CTA Section */}
        <div className="pt-3 border-t border-line flex flex-col gap-3">
          {counter.hasPublicPackages && counter.minPrice ? (
            <div>
              {counter.matchedPackageName && (
                <p className="text-xs text-content-muted line-clamp-1 mb-1" title={counter.matchedPackageName}>
                  {counter.matchedPackageName}
                </p>
              )}
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs text-content-muted">{counter.priceLabel || 'Mulai dari'}</span>
                <span className="text-base md:text-lg font-extrabold text-content">
                  {formatRupiah(counter.minPrice)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-content-muted italic">
              Informasi paket sedang diperbarui
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(counter);
              }}
              className="w-full"
            >
              Lihat Paket
            </Button>
            <ContactButton
              counterId={counter.id}
              label={counter.isDemo ? 'Kontak contoh' : 'Hubungi'}
              disabled={counter.isDemo}
              variant="whatsapp"
              size="sm"
              buttonPosition="counter_card"
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

