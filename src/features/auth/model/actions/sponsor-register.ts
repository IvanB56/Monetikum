'use server';

import {
  registerSponsor as registerSponsorSanctum,
  SanctumRequestError,
  verifySponsorPhone as verifySponsorPhoneSanctum,
} from '@shared/api';
import { SPONSOR_REGISTER_VALIDATION_ERROR } from '@shared/constants';

import type {
  SponsorRegisterActionInput,
  SponsorRegisterActionResult,
  SponsorVerifyPhoneActionInput,
} from '../types';
import { sponsorRegisterDetailsSchema, sponsorVerifyCodeSchema } from '../validation';

/**
 * Backend отдаёт ошибки валидации по своим именам полей (`phone_verify_code`,
 * `password_confirmation`) — здесь они переводятся в имена полей формы один раз,
 * на сервере, чтобы клиентский код не знал о контракте backend вовсе.
 */
const BACKEND_TO_FORM_FIELD: Record<string, string> = {
  phone_verify_code: 'phoneVerifyCode',
  password_confirmation: 'passwordConfirmation',
};

function toFormFieldErrors(fieldErrors: Record<string, string[]> | undefined): Record<string, string> | undefined {
  if (!fieldErrors) return undefined;

  const entries = Object.entries(fieldErrors)
    .filter(([, messages]) => messages.length > 0)
    .map(([field, messages]) => [BACKEND_TO_FORM_FIELD[field] ?? field, messages[0]] as const);

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export async function verifySponsorPhoneAction(
  input: SponsorVerifyPhoneActionInput,
): Promise<SponsorRegisterActionResult> {
  const parsed = sponsorRegisterDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, message: SPONSOR_REGISTER_VALIDATION_ERROR };
  }

  try {
    await verifySponsorPhoneSanctum(parsed.data);
    return { ok: true as const };
  } catch (error) {
    if (error instanceof SanctumRequestError) {
      return { ok: false as const, message: error.message, fieldErrors: toFormFieldErrors(error.fieldErrors) };
    }
    throw error;
  }
}

export async function registerSponsorAction(
  input: SponsorRegisterActionInput,
): Promise<SponsorRegisterActionResult> {
  const parsedDetails = sponsorRegisterDetailsSchema.safeParse(input);
  const parsedCode = sponsorVerifyCodeSchema.safeParse({ phoneVerifyCode: input.phoneVerifyCode });
  if (!parsedDetails.success || !parsedCode.success) {
    return { ok: false as const, message: SPONSOR_REGISTER_VALIDATION_ERROR };
  }

  try {
    await registerSponsorSanctum({
      ...parsedDetails.data,
      phoneVerifyCode: parsedCode.data.phoneVerifyCode,
      referralToken: input.referralToken,
    });
    return { ok: true as const };
  } catch (error) {
    if (error instanceof SanctumRequestError) {
      return { ok: false as const, message: error.message, fieldErrors: toFormFieldErrors(error.fieldErrors) };
    }
    throw error;
  }
}
