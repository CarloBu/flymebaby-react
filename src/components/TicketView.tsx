import { useEffect, useState } from "react";
import { DetailedFlightCard } from "@components/cards/DetailedFlightCard";
import { decompressFlightData } from "@utils/shareUtils";
import { airports } from "@/data/airports";
import { format } from "date-fns";
import type { Flight } from "@/types/flight";
import { ThemeToggle } from "@components/ThemeToggle";
import { calculateTotalPrice, calculateTripDays } from "@utils/flightUtils";
import { FAQ } from "@components/FAQ";
import { motion, AnimatePresence } from "framer-motion";

export function TicketView() {
  const [flight, setFlight] = useState<Flight | null>(null);
  const [adults, setAdults] = useState(0);
  const [teens, setTeens] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{
    min: number;
    max: number;
  } | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const compressedData = searchParams.get("f");

    if (!compressedData) {
      setError("No flight data provided");
      return;
    }

    try {
      // Decompress the flight data
      const data = decompressFlightData(compressedData);
      const decompressedFlight = data.flight;

      // Populate full names and calculate durations
      const populateFlightDetails = (leg: any) => {
        const originAirport = airports.find((a) => a.code === leg.origin);
        const destAirport = airports.find((a) => a.code === leg.destination);

        if (!originAirport || !destAirport) {
          throw new Error("Invalid airport codes in flight data");
        }

        leg.originFull = `${originAirport.name}, ${originAirport.country}`;
        leg.destinationFull = `${destAirport.name}, ${destAirport.country}`;
        leg.destinationCountry = destAirport.country;
      };

      populateFlightDetails(decompressedFlight.outbound);
      populateFlightDetails(decompressedFlight.inbound);

      setFlight(decompressedFlight);
      setAdults(data.adults);
      setTeens(data.teens);
      setChildren(data.children);
      setInfants(data.infants);
      setPriceRange(data.priceRange || null);
    } catch (e) {
      setError("Invalid or corrupted flight data");
      console.error("Error processing flight data:", e);
    }
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-grow">
          <div className="fixed right-3 top-3 z-50 sm:right-8 sm:top-8">
            <ThemeToggle />
          </div>
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <h1 className="text-2xl font-bold text-red-600">{error}</h1>
            <p className="text-gray-600">
              The flight information could not be loaded.
            </p>
            <a
              href="/"
              className="mt-4 rounded-full bg-black px-6 py-2 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Search Flights
            </a>
          </div>
        </div>

        <div className="mt-16">
          <FAQ animated />
        </div>
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-grow">
          <div className="fixed right-3 top-3 z-50 sm:right-8 sm:top-8">
            <ThemeToggle />
          </div>
          <div className="flex min-h-[80vh] items-center justify-center text-xl">
            <div className="text-center">Loading flight details...</div>
          </div>
        </div>
      </div>
    );
  }

  const departureDate = format(
    new Date(flight.outbound.departureTime),
    "MMMM d, yyyy",
  );

  const totalPrice = calculateTotalPrice(
    flight.outbound.price,
    flight.inbound.price,
    adults,
    teens,
    children,
    infants,
    "return",
  );

  // Calculate trip days from departure times
  const tripDays = calculateTripDays(
    flight.outbound.departureTime,
    flight.inbound.departureTime,
  );

  // Use price range from shared data if available, otherwise calculate it
  const minPrice = priceRange?.min ?? totalPrice * 0.8; // 20% below current price as fallback
  const maxPrice = priceRange?.max ?? totalPrice * 1.2; // 20% above current price as fallback

  const totalPassengers = adults + teens + children + infants;
  const passengerText =
    totalPassengers === 1 ? "a ticket" : `${totalPassengers} tickets`;

  return (
    <motion.div layout className="flex min-h-screen w-full flex-col">
      <motion.div layout className="-mb-6 flex-grow">
        <div className="space-y-8">
          <div className="text-center">
            <div className="mx-4 mt-32 flex flex-col items-center justify-center">
              <p className="max-w-3xl text-xl text-gray-900 dark:text-gray-100">
                Found a great Ryanair deal: {passengerText} for{" "}
                <span className="font-medium">
                  {Math.round(totalPrice)} Euros
                </span>{" "}
                from{" "}
                <span className="font-medium">
                  {flight.outbound.originFull}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {flight.outbound.destinationFull}
                </span>
                , departing on {departureDate}!
              </p>
            </div>
          </div>

          <div className="mx-auto mb-14 px-4 xl:w-[61rem]">
            <DetailedFlightCard
              flight={flight}
              adults={adults}
              teens={teens}
              children={children}
              infants={infants}
              minPrice={minPrice}
              maxPrice={maxPrice}
              tripDays={tripDays}
              bgColor="bg-gray-50 dark:bg-gray-300"
            />
          </div>

          <div className="flex flex-col items-center justify-center gap-4">
            <p className="mt-4 text-center text-xl text-gray-900 dark:text-gray-100">
              Wanna check other flight deals?
            </p>
            <a
              href="/"
              className="rounded-full bg-black px-8 py-4 text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Search Flights
            </a>
          </div>
        </div>
      </motion.div>

      <FAQ animated />
    </motion.div>
  );
}
