import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

import '@testing-library/jest-dom/vitest';

// Без globals: true Vitest не предоставляет глобальный afterEach, на который
// полагается автоматический cleanup Testing Library — вызываем его явно,
// иначе DOM накапливается между тестами одного файла.
afterEach(() => {
  cleanup();
});

// jsdom не реализует matchMedia — от него зависит @mantine/hooks (useMediaQuery).
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

// jsdom не реализует ResizeObserver — от него зависит FloatingIndicator
// внутри @mantine/core Tabs (позиционирование индикатора активного таба).
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
