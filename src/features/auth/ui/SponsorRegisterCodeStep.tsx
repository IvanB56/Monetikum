'use client';

import { useState } from 'react';
import type { Path, UseFormSetError } from 'react-hook-form';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Group, Stack, TextInput } from '@mantine/core';

import {
  BACK_LABEL,
  RESEND_VERIFICATION_CODE_FAILED_ERROR,
  RESEND_VERIFICATION_CODE_LABEL,
  RESEND_VERIFICATION_CODE_SUCCESS_MESSAGE,
  SPONSOR_REGISTER_AUTO_LOGIN_FAILED_ERROR,
  SPONSOR_REGISTER_SUBMIT_LABEL,
  VERIFICATION_CODE_LABEL,
} from '@shared/constants';
import { clearReferralToken, getReferralToken } from '@shared/lib/referral-token';

import { registerSponsorAction, verifySponsorPhoneAction } from '../model/actions/sponsor-register';
import { applyFieldErrors } from '../model/apply-field-errors';
import { useCredentialsSignIn } from '../model/hooks/useCredentialsSignIn';
import type { SponsorRegisterDetails, SponsorVerifyCodeValues } from '../model/validation';
import { sponsorVerifyCodeSchema } from '../model/validation';

interface SponsorCredentials {
  phone: string;
  password: string;
}

const CODE_FIELDS: readonly Path<SponsorVerifyCodeValues>[] = ['phoneVerifyCode'];

interface ResendState {
  status: 'success' | 'error';
  message: string;
}

export interface SponsorRegisterCodeStepProps {
  details: SponsorRegisterDetails;
  onBack: () => void;
}

export const SponsorRegisterCodeStep = ({ details, onBack }: SponsorRegisterCodeStepProps) => {
  const [isResending, setIsResending] = useState(false);
  const [resendState, setResendState] = useState<ResendState | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<SponsorVerifyCodeValues>({
    resolver: zodResolver(sponsorVerifyCodeSchema),
    defaultValues: { phoneVerifyCode: '' },
  });

  const onCredentialsSignIn = useCredentialsSignIn<SponsorCredentials>(
    'Sponsor',
    SPONSOR_REGISTER_AUTO_LOGIN_FAILED_ERROR,
    // useCredentialsSignIn только когда-либо вызывает setError('root', ...) —
    // 'root' валиден для setError любой формы независимо от TFieldValues,
    // поэтому переиспользование setError этого шага здесь безопасно.
    setError as unknown as UseFormSetError<SponsorCredentials>,
  );

  const onSubmit = handleSubmit(async ({ phoneVerifyCode }) => {
    const result = await registerSponsorAction({
      ...details,
      phoneVerifyCode,
      referralToken: getReferralToken() ?? undefined,
    });
    if (!result.ok) {
      applyFieldErrors(setError, result.message, CODE_FIELDS, result.fieldErrors);
      return;
    }

    clearReferralToken();
    await onCredentialsSignIn({ phone: details.phone, password: details.password });
  });

  const handleResend = async () => {
    setIsResending(true);
    setResendState(null);
    const result = await verifySponsorPhoneAction(details);
    setIsResending(false);
    if (result.ok) {
      resetField('phoneVerifyCode');
      setResendState({ status: 'success', message: RESEND_VERIFICATION_CODE_SUCCESS_MESSAGE });
      return;
    }
    setResendState({ status: 'error', message: result.message || RESEND_VERIFICATION_CODE_FAILED_ERROR });
  };

  return (
    <form noValidate onSubmit={ onSubmit }>
      <Stack>
        { errors.root?.message ? (
          <Alert color="red" variant="light">
            { errors.root.message }
          </Alert>
        ) : null }
        { resendState ? (
          <Alert color={ resendState.status === 'success' ? 'teal' : 'red' } variant="light">
            { resendState.message }
          </Alert>
        ) : null }
        <TextInput
          label={ VERIFICATION_CODE_LABEL }
          error={ errors.phoneVerifyCode?.message }
          disabled={ isSubmitting }
          { ...register('phoneVerifyCode') }
        />
        <Group justify="space-between">
          <Button variant="subtle" type="button" onClick={ onBack } disabled={ isSubmitting }>
            { BACK_LABEL }
          </Button>
          <Button
            variant="subtle"
            type="button"
            onClick={ handleResend }
            loading={ isResending }
            disabled={ isSubmitting }
          >
            { RESEND_VERIFICATION_CODE_LABEL }
          </Button>
        </Group>
        <Button type="submit" loading={ isSubmitting } disabled={ isSubmitting }>
          { SPONSOR_REGISTER_SUBMIT_LABEL }
        </Button>
      </Stack>
    </form>
  );
};
