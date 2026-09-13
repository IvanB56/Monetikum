import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@shared/lib/test';

import { AuthorizationSwitcher } from './authorization-switcher';

const routerReplaceMock = vi.hoisted(() => vi.fn());
const searchParamsMock = vi.hoisted(() => ({ current: new URLSearchParams() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
  usePathname: () => '/authorization',
  useSearchParams: () => searchParamsMock.current,
}));

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

// `@shared/config/auth` calls NextAuth(...) at module load — under Vitest's
// Vite-based ESM resolver (unlike Next.js's webpack build) next-auth's own
// `next/server` subpath import fails to resolve without an `exports` field
// on Next.js's package.json (see the `@ts-expect-error` comment in
// next-auth/lib/env.js). Mocked here purely to satisfy that import chain.
vi.mock('next-auth', () => ({
  default: () => ({ handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }),
}));
vi.mock('next-auth/providers/credentials', () => ({
  default: (config: unknown) => config,
}));

describe('AuthorizationSwitcher', () => {
  beforeEach(() => {
    routerReplaceMock.mockClear();
    searchParamsMock.current = new URLSearchParams();
  });

  it('показывает заглушку выбора роли и не рендерит формы без query-параметра role', () => {
    renderWithProviders(<AuthorizationSwitcher />);

    expect(screen.getByText('Вы родитель или ребёнок?')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Телефон')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Логин')).not.toBeInTheDocument();
  });

  it('рендерит только StudentLoginForm для role=Student, без вкладок режима', async () => {
    searchParamsMock.current = new URLSearchParams('role=Student');

    renderWithProviders(<AuthorizationSwitcher />);

    expect(await screen.findByLabelText('Логин')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByText('Зарегистрироваться')).not.toBeInTheDocument();
  });

  it('рендерит вкладки Войти/Зарегистрироваться для role=Sponsor с активной вкладкой Войти по умолчанию', async () => {
    searchParamsMock.current = new URLSearchParams('role=Sponsor');

    renderWithProviders(<AuthorizationSwitcher />);

    expect(screen.getByRole('tab', { name: 'Войти' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Зарегистрироваться' })).toHaveAttribute('aria-selected', 'false');
    expect(await screen.findByLabelText('Телефон')).toBeInTheDocument();
  });

  it('активирует вкладку Зарегистрироваться для role=Sponsor&mode=register', async () => {
    searchParamsMock.current = new URLSearchParams('role=Sponsor&mode=register');

    renderWithProviders(<AuthorizationSwitcher />);

    expect(screen.getByRole('tab', { name: 'Зарегистрироваться' })).toHaveAttribute('aria-selected', 'true');
    expect(await screen.findByLabelText('Имя')).toBeInTheDocument();
  });

  it('обновляет URL через router.replace при выборе роли в SegmentedControl', () => {
    renderWithProviders(<AuthorizationSwitcher />);

    screen.getByRole('radio', { name: 'Я ребёнок' }).click();

    expect(routerReplaceMock).toHaveBeenCalledWith('/authorization?role=Student', { scroll: false });
  });
});
