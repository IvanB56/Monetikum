'use client';

import { ReactNode, useState } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { getQueryClient } from './query-client';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
