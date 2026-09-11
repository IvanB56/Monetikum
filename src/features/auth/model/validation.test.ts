import { describe, expect, it } from 'vitest';

import {
  EMAIL_INVALID_ERROR,
  EMAIL_REQUIRED_ERROR,
  LOGIN_REQUIRED_ERROR,
  NAME_REQUIRED_ERROR,
  PASSWORD_CONFIRMATION_MISMATCH_ERROR,
  PASSWORD_REQUIRED_ERROR,
  PHONE_INCOMPLETE_ERROR,
  REGISTER_PASSWORD_MIN_LENGTH_ERROR,
  VERIFICATION_CODE_REQUIRED_ERROR,
} from '@shared/constants';

import {
  emailSchema,
  loginSchema,
  nameSchema,
  passwordSchema,
  phoneSchema,
  registerPasswordSchema,
  sponsorRegisterDetailsSchema,
  sponsorVerifyCodeSchema,
  verificationCodeSchema,
} from './validation';

describe('phoneSchema', () => {
  it('принимает телефон в формате маски', () => {
    const result = phoneSchema.safeParse('+7(999)123-45-67');

    expect(result.success).toBe(true);
  });

  it.each([ '+7(999)123-45-6', '+7999123-45-67', '89991234567', '', '+7(999)123-45-677' ])(
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

describe('loginSchema', () => {
  it('принимает непустой логин', () => {
    const result = loginSchema.safeParse('student123');

    expect(result.success).toBe(true);
  });

  it('отклоняет пустой логин с сообщением об обязательности', () => {
    const result = loginSchema.safeParse('');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(LOGIN_REQUIRED_ERROR);
    }
  });
});

describe('nameSchema', () => {
  it('отклоняет пустое имя с сообщением об обязательности', () => {
    const result = nameSchema.safeParse('');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(NAME_REQUIRED_ERROR);
    }
  });
});

describe('emailSchema', () => {
  it('принимает корректный email', () => {
    expect(emailSchema.safeParse('sponsor@example.com').success).toBe(true);
  });

  it('отклоняет пустой email с сообщением об обязательности', () => {
    const result = emailSchema.safeParse('');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(EMAIL_REQUIRED_ERROR);
    }
  });

  it('отклоняет некорректный email', () => {
    const result = emailSchema.safeParse('not-an-email');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(EMAIL_INVALID_ERROR);
    }
  });
});

describe('registerPasswordSchema', () => {
  it('отклоняет пароль короче 8 символов', () => {
    const result = registerPasswordSchema.safeParse('short1');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(REGISTER_PASSWORD_MIN_LENGTH_ERROR);
    }
  });

  it('принимает пароль от 8 символов', () => {
    expect(registerPasswordSchema.safeParse('secret123').success).toBe(true);
  });
});

describe('verificationCodeSchema', () => {
  it('отклоняет пустой код с сообщением об обязательности', () => {
    const result = verificationCodeSchema.safeParse('');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(VERIFICATION_CODE_REQUIRED_ERROR);
    }
  });
});

describe('sponsorRegisterDetailsSchema', () => {
  const validDetails = {
    name: 'Иван',
    email: 'sponsor@example.com',
    phone: '+7(999)123-45-67',
    password: 'secret123',
    passwordConfirmation: 'secret123',
  };

  it('принимает корректные данные регистрации', () => {
    expect(sponsorRegisterDetailsSchema.safeParse(validDetails).success).toBe(true);
  });

  it('отклоняет несовпадающее подтверждение пароля', () => {
    const result = sponsorRegisterDetailsSchema.safeParse({
      ...validDetails,
      passwordConfirmation: 'different1',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((item) => item.path.join('.') === 'passwordConfirmation');
      expect(issue?.message).toBe(PASSWORD_CONFIRMATION_MISMATCH_ERROR);
    }
  });
});

describe('sponsorVerifyCodeSchema', () => {
  it('отклоняет пустой код', () => {
    expect(sponsorVerifyCodeSchema.safeParse({ phoneVerifyCode: '' }).success).toBe(false);
  });

  it('принимает непустой код', () => {
    expect(sponsorVerifyCodeSchema.safeParse({ phoneVerifyCode: '1234' }).success).toBe(true);
  });
});
