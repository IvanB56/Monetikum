import type { AxiosInstance } from 'axios';

import type { createReduxStore } from './store';

export interface ThunkExtraArg {
  api: AxiosInstance;
}

export type AppStore = ReturnType<typeof createReduxStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
