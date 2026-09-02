import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@shared/lib/test';

import { Header } from './header';

// Desktop/mobile-верстка переключается CSS-медиазапросом (header.module.scss),
// а не JS-хуком — оба варианта всегда в DOM. jsdom не умеет вычислять реальные
// @media по ширине экрана, поэтому .desktopOnly в тестах всегда визуально
// скрыт — отсюда { hidden: true }, тест проверяет структуру разметки, а не
// видимость (за визуальным переключением следит Playwright/e2e).
describe('Header', () => {
  it('рендерит десктопные кнопки «Войти» и «Регистрация»', () => {
    renderWithProviders(<Header />);

    expect(screen.getByRole('button', { name: 'Войти', hidden: true })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Регистрация', hidden: true })).toBeInTheDocument();
  });

  it('рендерит мобильную кнопку-иконку меню', () => {
    renderWithProviders(<Header />);

    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument();
  });
});
