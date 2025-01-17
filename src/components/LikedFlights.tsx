import { useEffect, useState } from "react";
import type { LikedFlight } from "@/utils/likeUtils";
import { getLikedFlights, removeLikedFlight } from "@/utils/likeUtils";
import { DetailedFlightCard } from "@components/cards/DetailedFlightCard";
import { DetailedFlightCardDummy } from "@components/cards/DetailedFlightCardDummy";
import {
  calculateTotalPrice,
  calculateTripDays,
  generateFlightKey,
} from "@utils/flightUtils";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { differenceInMinutes } from "date-fns/differenceInMinutes";
import { FAQ } from "@components/FAQ";

const numberToWord = (num: number): string => {
  const words = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
    "twenty",
  ];
  return num <= 20 ? words[num] : num.toString();
};

export function LikedFlights() {
  const [likedFlights, setLikedFlights] = useState<LikedFlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLikedFlights = () => {
      const flights = getLikedFlights();
      setLikedFlights(
        flights.sort(
          (a, b) =>
            new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime(),
        ),
      );
      setIsLoading(false);
    };

    loadLikedFlights();

    // Listen for storage changes
    window.addEventListener("storage", loadLikedFlights);
    return () => window.removeEventListener("storage", loadLikedFlights);
  }, []);

  const handleRemove = (flight: LikedFlight) => {
    const flightKey = generateFlightKey(flight.flight);
    removeLikedFlight(flightKey);
    setLikedFlights((prev) =>
      prev.filter((f) => generateFlightKey(f.flight) !== flightKey),
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center text-xl">Loading saved flights...</div>
        </div>
      </div>
    );
  }

  // Calculate min and max prices for color coding
  const allPrices = likedFlights.map((likedFlight) =>
    calculateTotalPrice(
      likedFlight.flight.outbound.price,
      likedFlight.flight.inbound.price,
      likedFlight.adults,
      likedFlight.teens,
      likedFlight.children,
      likedFlight.infants,
      "return",
    ),
  );

  // Use stored price range if available, otherwise calculate it
  const minPrice = likedFlights.some((f) => f.priceRange)
    ? Math.min(
        ...likedFlights
          .filter((f) => f.priceRange)
          .map((f) => f.priceRange!.min),
      )
    : Math.min(...allPrices);

  const maxPrice = likedFlights.some((f) => f.priceRange)
    ? Math.max(
        ...likedFlights
          .filter((f) => f.priceRange)
          .map((f) => f.priceRange!.max),
      )
    : Math.max(...allPrices);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="container mx-auto mt-12 flex-grow px-4 xl:w-[61rem]">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {likedFlights.length === 0
              ? "You have no saved flights"
              : `You saved ${numberToWord(likedFlights.length)} ${
                  likedFlights.length === 1 ? "flight" : "flights"
                }`}
          </h2>
        </div>

        <div className="space-y-8">
          {likedFlights.length === 0 ? (
            <DetailedFlightCardDummy />
          ) : (
            <AnimatePresence mode="popLayout">
              {likedFlights.map((likedFlight) => {
                const flightKey = generateFlightKey(likedFlight.flight);
                return (
                  <motion.div
                    key={flightKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{
                      opacity: 0,
                      y: -20,
                      transition: {
                        duration: 0.2,
                        ease: "easeInOut",
                      },
                    }}
                    layout
                    className="relative"
                  >
                    <div className="mb-2 ml-6 text-sm text-gray-500 dark:text-gray-400">
                      Saved on{" "}
                      {format(
                        new Date(likedFlight.likedAt),
                        "MMMM d, yyyy 'at' HH:mm",
                      )}
                    </div>
                    <div className="relative">
                      <DetailedFlightCard
                        flight={likedFlight.flight}
                        adults={likedFlight.adults}
                        teens={likedFlight.teens}
                        children={likedFlight.children}
                        infants={likedFlight.infants}
                        minPrice={minPrice}
                        maxPrice={maxPrice}
                        tripDays={calculateTripDays(
                          likedFlight.flight.outbound.departureTime,
                          likedFlight.flight.inbound.departureTime,
                        )}
                        bgColor="bg-gray-50 dark:bg-gray-200"
                        isLikedPage={true}
                        onRemove={() => handleRemove(likedFlight)}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      <FAQ animated />
    </div>
  );
}
