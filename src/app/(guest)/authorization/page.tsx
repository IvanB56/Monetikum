import { Suspense } from 'react';

import { Container } from '@mantine/core';

import { AuthorizationSwitcher } from '@widgets/AuthorizationSwitcher';
import { SuspenseFallback } from '@shared/ui/Suspense';

const Page = () => {
  return (
    <Container size="responsive">
      <Suspense fallback={ <SuspenseFallback /> }>
        <AuthorizationSwitcher />
      </Suspense>
    </Container>
  );
};

export default Page;
