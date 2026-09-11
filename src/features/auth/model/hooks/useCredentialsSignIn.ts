import type { FieldValues, UseFormSetError } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import type { SignInOptions } from 'next-auth/react';
import { signIn } from 'next-auth/react';

import { UserRole } from '@shared/config/auth';

export function useCredentialsSignIn<TFieldValues extends FieldValues>(
  providerId: UserRole,
  invalidCredentialsError: string,
  setError: UseFormSetError<TFieldValues>,
) {
  const router = useRouter();

  return async (credentials: TFieldValues) => {
    const options: SignInOptions<false> = { ...credentials, redirect: false };
    const result = await signIn(providerId, options);

    if (result?.error) {
      setError('root', { message: invalidCredentialsError });
      return;
    }

    router.push('/');
    router.refresh();
  };
}
