export interface Flight {
  outbound: {
    departureTime: string;
    originFull: string;
    origin: string;
    destinationFull: string;
    destination: string;
    destinationCountry: string;
  };
  inbound: {
    departureTime: string;
    origin: string;
  };
  totalPrice: number;
}

export interface CityData {
  flights: Flight[];
  minPrice: number;
}

export interface CountryData {
  minPrice: number;
  cities: Record<string, CityData>;
}
