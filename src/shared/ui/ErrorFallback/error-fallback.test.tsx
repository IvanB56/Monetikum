import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@shared/lib/test';

import { ErrorFallback } from './error-fallback';

describe('ErrorFallback', () => {
  it('показывает заголовок и подсказку без digest', () => {
    renderWithProviders(<ErrorFallback error={new Error('boom')} reset={vi.fn()} />);

    expect(screen.getByText('Что-то пошло не так')).toBeInTheDocument();
    expect(
      screen.getByText('Попробуйте повторить действие. Если ошибка повторится, сообщите нам об этом.'),
    ).toBeInTheDocument();
  });

  it('показывает код ошибки, если у error есть digest', () => {
    const error = Object.assign(new Error('boom'), { digest: 'abc123' });

    renderWithProviders(<ErrorFallback error={error} reset={vi.fn()} />);

    expect(screen.getByText(/Код ошибки: abc123/)).toBeInTheDocument();
  });

  it('вызывает reset при клике на кнопку «Повторить»', async () => {
    const reset = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(<ErrorFallback error={new Error('boom')} reset={reset} />);
    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(reset).toHaveBeenCalledTimes(1);
  });
});
