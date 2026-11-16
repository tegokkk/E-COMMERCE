'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fetchContact } from '../api';
import { trackEvent } from '@/features/analytics/track-event';

export function ContactButton({
  counterId,
  packageId = null,
  label = 'Hubungi',
  variant = 'whatsapp',
  size = 'md',
  buttonPosition = 'counter_card',
  className = '',
  disabled = false,
  onPackageUnavailable,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleContact = async (e) => {
    e.stopPropagation();
    setLoading(true);
    setErrorMessage('');

    try {
      const result = await fetchContact(counterId, packageId);
      const url = result?.data?.whatsappUrl;

      // Track event non-blocking
      trackEvent('whatsapp_clicked', {
        counterId,
        packageId,
        buttonPosition,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (err) {
      if (err.code === 'PACKAGE_UNAVAILABLE') {
        setErrorMessage('Paket sudah tidak tersedia.');
        if (onPackageUnavailable) onPackageUnavailable();
      } else {
        setErrorMessage(err.message || 'Gagal menghubungi konter.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 w-full sm:w-auto">
      <Button
        variant={variant}
        size={size}
        icon="whatsapp"
        loading={loading}
        disabled={disabled}
        title={disabled ? 'Data contoh tidak dapat dihubungi' : undefined}
        onClick={handleContact}
        className={className}
      >
        {loading ? 'Menyiapkan WhatsApp...' : label}
      </Button>
      {errorMessage && (
        <span className="text-xs text-danger-ink font-medium mt-1 text-center">
          {errorMessage}
        </span>
      )}
    </div>
  );
}

