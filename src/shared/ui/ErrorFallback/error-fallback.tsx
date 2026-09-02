'use client';

import { Button, Center, Stack, Text, Title } from '@mantine/core';

export interface ErrorFallbackProps {
  error: Error & { digest?: string };
  reset: () => void;
  minHeight?: string | number;
}

export function ErrorFallback({ error, reset, minHeight = '100vh' }: ErrorFallbackProps) {
  const description = error.digest
    ? `Код ошибки: ${error.digest}. Попробуйте повторить действие.`
    : 'Попробуйте повторить действие. Если ошибка повторится, сообщите нам об этом.';

  return (
    <Center mih={minHeight}>
      <Stack align="center" gap="sm">
        <Title order={3}>Что-то пошло не так</Title>
        <Text c="dimmed" ta="center">
          {description}
        </Text>
        <Button onClick={reset}>Повторить</Button>
      </Stack>
    </Center>
  );
}
