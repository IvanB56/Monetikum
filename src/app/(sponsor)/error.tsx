'use client';

import { ErrorFallback, type ErrorFallbackProps } from '@shared/ui/ErrorFallback';

type SponsorErrorProps = Pick<ErrorFallbackProps, 'error' | 'reset'>;

export default function SponsorError({ error, reset }: SponsorErrorProps) {
  return <ErrorFallback error={error} reset={reset} />;
}
