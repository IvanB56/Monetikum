import { Center, Loader } from '@mantine/core';

export interface SuspenseFallbackProps {
  minHeight?: string | number;
}

export function SuspenseFallback({ minHeight = 200 }: SuspenseFallbackProps) {
  return (
    <Center mih={minHeight}>
      <Loader size="md" />
    </Center>
  );
}
