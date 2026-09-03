import {Region, RegionsResponse} from '../types/region';

export function unwrapRegions(response: RegionsResponse): Region[] {
  return response.data;
}
