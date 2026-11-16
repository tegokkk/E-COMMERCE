function getOrCreateSessionId() {
  if (typeof window === 'undefined' || !window.crypto?.randomUUID) return null;
  try {
    let sid = window.sessionStorage.getItem('konter_analytics_session_id');
    if (!/^sid_[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(sid || '')) {
      sid = 'sid_' + window.crypto.randomUUID();
      window.sessionStorage.setItem('konter_analytics_session_id', sid);
    }
    return sid;
  } catch {
    return null;
  }
}

export function trackEvent(eventName, properties = {}) {
  if (typeof window === 'undefined') return;

  const sessionId = getOrCreateSessionId();
  if (!sessionId) return;

  // Kirim secara non-blocking via fetch atau navigator.sendBeacon
  try {
    const payload = JSON.stringify({
      eventName,
      sessionId,
      properties,
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/v1/events', blob);
    } else {
      fetch('/api/v1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Analytics failure must NEVER disrupt user navigation
  }
}

