'use client';

import React from 'react';
import { formatRupiah, formatDate } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { ContactButton } from './ContactButton';
import { AVAILABILITY_STATUS, AVAILABILITY_STATUS_LABELS } from '@konter/shared';

export function PackageCard({ pkg, counterId, onPackageUnavailable, isDemo = false }) {
  const isNeedsConfirmation = pkg.availabilityStatus === AVAILABILITY_STATUS.NEEDS_CONFIRMATION;

  return (
    <div className="bg-surface rounded-card p-4 md:p-5 border border-line shadow-card flex flex-col justify-between gap-4 transition-all hover:border-brand-ink/40">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold text-brand-ink uppercase tracking-wider bg-brand-soft px-2 py-0.5 rounded-full">
              {pkg.providerName}
            </span>
            {isNeedsConfirmation && (
              <Badge variant="warning" size="sm">
                {AVAILABILITY_STATUS_LABELS[pkg.availabilityStatus]}
              </Badge>
            )}
          </div>
          <h4 className="text-base font-bold text-content leading-snug">{pkg.name}</h4>
        </div>
        <div className="text-right shrink-0">
          <span className="text-lg md:text-xl font-extrabold text-content block">
            {formatRupiah(pkg.price)}
          </span>
          <span className="text-xs text-content-muted block">{pkg.activePeriod}</span>
        </div>
      </div>

      {/* Quota details */}
      <div className="bg-surface-soft rounded-control p-3.5 border border-line/40">
        <div className="text-xl font-black text-content tracking-tight">
          {pkg.quotaSummary}
        </div>
        {pkg.quotaDetails && (
          <p className="text-xs text-content-muted leading-relaxed mt-1">{pkg.quotaDetails}</p>
        )}
      </div>

      {/* Terms and Footer CTA */}
      <div className="flex flex-col gap-3 pt-2 border-t border-line/60">
        {pkg.terms && (
          <p className="text-xs text-content-muted leading-relaxed line-clamp-2" title={pkg.terms}>
            <span className="font-semibold text-content">Syarat:</span> {pkg.terms}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs text-content-muted">
            Diperbarui {formatDate(pkg.updatedAt)}
          </span>
          <ContactButton
            counterId={counterId}
            packageId={pkg.id}
            label={isDemo ? 'Kontak contoh' : isNeedsConfirmation ? 'Tanya Stok' : 'Tanya Paket'}
            disabled={isDemo}
            variant="whatsapp"
            size="sm"
            buttonPosition="package_card"
            onPackageUnavailable={onPackageUnavailable}
          />
        </div>
      </div>
    </div>
  );
}

