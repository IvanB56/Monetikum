'use client';

import { ErrorFallback, type ErrorFallbackProps } from '@shared/ui/ErrorFallback';

type GuestErrorProps = Pick<ErrorFallbackProps, 'error' | 'reset'>;

export default function GuestError({ error, reset }: GuestErrorProps) {
  return <ErrorFallback error={error} reset={reset} />;
}
