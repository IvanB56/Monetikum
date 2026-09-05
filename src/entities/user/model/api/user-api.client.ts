import {$authApi} from '@shared/lib/api';

import {UserResponse} from '../types/user';

export async function getUser() {
  const {data} = await $authApi.get<UserResponse>('/user');

  return data.data;
}
