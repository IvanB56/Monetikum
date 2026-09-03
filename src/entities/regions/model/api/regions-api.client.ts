import {$api} from '@shared/lib/api';

import {Region, RegionsResponse} from '../types/region';

import {unwrapRegions} from './regions-mapper';

export async function getRegions(): Promise<Region[]> {
  const {data} = await $api.get<RegionsResponse>('/regions');

  return unwrapRegions(data);
}
