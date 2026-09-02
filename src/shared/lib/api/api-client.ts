import { createApiClient } from './create-api-client';

// Публичный клиент, без авторизации (регионы, каталог тарифов и т.п.) —
// baseURL=NEXT_PUBLIC_API_URL, идёт через rewrites()-прокси в next.config.ts.
// Для авторизованных клиентских запросов — $authApi (auth-api-client.ts).
export const $api = createApiClient(process.env.NEXT_PUBLIC_API_URL);
