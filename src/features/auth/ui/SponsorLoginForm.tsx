'use client';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, PasswordInput, Stack } from '@mantine/core';
import { z } from 'zod';

import { PASSWORD_LABEL, SPONSOR_INVALID_CREDENTIALS_ERROR, SUBMIT_LABEL } from '@shared/constants';
import { PhoneField } from '@shared/ui/PhoneField';

import { useCredentialsSignIn } from '../model/hooks/useCredentialsSignIn';
import { passwordSchema, phoneSchema } from '../model/validation';

const sponsorLoginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

type SponsorLoginFormValues = z.infer<typeof sponsorLoginSchema>;

export const SponsorLoginForm = () => {
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

  const onCredentialsSubmit = useCredentialsSignIn<SponsorLoginFormValues>(
    'Sponsor',
    SPONSOR_INVALID_CREDENTIALS_ERROR,
    setError,
  );

  const onSubmit = handleSubmit(onCredentialsSubmit);

  return (
    <form noValidate onSubmit={ onSubmit }>
      <Stack>
        { errors.root?.message ? (
          <Alert color="red" variant="light">
            { errors.root.message }
          </Alert>
        ) : null }
        <PhoneField control={ control } name="phone" disabled={ isSubmitting }/>
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
