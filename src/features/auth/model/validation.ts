import { z } from 'zod';

import {
  EMAIL_INVALID_ERROR,
  EMAIL_REQUIRED_ERROR,
  LOGIN_REQUIRED_ERROR,
  NAME_REQUIRED_ERROR,
  PASSWORD_CONFIRMATION_MISMATCH_ERROR,
  PASSWORD_REQUIRED_ERROR,
  PHONE_INCOMPLETE_ERROR,
  PHONE_PATTERN,
  REGISTER_PASSWORD_MIN_LENGTH_ERROR,
  VERIFICATION_CODE_REQUIRED_ERROR
} from '@shared/constants';

export const phoneSchema = z.string().regex(PHONE_PATTERN, PHONE_INCOMPLETE_ERROR);
export const passwordSchema = z.string().min(1, PASSWORD_REQUIRED_ERROR);
export const loginSchema = z.string().min(1, LOGIN_REQUIRED_ERROR);
export const nameSchema = z.string().min(1, NAME_REQUIRED_ERROR);
export const emailSchema = z.string().min(1, EMAIL_REQUIRED_ERROR).email(EMAIL_INVALID_ERROR);
export const registerPasswordSchema = z.string().min(8, REGISTER_PASSWORD_MIN_LENGTH_ERROR);
export const verificationCodeSchema = z.string().min(1, VERIFICATION_CODE_REQUIRED_ERROR);

/** Шаг 1 регистрации спонсора — предвалидирует те же данные, что и `POST /user/sponsor/verify-phone`. */
export const sponsorRegisterDetailsSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: registerPasswordSchema,
    passwordConfirmation: registerPasswordSchema,
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: PASSWORD_CONFIRMATION_MISMATCH_ERROR,
    path: ['passwordConfirmation'],
  });

export type SponsorRegisterDetails = z.infer<typeof sponsorRegisterDetailsSchema>;

/** Шаг 2 регистрации спонсора — код, полученный по SMS. */
export const sponsorVerifyCodeSchema = z.object({
  phoneVerifyCode: verificationCodeSchema,
});

export type SponsorVerifyCodeValues = z.infer<typeof sponsorVerifyCodeSchema>;
