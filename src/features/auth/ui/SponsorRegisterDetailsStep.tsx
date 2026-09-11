'use client';

import type { Path } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, PasswordInput, Stack, TextInput } from '@mantine/core';

import {
  EMAIL_LABEL,
  NAME_LABEL,
  PASSWORD_CONFIRMATION_LABEL,
  PASSWORD_LABEL,
  SPONSOR_REGISTER_CONTINUE_LABEL,
} from '@shared/constants';
import { PhoneField } from '@shared/ui/PhoneField';

import { verifySponsorPhoneAction } from '../model/actions/sponsor-register';
import { applyFieldErrors } from '../model/apply-field-errors';
import type { SponsorRegisterDetails } from '../model/validation';
import { sponsorRegisterDetailsSchema } from '../model/validation';

const DETAILS_FIELDS: readonly Path<SponsorRegisterDetails>[] = [
  'name',
  'email',
  'phone',
  'password',
  'passwordConfirmation',
];

const EMPTY_DEFAULT_VALUES: SponsorRegisterDetails = {
  name: '',
  email: '',
  phone: '',
  password: '',
  passwordConfirmation: '',
};

export interface SponsorRegisterDetailsStepProps {
  defaultValues?: SponsorRegisterDetails;
  onSuccess: (details: SponsorRegisterDetails) => void;
}

export const SponsorRegisterDetailsStep = ({ defaultValues, onSuccess }: SponsorRegisterDetailsStepProps) => {
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SponsorRegisterDetails>({
    resolver: zodResolver(sponsorRegisterDetailsSchema),
    defaultValues: defaultValues ?? EMPTY_DEFAULT_VALUES,
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await verifySponsorPhoneAction(values);
    if (!result.ok) {
      applyFieldErrors(setError, result.message, DETAILS_FIELDS, result.fieldErrors);
      return;
    }
    onSuccess(values);
  });

  return (
    <form noValidate onSubmit={ onSubmit }>
      <Stack>
        { errors.root?.message ? (
          <Alert color="red" variant="light">
            { errors.root.message }
          </Alert>
        ) : null }
        <TextInput
          label={ NAME_LABEL }
          error={ errors.name?.message }
          disabled={ isSubmitting }
          autoComplete="name"
          { ...register('name') }
        />
        <TextInput
          label={ EMAIL_LABEL }
          type="email"
          error={ errors.email?.message }
          disabled={ isSubmitting }
          autoComplete="email"
          { ...register('email') }
        />
        <PhoneField control={ control } name="phone" disabled={ isSubmitting }/>
        <PasswordInput
          label={ PASSWORD_LABEL }
          error={ errors.password?.message }
          disabled={ isSubmitting }
          autoComplete="new-password"
          { ...register('password') }
        />
        <PasswordInput
          label={ PASSWORD_CONFIRMATION_LABEL }
          error={ errors.passwordConfirmation?.message }
          disabled={ isSubmitting }
          autoComplete="new-password"
          { ...register('passwordConfirmation') }
        />
        <Button type="submit" loading={ isSubmitting } disabled={ isSubmitting }>
          { SPONSOR_REGISTER_CONTINUE_LABEL }
        </Button>
      </Stack>
    </form>
  );
};
