export interface SearchParams {
  tripType: "oneWay" | "return" | "weekend" | "longWeekend";
  weekendMode?: "default" | "relaxed";
  startDate: string;
  endDate: string;
  maxPrice: number;
  minDays: number;
  maxDays: number;
  originAirports: string[];
  wantedCountries: string[];
  adults: number;
  teens: number;
  children: number;
  infants: number;
}
