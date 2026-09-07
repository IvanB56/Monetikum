'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, PasswordInput, Stack } from '@mantine/core';
import { z } from 'zod';

import { PASSWORD_LABEL, SPONSOR_INVALID_CREDENTIALS_ERROR, SUBMIT_LABEL } from '@shared/constants';
import { PhoneField } from '@shared/ui/PhoneField';

import { passwordSchema, phoneSchema } from '../model/validation';

const sponsorLoginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

type SponsorLoginFormValues = z.infer<typeof sponsorLoginSchema>;

export const SponsorLoginForm = () => {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SponsorLoginFormValues>({
    resolver: zodResolver(sponsorLoginSchema),
    defaultValues: { phone: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ phone, password }) => {
    const result = await signIn('sponsor', { phone, password, redirect: false });

    if (result?.error) {
      setError('root', { message: SPONSOR_INVALID_CREDENTIALS_ERROR });
      return;
    }

    router.push('/');
    router.refresh();
  });

  return (
    <form noValidate onSubmit={ onSubmit }>
      <Stack>
        { errors.root?.message ? (
          <Alert color="red" variant="light">
            { errors.root.message }
          </Alert>
        ) : null }
        <PhoneField control={ control } name="phone" disabled={ isSubmitting } />
        <PasswordInput
          label={ PASSWORD_LABEL }
          error={ errors.password?.message }
          disabled={ isSubmitting }
          { ...register('password') }
        />
        <Button type="submit" loading={ isSubmitting } disabled={ isSubmitting }>
          { SUBMIT_LABEL }
        </Button>
      </Stack>
    </form>
  );
};
