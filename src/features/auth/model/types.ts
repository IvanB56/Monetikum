import type { SponsorRegisterDetails, SponsorVerifyCodeValues } from './validation';

/**
 * Результат server actions регистрации спонсора (`model/actions/sponsor-register.ts`).
 * Ожидаемые ошибки (валидация, занятый телефон/email, неверный SMS-код)
 * возвращаются как значение, а не через throw — так UI получает структурированный
 * `fieldErrors` для `setError()`, а не общий `Error` с потерянной детализацией,
 * которую next-auth/Next.js обрезают при пересечении границы Server Action.
 */
export type SponsorRegisterActionResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

/** Совпадает по форме с шагом 1 (`sponsorRegisterDetailsSchema`) — единственный источник истины для этих полей. */
export type SponsorVerifyPhoneActionInput = SponsorRegisterDetails;

export type SponsorRegisterActionInput = SponsorRegisterDetails & SponsorVerifyCodeValues;
