'use client';

import { useRouter } from 'next/navigation';

import { Button, Container, Text, Title } from '@mantine/core';

import { useLogout, useUser } from '@entities/user';

export default function SponsorStartPage() {
  const { data: user } = useUser();
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.push('/authorization');
        router.refresh();
      },
    });
  };

  return (
    <Container size="responsive">
      {/* Плейсхолдер — цель редиректа middleware.ts, полноценный UI появится в Фазе 3 */}
      <Title order={ 1 }>Привет, { user?.name }!</Title>
      <Text>Личный кабинет спонсора в разработке.</Text>
      <Button onClick={ handleLogout } loading={ logout.isPending }>
        Выйти
      </Button>
    </Container>
  );
}
