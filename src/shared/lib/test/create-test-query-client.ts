import { QueryClient } from '@tanstack/react-query';

// retry:false — без этого неудачный запрос в тесте ретраится несколько раз
// с задержкой, и waitFor() в тесте вылетает по таймауту вместо мгновенного результата.
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
}
