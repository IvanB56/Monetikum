'use client';

import { Control, FieldValues, Path, useController } from 'react-hook-form';
import { IMaskInput } from 'react-imask';

import { InputBase } from '@mantine/core';

import { PHONE_LABEL, PHONE_MASK, PHONE_PLACEHOLDER } from '@shared/constants';

export interface PhoneFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label?: string;
  disabled?: boolean;
}

export function PhoneField<TFieldValues extends FieldValues>({
  control,
  name,
  label = PHONE_LABEL,
  disabled,
}: PhoneFieldProps<TFieldValues>) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name });

  return (
    <InputBase
      component={ IMaskInput }
      mask={ PHONE_MASK }
      type="tel"
      label={ label }
      placeholder={ PHONE_PLACEHOLDER }
      value={ value }
      onAccept={ onChange }
      onBlur={ onBlur }
      error={ error?.message }
      disabled={ disabled }
    />
  );
}
