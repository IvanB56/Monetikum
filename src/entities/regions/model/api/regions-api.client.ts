import {$api} from '@shared/lib/api';
import {unwrapData} from '@shared/lib/helpers';

import {Region, RegionsResponse} from '../types/region';

export async function getRegions(): Promise<Region[]> {
  const {data} = await $api.get<RegionsResponse>('/regions');

  return unwrapData<Region, RegionsResponse>(data);
}
