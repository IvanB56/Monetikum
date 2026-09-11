import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';

/**
 * Применяет `fieldErrors`, полученные от server action, к соответствующим
 * полям react-hook-form. Ошибки по полям, которых нет в текущем шаге формы
 * (например, backend вернул `phone`/`email` на шаге ввода SMS-кода), и любые
 * немаппированные ошибки уходят в общий `root`-алерт, а не теряются молча.
 */
export function applyFieldErrors<TFieldValues extends FieldValues>(
  setError: UseFormSetError<TFieldValues>,
  fallbackMessage: string,
  knownFields: readonly Path<TFieldValues>[],
  fieldErrors?: Record<string, string>,
): void {
  if (!fieldErrors) {
    setError('root', { message: fallbackMessage });
    return;
  }

  const knownFieldNames: readonly string[] = knownFields;
  const unmatchedMessages: string[] = [];

  for (const [field, message] of Object.entries(fieldErrors)) {
    if (knownFieldNames.includes(field)) {
      setError(field as Path<TFieldValues>, { message });
    } else {
      unmatchedMessages.push(message);
    }
  }

  if (unmatchedMessages.length > 0) {
    setError('root', { message: unmatchedMessages[0] });
  }
}
