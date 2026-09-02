import axios from 'axios';

/** Общая фабрика axios-инстансов для публичного ($api) и авторизованного ($authApi) клиентов — единая точка конфигурации заголовков. */
export function createApiClient(baseURL: string | undefined) {
  return axios.create({
    baseURL,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}
