import type { UseFormSetError } from 'react-hook-form';

import { describe, expect, it, vi } from 'vitest';

import { applyFieldErrors } from './apply-field-errors';

interface TestFieldValues {
  name: string;
  email: string;
}

const KNOWN_FIELDS = ['name', 'email'] as const;

describe('applyFieldErrors', () => {
  it('устанавливает root с fallback-сообщением, если fieldErrors не переданы', () => {
    const setError = vi.fn<UseFormSetError<TestFieldValues>>();

    applyFieldErrors<TestFieldValues>(setError, 'fallback', KNOWN_FIELDS);

    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith('root', { message: 'fallback' });
  });

  it('мапит ошибку известного поля через setError по имени поля, не трогая root', () => {
    const setError = vi.fn<UseFormSetError<TestFieldValues>>();

    applyFieldErrors<TestFieldValues>(setError, 'fallback', KNOWN_FIELDS, { name: 'Имя занято' });

    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith('name', { message: 'Имя занято' });
  });

  it('падает в root с первым сообщением, если ни одно поле не совпало', () => {
    const setError = vi.fn<UseFormSetError<TestFieldValues>>();

    applyFieldErrors<TestFieldValues>(setError, 'fallback', KNOWN_FIELDS, { phoneVerifyCode: 'Неверный код' });

    expect(setError).toHaveBeenCalledTimes(1);
    expect(setError).toHaveBeenCalledWith('root', { message: 'Неверный код' });
  });

  it('не теряет ошибку немаппированного поля, даже если другое поле совпало', () => {
    const setError = vi.fn<UseFormSetError<TestFieldValues>>();

    applyFieldErrors<TestFieldValues>(setError, 'fallback', KNOWN_FIELDS, {
      name: 'Имя занято',
      phone: 'Телефон занят',
    });

    expect(setError).toHaveBeenCalledWith('name', { message: 'Имя занято' });
    expect(setError).toHaveBeenCalledWith('root', { message: 'Телефон занят' });
    expect(setError).toHaveBeenCalledTimes(2);
  });
});
