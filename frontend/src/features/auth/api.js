import { apiClient, clearCsrfToken, setCsrfToken } from '@/lib/api-client';

export async function login(email, password) {
  const response = await apiClient('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (response?.data?.csrfToken) {
    setCsrfToken(response.data.csrfToken);
  }
  return response;
}

export async function getMe() {
  return apiClient('/auth/me');
}

export async function logout() {
  try {
    await apiClient('/auth/logout', { method: 'POST' });
  } finally {
    clearCsrfToken();
  }
}

