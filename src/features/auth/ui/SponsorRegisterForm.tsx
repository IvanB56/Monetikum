'use client';

import { useState } from 'react';

import type { SponsorRegisterDetails } from '../model/validation';

import { SponsorRegisterCodeStep } from './SponsorRegisterCodeStep';
import { SponsorRegisterDetailsStep } from './SponsorRegisterDetailsStep';

type SponsorRegisterStep = 'details' | 'code';

export const SponsorRegisterForm = () => {
  const [step, setStep] = useState<SponsorRegisterStep>('details');
  const [details, setDetails] = useState<SponsorRegisterDetails | null>(null);

  if (step === 'code' && details) {
    return <SponsorRegisterCodeStep details={ details } onBack={ () => setStep('details') }/>;
  }

  return (
    <SponsorRegisterDetailsStep
      defaultValues={ details ?? undefined }
      onSuccess={ (values) => {
        setDetails(values);
        setStep('code');
      } }
    />
  );
};
