'use client';

import { ReactNode, useState } from 'react';
import { Provider } from 'react-redux';

import { $api } from '@shared/lib/api';

import { createReduxStore } from './store';

interface StoreProviderProps {
  children: ReactNode;
}

// НЕ подключён в src/app/layout.tsx — заводится вместе с первым реальным
// потребителем UI-стейта.
export function StoreProvider({ children }: StoreProviderProps) {
  const [store] = useState(() => createReduxStore({ api: $api }));

  return <Provider store={store}>{children}</Provider>;
}
