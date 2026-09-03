import {$api} from '@shared/lib/api';
import {unwrapData} from '@shared/lib/helpers';

import {Tariff, TariffsResponse} from '../types/tariffs';

export async function getTariffs(): Promise<Tariff[]> {
  const {data} = await $api.get<TariffsResponse>('/subscriptions/types');

  return unwrapData<Tariff, TariffsResponse>(data);
}