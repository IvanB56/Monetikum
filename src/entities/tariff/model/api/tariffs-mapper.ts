import {Tariff, TariffsResponse} from '../types/tariffs';

export function unwrapTariffs(response: TariffsResponse): Tariff[] {
  return response.data;
}
