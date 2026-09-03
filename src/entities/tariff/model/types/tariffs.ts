export interface Tariff {
  name: string;
  period: string;
  old_price: string;
  price: string;
  slug: string;
}

export interface TariffsResponse {
  data: Tariff[];
}