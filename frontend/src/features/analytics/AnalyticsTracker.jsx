'use client';

import { useEffect } from 'react';
import { trackEvent } from './track-event';

export function AnalyticsTracker() {
  useEffect(() => {
    try {
      const recorded = window.sessionStorage.getItem('konter_pv_recorded');
      if (!recorded) {
        trackEvent('page_view', {});
        window.sessionStorage.setItem('konter_pv_recorded', '1');
      }
    } catch {
      // Ignored
    }
  }, []);

  return null;
}

