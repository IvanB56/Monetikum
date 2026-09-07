import { describe, expect, it } from 'vitest';

import { PASSWORD_REQUIRED_ERROR, PHONE_INCOMPLETE_ERROR } from '@shared/constants';

import { passwordSchema, phoneSchema } from './validation';

describe('phoneSchema', () => {
  it('принимает телефон в формате маски', () => {
    const result = phoneSchema.safeParse('+7(999)123-45-67');

    expect(result.success).toBe(true);
  });

  it.each(['+7(999)123-45-6', '+7999123-45-67', '89991234567', '', '+7(999)123-45-677'])(
    'отклоняет незамаскированный/неполный телефон: %s',
    (value) => {
      const result = phoneSchema.safeParse(value);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(PHONE_INCOMPLETE_ERROR);
      }
    },
  );
});

describe('passwordSchema', () => {
  it('принимает непустой пароль', () => {
    const result = passwordSchema.safeParse('secret123');

    expect(result.success).toBe(true);
  });

  it('отклоняет пустой пароль с сообщением об обязательности', () => {
    const result = passwordSchema.safeParse('');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(PASSWORD_REQUIRED_ERROR);
    }
  });
});
