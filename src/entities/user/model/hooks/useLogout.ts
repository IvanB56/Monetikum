'use client';

import {signOut} from 'next-auth/react';

import {useMutation, useQueryClient} from '@tanstack/react-query';

import {logoutSanctumSessionAction} from '../actions/logout-session';
import {USER_QUERY_KEY} from '../api/user-query-key';

/**
 * Логаут — двухшаговая мутация, симметричная BFF-логину: сначала серверный
 * `logoutSanctumSessionAction()` инвалидирует Sanctum-сессию на backend, затем
 * клиентский `signOut()` (`next-auth/react`, как и `signIn()` в
 * `useCredentialsSignIn`) очищает next-auth JWT. `redirect: false` — навигация
 * после логаута решается вызывающим UI, а не самой сущностью.
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await logoutSanctumSessionAction();
      await signOut({ redirect: false });
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: USER_QUERY_KEY });
    },
  });
}
