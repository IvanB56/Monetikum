import type { ReactElement } from 'react';

import { render, type RenderOptions } from '@testing-library/react';

import { AppMantineProvider } from '@shared/config/mantine-provider';

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AppMantineProvider, ...options });
}
