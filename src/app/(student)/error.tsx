'use client';

import { ErrorFallback, type ErrorFallbackProps } from '@shared/ui/ErrorFallback';

type StudentErrorProps = Pick<ErrorFallbackProps, 'error' | 'reset'>;

export default function StudentError({ error, reset }: StudentErrorProps) {
  return <ErrorFallback error={error} reset={reset} />;
}
