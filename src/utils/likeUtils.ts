import type { Flight } from "@/types/flight";
import { generateFlightKey } from "./flightUtils";

const LIKED_FLIGHTS_KEY = "liked_flights";

export interface LikedFlight {
  flight: Flight;
  adults: number;
  teens: number;
  children: number;
  infants: number;
  likedAt: string;
  priceRange?: {
    min: number;
    max: number;
  };
}

export function getLikedFlights(): LikedFlight[] {
  if (typeof window === "undefined") return [];
  const liked = localStorage.getItem(LIKED_FLIGHTS_KEY);
  return liked ? JSON.parse(liked) : [];
}

export function addLikedFlight(
  flight: Flight,
  adults: number,
  teens: number = 0,
  children: number = 0,
  infants: number = 0,
  priceRange?: { min: number; max: number },
): void {
  if (typeof window === "undefined") return;

  const likedFlights = getLikedFlights();
  const flightKey = generateFlightKey(flight);

  // Check if flight is already liked
  const existingIndex = likedFlights.findIndex(
    (f) => generateFlightKey(f.flight) === flightKey,
  );

  if (existingIndex === -1) {
    likedFlights.push({
      flight,
      adults,
      teens,
      children,
      infants,
      likedAt: new Date().toISOString(),
      priceRange,
    });
    localStorage.setItem(LIKED_FLIGHTS_KEY, JSON.stringify(likedFlights));
  }
}

export function removeLikedFlight(flightKey: string): void {
  if (typeof window === "undefined") return;

  const likedFlights = getLikedFlights();
  const updatedFlights = likedFlights.filter(
    (f) => generateFlightKey(f.flight) !== flightKey,
  );

  localStorage.setItem(LIKED_FLIGHTS_KEY, JSON.stringify(updatedFlights));
}

export function isFlightLiked(flight: Flight): boolean {
  if (typeof window === "undefined") return false;

  const likedFlights = getLikedFlights();
  const flightKey = generateFlightKey(flight);

  return likedFlights.some((f) => generateFlightKey(f.flight) === flightKey);
}
