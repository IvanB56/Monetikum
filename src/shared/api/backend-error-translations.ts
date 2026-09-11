/**
 * Перевод англоязычных фрагментов, которые backend (`test.monetikum.ru`)
 * иногда возвращает вместо русского текста — см. `docs/plans/2026-09-11-backend-error-ru-translation.md`.
 * Единственная точка применения — `parseErrorBody()` в `./sanctum-session`.
 */

const KNOWN_FULL_MESSAGE_TRANSLATIONS: Record<string, string> = {
  'The details you entered did not match our records. Please double-check and try again.':
    'Вы ввели некорректные данные. Пожалуйста, перепроверьте их и попробуйте ещё раз.',
};

/**
 * `token` намеренно не входит сюда как отдельная запись: `translateBackendErrorText()`
 * прогоняется через `parseErrorBody()` для ВСЕХ Sanctum-эндпоинтов (login/verify-phone/
 * register/logout), а не только для будущей регистрации студента — голое слово `token`
 * в реальном Laravel-приложении означает разное в разных контекстах (API-токены, токены
 * сброса пароля и т.д.), и молчаливый неверный перевод хуже отсутствия перевода. Когда
 * регистрация студента (`RegisterStudentRequest.token`) реально подключится к фронту,
 * добавить перевод точным совпадением полной Laravel-фразы (`KNOWN_FULL_MESSAGE_TRANSLATIONS`),
 * а не голым словом.
 */
const KNOWN_ATTRIBUTE_LABEL_FALLBACKS: Record<string, string> = {
  'phone verify code': 'код подтверждения',
};

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const ATTRIBUTE_LABEL_PATTERNS = Object.entries(KNOWN_ATTRIBUTE_LABEL_FALLBACKS).map(
  ([attribute, translation]) => ({
    pattern: new RegExp(`\\b${escapeRegExp(attribute)}\\b`, 'gi'),
    translation,
  }),
);

export function translateBackendErrorText(text: string): string {
  const trimmed = text.trim();
  const fullMessageTranslation = KNOWN_FULL_MESSAGE_TRANSLATIONS[trimmed];
  if (fullMessageTranslation) return fullMessageTranslation;

  return ATTRIBUTE_LABEL_PATTERNS.reduce(
    (result, { pattern, translation }) => result.replace(pattern, translation),
    text,
  );
}
