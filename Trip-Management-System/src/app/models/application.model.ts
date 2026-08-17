export interface Application {

  id?: number;

  departureId: number;

  adults: number;

  children: number;

  infants: number;

  busSeat: boolean;

  extraActivity: boolean;

  notes: string;

  totalPrice: number;

}