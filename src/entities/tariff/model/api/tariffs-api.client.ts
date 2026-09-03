import {$api} from '@shared/lib/api';

import {unwrapTariffs} from '../api/tariffs-mapper';
import {Tariff, TariffsResponse} from '../types/tariffs';

export async function getTariffs(): Promise<Tariff[]> {
  const {data} = await $api.get<TariffsResponse>('/subscriptions/types');

  return unwrapTariffs(data);
}