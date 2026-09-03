'use client';

import { ReactNode } from 'react';

import { MantineProvider } from '@mantine/core';

import { theme } from './theme';

interface AppMantineProviderProps {
  children: ReactNode;
}

export function AppMantineProvider({ children }: AppMantineProviderProps) {
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}
