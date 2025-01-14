interface FlightLeg {
  origin: string;
  originFull: string;
  destination: string;
  destinationFull: string;
  destinationCountry: string;
  departureTime: string;
  arrivalTime: string;
  flightDuration: number;
  flightNumber: string;
  price: number;
  currency: string;
}

export interface Flight {
  outbound: FlightLeg;
  inbound: FlightLeg;
  totalPrice: number;
}

export interface CityData {
  flights: Flight[];
  minPrice: number;
  maxPrice: number;
  minDuration: number;
  maxDuration: number;
}

export interface CountryData {
  minPrice: number;
  cities: Record<string, CityData>;
}
