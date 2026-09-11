'use client';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, PasswordInput, Stack, TextInput } from '@mantine/core';
import { z } from 'zod';

import {
  LOGIN_LABEL,
  PASSWORD_LABEL,
  STUDENT_INVALID_CREDENTIALS_ERROR,
  SUBMIT_LABEL,
} from '@shared/constants';

import { useCredentialsSignIn } from '../model/hooks/useCredentialsSignIn';
import { loginSchema, passwordSchema } from '../model/validation';

const studentLoginSchema = z.object({
  login: loginSchema,
  password: passwordSchema,
});

type StudentLoginFormValues = z.infer<typeof studentLoginSchema>;

export const StudentLoginForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<StudentLoginFormValues>({
    resolver: zodResolver(studentLoginSchema),
    defaultValues: {
      login: '',
      password: ''
    }
  });

  const onCredentialsSubmit = useCredentialsSignIn<StudentLoginFormValues>(
    'Student',
    STUDENT_INVALID_CREDENTIALS_ERROR,
    setError,
  );

  const onSubmit = handleSubmit(onCredentialsSubmit);

  return (
    <form noValidate onSubmit={ onSubmit }>
      <Stack>
        { errors.root?.message ? <Alert color="red" variant="light">
          { errors.root.message }
        </Alert> : null }
        <TextInput
          error={ errors.login?.message }
          label={ LOGIN_LABEL }
          disabled={ isSubmitting }
          autoComplete="username"
          { ...register('login') }
        />
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
