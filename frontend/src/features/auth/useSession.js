'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getMe, logout as apiLogout } from './api';

let manualLogoutInProgress = false;

export function isManualLogoutInProgress() {
  return manualLogoutInProgress;
}

export function useSession() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const logoutMutation = useMutation({
    mutationFn: () => {
      manualLogoutInProgress = true;
      return apiLogout();
    },
    onSettled: () => {
      router.replace('/admin/login?loggedOut=1');
      queryClient.clear();
      setTimeout(() => {
        manualLogoutInProgress = false;
      }, 1500);
    },
  });

  return {
    admin: data?.data || null,
    isLoading,
    isAuthenticated: !!data?.data,
    isError,
    error,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

