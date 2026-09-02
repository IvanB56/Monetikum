import { configureStore } from '@reduxjs/toolkit';

import type { ThunkExtraArg } from './types';

// Пустая reducer-карта — первый реальный UI-слайс (модалка/визард) добавляется
// вместе с фичей, которой он нужен (Фаза 1/3), а не заранее.
export function createReduxStore(extraArgument: ThunkExtraArg) {
  return configureStore({
    reducer: {},
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument },
      }),
  });
}
