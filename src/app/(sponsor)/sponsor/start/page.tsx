'use client';

import { Container, Text, Title } from '@mantine/core';

import { useUser } from '@entities/user';

export default function SponsorStartPage() {
  const { data: user } = useUser();

  return (
    <Container size="responsive">
      {/* Плейсхолдер — цель редиректа middleware.ts, полноценный UI появится в Фазе 3 */}
      <Title order={ 1 }>Привет, { user?.name }!</Title>
      <Text>Личный кабинет спонсора в разработке.</Text>
    </Container>
  );
}
