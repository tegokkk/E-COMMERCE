let cachedCsrfToken = null;

export async function fetchCsrfToken() {
  try {
    const res = await fetch('/api/v1/auth/csrf', {
      method: 'GET',
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      cachedCsrfToken = data.data?.csrfToken || null;
      return cachedCsrfToken;
    }
  } catch (err) {
    console.error('Gagal mengambil token CSRF:', err);
  }
  return null;
}

export function clearCsrfToken() {
  cachedCsrfToken = null;
}

export function setCsrfToken(token) {
  cachedCsrfToken = token || null;
}

export async function apiClient(endpoint, options = {}, isRetry = false) {
  const url = endpoint.startsWith('/api/v1') ? endpoint : `/api/v1${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  const headers = new Headers(options.headers || {});

  // Semua pemanggil JSON mengirim string; body biner memakai tipe aslinya.
  if (typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Jika method adalah mutasi (POST, PATCH, PUT, DELETE), sertakan token CSRF
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    if (!cachedCsrfToken) {
      await fetchCsrfToken();
    }
    if (cachedCsrfToken) {
      headers.set('X-CSRF-Token', cachedCsrfToken);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  // Jika token CSRF ditolak (misalnya karena sesi login diperbarui atau kadaluarsa),
  // refresh token CSRF lalu coba ulang request 1 kali secara otomatis.
  if (response.status === 403 && !isRetry) {
    const msg = (data?.error?.message || data?.message || '').toLowerCase();
    if (msg.includes('csrf')) {
      cachedCsrfToken = null;
      await fetchCsrfToken();
      return apiClient(endpoint, options, true);
    }
  }

  if (!response.ok) {
    const error = new Error(data?.error?.message || data?.message || 'Terjadi kesalahan pada server');
    error.status = response.status;
    error.code = data?.error?.code || 'UNKNOWN_ERROR';
    error.fields = data?.error?.fields || null;
    throw error;
  }

  return data;
}

