import 'server-only';
import { cache } from 'react';

const internalApiUrl = (process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1').replace(/\/+$/, '');

export async function apiServer(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${internalApiUrl}${cleanEndpoint}`;

  const res = await fetch(url, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Permintaan data gagal (${res.status}).`);
  }

  return res.json();
}

export const getPublicSettings = cache(() => apiServer('/public/settings'));

