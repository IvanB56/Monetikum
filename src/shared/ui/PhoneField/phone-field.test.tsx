import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { PHONE_INCOMPLETE_ERROR, PHONE_PATTERN } from '@shared/constants';
import { renderWithProviders } from '@shared/lib/test';

import { PhoneField } from './phone-field';

interface PhoneFormValues {
  phone: string;
}

function PhoneTestForm() {
  const [submittedPhone, setSubmittedPhone] = useState<string | null>(null);
  const { control, handleSubmit } = useForm<PhoneFormValues>({
    resolver: zodResolver(z.object({ phone: z.string().regex(PHONE_PATTERN, PHONE_INCOMPLETE_ERROR) })),
    defaultValues: { phone: '' },
  });

  return (
    <form onSubmit={ handleSubmit((values) => setSubmittedPhone(values.phone)) }>
      <PhoneField control={ control } name="phone" />
      <button type="submit">Отправить</button>
      { submittedPhone !== null && <div data-testid="submitted-phone">{ submittedPhone }</div> }
    </form>
  );
}

describe('PhoneField', () => {
  it('применяет маску к введённым цифрам', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PhoneTestForm />);

    const input = screen.getByLabelText('Телефон');
    await user.type(input, '9991234567');

    expect(input).toHaveValue('+7(999)123-45-67');
  });

  it('передаёт замаскированное значение в форму при сабмите', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PhoneTestForm />);

    await user.type(screen.getByLabelText('Телефон'), '9991234567');
    await user.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(await screen.findByTestId('submitted-phone')).toHaveTextContent('+7(999)123-45-67');
  });

  it('показывает ошибку при неполном номере', async () => {
    const user = userEvent.setup();
    renderWithProviders(<PhoneTestForm />);

    await user.type(screen.getByLabelText('Телефон'), '999123');
    await user.click(screen.getByRole('button', { name: 'Отправить' }));

    expect(await screen.findByText(PHONE_INCOMPLETE_ERROR)).toBeInTheDocument();
  });
});
