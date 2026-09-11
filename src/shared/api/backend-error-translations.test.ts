import { describe, expect, it } from 'vitest';

import { translateBackendErrorText } from './backend-error-translations';

describe('translateBackendErrorText', () => {
  it('переводит известное полное английское сообщение целиком', () => {
    const result = translateBackendErrorText(
      'The details you entered did not match our records. Please double-check and try again.',
    );

    expect(result).toBe('Вы ввели некорректные данные. Пожалуйста, перепроверьте их и попробуйте ещё раз.');
  });

  it('заменяет непереведённое имя поля внутри русского предложения', () => {
    const result = translateBackendErrorText('Поле phone verify code обязательно.');

    expect(result).toBe('Поле код подтверждения обязательно.');
  });

  it('не меняет уже полностью русский или неизвестный текст', () => {
    const russianText = 'Поле email адрес обязательно.';

    expect(translateBackendErrorText(russianText)).toBe(russianText);
  });

  it('не заменяет совпадение, являющееся частью более длинного слова', () => {
    const text = 'Поле super phone verify codex обязательно.';

    expect(translateBackendErrorText(text)).toBe(text);
  });
});
