import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@shared/lib/test';

import { Header } from './header';

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

// Desktop/mobile-верстка переключается CSS-медиазапросом (header.module.scss),
// а не JS-хуком — оба варианта всегда в DOM. jsdom не умеет вычислять реальные
// @media по ширине экрана, поэтому .desktopOnly в тестах всегда визуально
// скрыт — отсюда { hidden: true }, тест проверяет структуру разметки, а не
// видимость (за визуальным переключением следит Playwright/e2e).
describe('Header', () => {
  it('рендерит десктопные кнопки «Войти» и «Регистрация» как ссылки на /authorization', () => {
    renderWithProviders(<Header />);

    const loginLink = screen.getByRole('link', { name: 'Войти', hidden: true });
    expect(loginLink).toHaveAttribute('href', '/authorization');

    const registerLink = screen.getByRole('link', { name: 'Регистрация', hidden: true });
    expect(registerLink).toHaveAttribute('href', '/authorization?role=Sponsor&mode=register');
  });

  it('рендерит мобильную кнопку-иконку меню', () => {
    renderWithProviders(<Header />);

    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });
});
