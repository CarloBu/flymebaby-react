import type { Flight, CountryData, CityData } from "@/types/flight";
import {
  formatDateTime,
  generateRyanairLink,
  calculateTripDays,
  getPriceColor,
  INFANT_SEAT_PRICE,
  RESERVED_SEAT_FEE,
  calculateTotalPrice,
} from "@utils/flightUtils";
import { useState, useEffect } from "react";
import { Frown, ChevronDown } from "lucide-react";
import type { SearchParams } from "@/types/search";
import { MiniCityCard } from "@components/cards/MiniCityCard";
import { MiniCityCardDummy } from "@components/cards/MiniCityCardDummy";
import { MiniFlightCard } from "@components/cards/MiniFlightCard";
import { MiniFlightCardDummy } from "@components/cards/MiniFlightCardDummy";
import { DetailedFlightCard } from "@components/cards/DetailedFlightCard";
import { airports } from "@/data/airports";
import { FlightFilters, type SortOption } from "@/components/FlightFilters";
import { StaggerGrid } from "@components/motion/StaggerGrid";
import { motion, AnimatePresence } from "framer-motion";

interface FlightResultsProps {
  flights: Flight[];
  adults: number;
  teens: number;
  children: number;
  infants: number;
  isLoading?: boolean;
  searchParams?: SearchParams;
}

interface CountryOpenState {
  [key: string]: boolean;
}

interface ScrollState {
  highlightedCountry: string | null;
  highlightedCity: string | null;
  highlightedFlightId: string | null;
}

interface TimeRange {
  start: number;
  end: number;
}

// Add these constants at the top of the file, after imports
const BREAKPOINTS = {
  xxsm: 380,
  xsm: 430,
  ssm: 515,
  sm: 651,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

// Displays a loading spinner with a message while searching for flights
export function LoadingIndicator() {
  return (
    <div className="mx-auto flex max-w-3xl select-none flex-col items-center justify-center p-8 text-center">
      <div className="mb-6 flex items-center justify-center">
        <div className="relative h-24 w-24">
          {/* Spinning orange ring */}
          <svg
            className="absolute inset-0 h-full w-full animate-[spin_1.5s_linear_infinite]"
            viewBox="0 0 120 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#0080c0"
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray="85 215"
              className="dark:stroke-blue-400"
            />
          </svg>
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Searching for flights...
      </h3>
    </div>
  );
}

// Add this interface near the top with other interfaces
interface CityGroupProps {
  city: string;
  cityData: CityData;
  adults: number;
  teens: number;
  children: number;
  infants: number;
  isLoading?: boolean;
  isExpanded?: boolean;
  isHighlighted?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  onFlightHighlight?: (flightId: string | null) => void;
  tripType?: "oneWay" | "return" | "weekend" | "longWeekend";
  sortFlights: (flights: Flight[]) => Flight[];
  columns: { city: number; flight: number };
}

// Groups flights by city and manages expansion/collapse state
// Shows either MiniFlightCards when collapsed or DetailedFlightCards when expanded
function CityGroup({
  city,
  cityData,
  adults,
  teens,
  children,
  infants,
  isLoading,
  isExpanded: controlledExpanded,
  isHighlighted,
  onExpandChange,
  minPrice,
  maxPrice,
  highlightedFlightId,
  onFlightHighlight,
  tripType = "return",
  sortFlights,
  columns,
}: CityGroupProps & {
  minPrice: number;
  maxPrice: number;
  highlightedFlightId?: string | null;
  onFlightHighlight?: (flightId: string | null) => void;
  tripType?: "oneWay" | "return" | "weekend" | "longWeekend";
  sortFlights: (flights: Flight[]) => Flight[];
}) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded ?? internalExpanded;

  const handleToggle = () => {
    const newState = !isExpanded;
    setInternalExpanded(newState);
    onExpandChange?.(newState);
  };

  const handleFlightClick = (flightId: string) => {
    onFlightHighlight?.(flightId);

    // Clear the highlight after animation
    setTimeout(() => {
      onFlightHighlight?.(null);
    }, 2000);
  };

  return (
    <div
      id={`city-group-${city.toLowerCase().replace(/\s+/g, "-")}`}
      className={`rounded-3xl border bg-gray-100 p-3 transition-all duration-1000 dark:bg-gray-800 xsm:p-4 sm:p-6 ${
        isHighlighted
          ? "ring-2 ring-gray-500 dark:ring-gray-200"
          : "border-gray-100 dark:border-gray-900"
      }`}
    >
      <div
        className="group cursor-pointer text-2xl font-semibold text-gray-700 transition-colors hover:text-black dark:text-gray-200 dark:hover:text-gray-400"
        onClick={handleToggle}
      >
        <div className="ml-0 flex select-none items-center justify-between gap-2 px-2 pt-2 sm:ml-1 sm:px-1 sm:pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-gray-900 group-hover:text-gray-800 dark:text-gray-100 dark:group-hover:text-gray-200">
              {city}
            </span>
            <div className="flex items-center gap-2 text-base font-normal text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400">
              <span className="whitespace-nowrap">
                • {cityData.flights.length} flight
                {cityData.flights.length !== 1 ? "s" : ""}
              </span>
              <span className="hidden whitespace-nowrap xsm:inline">
                • {isExpanded ? "Click to collapse" : "Click to expand"}
              </span>
            </div>
          </div>
          <div className="relative h-5 w-5">
            <motion.span
              variants={{
                open: { rotate: 180 },
                closed: { rotate: 0 },
              }}
              initial="closed"
              animate={isExpanded ? "open" : "closed"}
              transition={{
                duration: 0.4,
                ease: [0.04, 0.62, 0.23, 0.98],
              }}
              className="flex items-center justify-center"
            >
              <ChevronDown className="h-5 w-5 text-gray-400 transition-colors group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400" />
            </motion.span>
          </div>
        </div>
      </div>

      {/* Mini Cards - Show when collapsed */}

      {!isExpanded && (
        <div>
          <StaggerGrid variant="flight" className="mt-3">
            {(() => {
              const flights = sortFlights(cityData.flights);
              const placeholdersNeeded =
                flights.length % columns.flight === 0
                  ? 0
                  : columns.flight - (flights.length % columns.flight);
              return [...flights, ...Array(placeholdersNeeded)].map(
                (flight, index) => {
                  if (index >= flights.length) {
                    return <MiniFlightCardDummy key={`dummy-${index}`} />;
                  }
                  return (
                    <MiniFlightCard
                      key={`mini-${flight.outbound.origin}-${flight.outbound.destination}-${index}`}
                      flight={flight}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      onClick={handleToggle}
                      onFlightClick={(flightId) => {
                        handleFlightClick(flightId);
                      }}
                      tripType={tripType}
                      adults={adults}
                      teens={teens}
                      children={children}
                      infants={infants}
                    />
                  );
                },
              );
            })()}
          </StaggerGrid>
        </div>
      )}

      {/* Detailed Cards - Show when expanded */}
      <AnimatePresence mode="sync">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              type: "tween",
              duration: 0.3,
              ease: "easeOut",
            }}
          >
            <StaggerGrid variant="detailed">
              {sortFlights(cityData.flights).map((flight, index) => {
                const tripDays = calculateTripDays(
                  flight.outbound.departureTime,
                  flight.inbound.departureTime,
                );
                const flightId = `${flight.outbound.origin}-${flight.outbound.destination}-${flight.outbound.departureTime}`;

                return (
                  <DetailedFlightCard
                    key={flightId}
                    flight={flight}
                    adults={adults}
                    teens={teens}
                    children={children}
                    infants={infants}
                    tripDays={tripDays}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    isHighlighted={highlightedFlightId === flightId}
                    tripType={tripType}
                  />
                );
              })}
            </StaggerGrid>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Displays a message when no flights are found matching search criteria
// Includes helpful suggestions for modifying the search
export function NoResultsMessage({
  searchParams,
}: {
  searchParams?: SearchParams | null;
}) {
  return (
    <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-center rounded-3xl border-2 border-gray-200 bg-gray-50 p-8 text-center">
      <div className="mb-4">
        <Frown
          className="h-12 w-12 text-gray-700 dark:text-gray-400"
          strokeWidth={1.2}
        />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        No flights found
      </h3>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        We couldn't find any flights matching your criteria. Here are some
        suggestions:
      </p>
      <ul className="mb-6 list-inside list-disc text-left text-sm text-gray-600 dark:text-gray-400">
        <li>Try different dates</li>
        <li>Expand your search to include more airports</li>
        <li>Consider increasing your maximum price</li>
        <li>Try searching for different destinations</li>
      </ul>
    </div>
  );
}

// Validates if a flight's return date falls within the selected date range
// Used to filter out flights that return after the user's selected end date
function isFlightWithinDateRange(
  flight: Flight,
  searchParams?: SearchParams,
): boolean {
  if (!searchParams) return true;

  const endDate = new Date(searchParams.endDate);
  endDate.setHours(23, 59, 59, 999); // Set to end of day

  const returnDate = new Date(flight.inbound?.departureTime);

  return returnDate <= endDate;
}

const getColumnsByScreenWidth = (variant: "city" | "flight"): number => {
  const width = window.innerWidth;

  if (variant === "city") {
    // Match the grid-cols in StaggerGrid for "city" variant
    // "grid grid-cols-1 gap-2 xsm:gap-4 sm:grid-cols-2 lg:grid-cols-3"
    if (width >= BREAKPOINTS.lg) return 3; // lg:grid-cols-3
    if (width >= BREAKPOINTS.sm) return 2; // sm:grid-cols-2
    return 1; // grid-cols-1
  } else {
    // Match the grid-cols in StaggerGrid for "flight" variant
    // "grid grid-cols-2 gap-2 ssm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5"
    if (width >= BREAKPOINTS.lg) return 5; // lg:grid-cols-5
    if (width >= BREAKPOINTS.md) return 4; // md:grid-cols-4
    if (width >= BREAKPOINTS.ssm) return 3; // ssm:grid-cols-3
    return 2; // grid-cols-2
  }
};

// Main component that organizes and displays flight search results
// Groups flights by country and city, manages expansion states,
// and handles highlighting of selected flights
export function FlightResults({
  flights,
  adults,
  teens,
  children,
  infants,
  isLoading = false,
  searchParams,
}: FlightResultsProps) {
  const [expandedCities, setExpandedCities] = useState<Record<string, boolean>>(
    {},
  );
  const [openCountries, setOpenCountries] = useState<CountryOpenState>({});
  const [scrollState, setScrollState] = useState<ScrollState>({
    highlightedCountry: null,
    highlightedCity: null,
    highlightedFlightId: null,
  });
  const [departTimeFilter, setDepartTimeFilter] = useState<TimeRange | null>(
    null,
  );
  const [returnTimeFilter, setReturnTimeFilter] = useState<TimeRange | null>(
    null,
  );
  const [departDaysFilter, setDepartDaysFilter] = useState<string[] | null>(
    null,
  );
  const [returnDaysFilter, setReturnDaysFilter] = useState<string[] | null>(
    null,
  );
  const [sortBy, setSortBy] = useState<SortOption>("price");
  const [columns, setColumns] = useState<{ city: number; flight: number }>({
    city: getColumnsByScreenWidth("city"),
    flight: getColumnsByScreenWidth("flight"),
  });

  useEffect(() => {
    const handleResize = () => {
      setColumns({
        city: getColumnsByScreenWidth("city"),
        flight: getColumnsByScreenWidth("flight"),
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter flights and calculate price ranges for color coding
  const validFlights = flights.filter((flight) =>
    isFlightWithinDateRange(flight, searchParams),
  );

  // a quick hack for price range calculation if there's only one flight
  const priceRangeFlights =
    validFlights.length === 1
      ? [
          // Add a dummy flight with 0 price
          {
            outbound: { price: 0 },
            inbound: { price: 0 },
          },
          // The actual flight
          ...validFlights,
        ]
      : validFlights;

  // Calculate global price range from filtered flights
  const globalMinPrice = Math.min(
    ...priceRangeFlights.map((flight) =>
      calculateTotalPrice(
        flight.outbound.price,
        flight.inbound.price,
        adults,
        teens,
        children,
        infants,
        searchParams?.tripType || "return",
      ),
    ),
  );
  const globalMaxPrice = Math.max(
    ...priceRangeFlights.map((flight) =>
      calculateTotalPrice(
        flight.outbound.price,
        flight.inbound.price,
        adults,
        teens,
        children,
        infants,
        searchParams?.tripType || "return",
      ),
    ),
  );

  // Filter flights based on all active filters
  const filteredFlights = validFlights.filter((flight) => {
    if (
      !departTimeFilter &&
      !returnTimeFilter &&
      !departDaysFilter &&
      !returnDaysFilter
    ) {
      return true;
    }

    const departHour = new Date(flight.outbound.departureTime).getHours();
    const returnHour = new Date(flight.inbound.departureTime).getHours();
    const departDay = new Date(flight.outbound.departureTime)
      .toLocaleDateString("en-US", { weekday: "short" })
      .slice(0, 3);
    const returnDay = new Date(flight.inbound.departureTime)
      .toLocaleDateString("en-US", { weekday: "short" })
      .slice(0, 3);

    const passesTimeFilters =
      (!departTimeFilter ||
        (departHour >= departTimeFilter.start &&
          (departTimeFilter.end === 24 ||
            departHour < departTimeFilter.end))) &&
      (!returnTimeFilter ||
        (returnHour >= returnTimeFilter.start &&
          (returnTimeFilter.end === 24 || returnHour < returnTimeFilter.end)));

    const passesDepartDayFilter =
      !departDaysFilter || departDaysFilter.includes(departDay);
    const passesReturnDayFilter =
      !returnDaysFilter || returnDaysFilter.includes(returnDay);

    return passesTimeFilters && passesDepartDayFilter && passesReturnDayFilter;
  });

  // Group filtered flights and apply 30-flight cap per city
  const flightsByCity: Record<string, Flight[]> = {};
  const groupedFlights = filteredFlights.reduce(
    (acc: Record<string, CountryData>, flight) => {
      const destinationParts = flight.outbound.destinationFull.split(", ");
      const country =
        destinationParts[destinationParts.length - 1] || "Unknown Country";
      const city =
        destinationParts.slice(0, -1).join(", ") ||
        flight.outbound.destinationFull;
      const cityKey = `${country}-${city}`;

      if (!flightsByCity[cityKey]) {
        flightsByCity[cityKey] = [];
      }

      const flightTotalPrice = calculateTotalPrice(
        flight.outbound.price,
        flight.inbound.price,
        adults,
        teens,
        children,
        infants,
        searchParams?.tripType || "return",
      );

      // Add flight to city's array and sort by price
      flightsByCity[cityKey].push(flight);
      flightsByCity[cityKey].sort((a, b) => {
        const priceA = calculateTotalPrice(
          a.outbound.price,
          a.inbound.price,
          adults,
          teens,
          children,
          infants,
          searchParams?.tripType || "return",
        );
        const priceB = calculateTotalPrice(
          b.outbound.price,
          b.inbound.price,
          adults,
          teens,
          children,
          infants,
          searchParams?.tripType || "return",
        );
        return priceA - priceB;
      });
      // Keep only the 20 cheapest flights
      flightsByCity[cityKey] = flightsByCity[cityKey].slice(0, 15);

      if (!acc[country]) {
        acc[country] = {
          minPrice: flightTotalPrice,
          cities: {},
        };
      }

      if (!acc[country].cities[city]) {
        acc[country].cities[city] = {
          flights: [],
          minPrice: flightTotalPrice,
          maxPrice: flightTotalPrice,
          minDuration:
            flight.outbound.flightDuration + flight.inbound.flightDuration,
          maxDuration:
            flight.outbound.flightDuration + flight.inbound.flightDuration,
        };
      }

      // Use the capped flights array
      acc[country].cities[city].flights = flightsByCity[cityKey];

      // Update minPrice and maxPrice for city
      acc[country].cities[city].minPrice = Math.min(
        acc[country].cities[city].minPrice,
        flightTotalPrice,
      );
      acc[country].cities[city].maxPrice = Math.max(
        acc[country].cities[city].maxPrice,
        flightTotalPrice,
      );

      // Update minDuration and maxDuration for city
      const totalDuration =
        flight.outbound.flightDuration + flight.inbound.flightDuration;
      acc[country].cities[city].minDuration = Math.min(
        acc[country].cities[city].minDuration,
        totalDuration,
      );
      acc[country].cities[city].maxDuration = Math.max(
        acc[country].cities[city].maxDuration,
        totalDuration,
      );

      // Update minPrice for country
      acc[country].minPrice = Math.min(acc[country].minPrice, flightTotalPrice);

      return acc;
    },
    {} as Record<string, CountryData>,
  );

  // Calculate total visible flights after applying caps
  const totalVisibleFlights = Object.values(flightsByCity).reduce(
    (sum, flights) => sum + flights.length,
    0,
  );

  // Handlers for expanding/collapsing and highlighting sections
  const toggleCountry = (country: string) => {
    setOpenCountries((prev) => ({
      ...prev,
      [country]: !prev[country],
    }));
  };

  const handleCityCardClick = (country: string, city: string) => {
    // Open the country if it's not already open
    setOpenCountries((prev) => ({
      ...prev,
      [country]: true,
    }));

    // Set the highlighted elements
    setScrollState({
      highlightedCountry: country,
      highlightedCity: city,
      highlightedFlightId: null,
    });

    // Use a callback to scroll after state updates
    setTimeout(() => {
      const cityElement = document.getElementById(
        `city-group-${city.toLowerCase().replace(/\s+/g, "-")}`,
      );
      if (cityElement) {
        cityElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);

    // Clear the highlight after animation
    setTimeout(() => {
      setScrollState({
        highlightedCountry: null,
        highlightedCity: null,
        highlightedFlightId: null,
      });
    }, 2000);
  };

  const handleCityExpandChange = (city: string, expanded: boolean) => {
    setExpandedCities((prev) => ({
      ...prev,
      [city]: expanded,
    }));
  };

  const handleCountryCardClick = (country: string) => {
    // Open the country
    setOpenCountries((prev) => ({
      ...prev,
      [country]: true,
    }));

    // Set the highlighted country
    setScrollState({
      highlightedCountry: country,
      highlightedCity: null,
      highlightedFlightId: null,
    });

    // Scroll to the country element
    setTimeout(() => {
      const countryElement = document.getElementById(
        `country-group-${country.toLowerCase().replace(/\s+/g, "-")}`,
      );
      if (countryElement) {
        countryElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);

    // Clear the highlight after animation
    setTimeout(() => {
      setScrollState({
        highlightedCountry: null,
        highlightedCity: null,
        highlightedFlightId: null,
      });
    }, 2000);
  };

  const handleFlightHighlight = (flightId: string | null) => {
    setScrollState((prev) => ({
      ...prev,
      highlightedFlightId: flightId,
    }));
  };

  // Update the sorting function for flights within a city
  const sortFlights = (flights: Flight[]) => {
    return flights.sort((a, b) => {
      if (sortBy === "price") {
        const totalPriceA = calculateTotalPrice(
          a.outbound.price,
          a.inbound.price,
          adults,
          teens,
          children,
          infants,
          searchParams?.tripType || "return",
        );
        const totalPriceB = calculateTotalPrice(
          b.outbound.price,
          b.inbound.price,
          adults,
          teens,
          children,
          infants,
          searchParams?.tripType || "return",
        );
        return totalPriceA - totalPriceB;
      } else {
        // Sort by departure time
        const timeA = new Date(a.outbound.departureTime).getTime();
        const timeB = new Date(b.outbound.departureTime).getTime();
        return timeA - timeB;
      }
    });
  };

  // Update the sorting function for cities within a country
  const sortCities = (cities: Record<string, CityData>) => {
    return Object.entries(cities).sort(([, cityDataA], [, cityDataB]) => {
      if (sortBy === "price") {
        return cityDataA.minPrice - cityDataB.minPrice;
      } else {
        // Sort by earliest departure time in the city
        const earliestTimeA = Math.min(
          ...cityDataA.flights.map((f: Flight) =>
            new Date(f.outbound.departureTime).getTime(),
          ),
        );
        const earliestTimeB = Math.min(
          ...cityDataB.flights.map((f: Flight) =>
            new Date(f.outbound.departureTime).getTime(),
          ),
        );
        return earliestTimeA - earliestTimeB;
      }
    });
  };

  // Update the sorting function for countries
  const sortCountries = (countries: [string, CountryData][]) => {
    return countries.sort(([, countryDataA], [, countryDataB]) => {
      if (sortBy === "price") {
        return countryDataA.minPrice - countryDataB.minPrice;
      } else {
        // Sort by earliest departure time in the country
        const earliestTimeA = Math.min(
          ...Object.values(countryDataA.cities).flatMap((city) =>
            city.flights.map((f: Flight) =>
              new Date(f.outbound.departureTime).getTime(),
            ),
          ),
        );
        const earliestTimeB = Math.min(
          ...Object.values(countryDataB.cities).flatMap((city) =>
            city.flights.map((f: Flight) =>
              new Date(f.outbound.departureTime).getTime(),
            ),
          ),
        );
        return earliestTimeA - earliestTimeB;
      }
    });
  };

  return (
    <div className="relative z-0 w-full space-y-4 md:space-y-8">
      <div className="mb-4 h-4 text-xl font-bold">
        {isLoading ? (
          <p className="text-gray-600">
            Found {validFlights.length} flights so far...
          </p>
        ) : totalVisibleFlights > 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Found {totalVisibleFlights} flight
            {totalVisibleFlights !== 1 ? "s" : ""} to grab
          </p>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No flights match your filters
          </p>
        )}
      </div>

      <FlightFilters
        onDepartTimeChange={(range: TimeRange | null) => {
          setDepartTimeFilter(range);
        }}
        onReturnTimeChange={(range: TimeRange | null) => {
          setReturnTimeFilter(range);
        }}
        onDepartDaysChange={(days: string[] | null) => {
          setDepartDaysFilter(days);
        }}
        onReturnDaysChange={(days: string[] | null) => {
          setReturnDaysFilter(days);
        }}
        onSortChange={(newSortBy: SortOption) => {
          setSortBy(newSortBy);
        }}
        sortBy={sortBy}
      />

      <AnimatePresence mode="sync">
        {sortCountries(Object.entries(groupedFlights)).map(
          ([country, countryData]) => {
            const totalFlights = Object.values(countryData.cities).reduce(
              (sum, city) => sum + city.flights.length,
              0,
            );

            return (
              <motion.div
                key={country}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{
                  type: "tween",
                  duration: 0.3,
                  ease: "easeOut",
                }}
                id={`country-group-${country.toLowerCase().replace(/\s+/g, "-")}`}
                className="w-full"
              >
                <div className="country-group-header">
                  <div
                    className="group cursor-pointer text-4xl font-bold text-gray-800 transition-colors hover:text-black dark:text-gray-100 dark:hover:text-gray-400"
                    onClick={() => toggleCountry(country)}
                  >
                    <div className="flex select-none items-center justify-between gap-2 p-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl text-gray-900 group-hover:text-gray-800 dark:text-gray-100 dark:group-hover:text-gray-200">
                          {country}
                        </span>
                        <div className="flex items-center gap-2 text-base font-normal text-gray-400 group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400">
                          <span className="whitespace-nowrap">
                            • {totalFlights} flight
                            {totalFlights !== 1 ? "s" : ""}
                          </span>
                          <span className="hidden whitespace-nowrap xsm:inline">
                            •{" "}
                            {openCountries[country]
                              ? "Click to collapse"
                              : "Click to expand"}
                          </span>
                        </div>
                      </div>
                      <div className="relative h-6 w-6">
                        <motion.span
                          variants={{
                            open: { rotate: 180 },
                            closed: { rotate: 0 },
                          }}
                          initial="closed"
                          animate={openCountries[country] ? "open" : "closed"}
                          transition={{
                            duration: 0.4,
                            ease: [0.04, 0.62, 0.23, 0.98],
                          }}
                          className="flex items-center justify-center"
                        >
                          <ChevronDown className="h-6 w-6 text-gray-400 transition-colors group-hover:text-gray-600 dark:text-gray-600 dark:group-hover:text-gray-400" />
                        </motion.span>
                      </div>
                    </div>
                  </div>

                  {/* Mini City Cards - Show when collapsed */}
                  <AnimatePresence mode="sync">
                    {!openCountries[country] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          type: "tween",
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                      >
                        <StaggerGrid variant="city">
                          {(() => {
                            const cities = sortCities(countryData.cities);
                            const cityPlaceholdersNeeded =
                              cities.length % columns.city === 0
                                ? 0
                                : columns.city - (cities.length % columns.city);
                            return [
                              ...cities,
                              ...Array(cityPlaceholdersNeeded),
                            ].map((item, index) => {
                              if (index >= cities.length) {
                                return (
                                  <MiniCityCardDummy
                                    key={`dummy-city-${index}`}
                                  />
                                );
                              }
                              const [city, cityData] = item;
                              const airportData = airports.find(
                                (airport) =>
                                  airport.name === city &&
                                  airport.country === country,
                              );

                              return (
                                <MiniCityCard
                                  key={city}
                                  city={city}
                                  cityData={cityData}
                                  onCardClick={() =>
                                    handleCityCardClick(country, city)
                                  }
                                  minPrice={globalMinPrice}
                                  maxPrice={globalMaxPrice}
                                  adults={adults}
                                  teens={teens}
                                  children={children}
                                  infants={infants}
                                  tripType={searchParams?.tripType}
                                  imageFilename={airportData?.imageFilename}
                                />
                              );
                            });
                          })()}
                        </StaggerGrid>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Detailed City Groups - Show when expanded */}
                  <AnimatePresence mode="sync">
                    {openCountries[country] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{
                          type: "tween",
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                        className="space-y-4"
                      >
                        {sortCities(countryData.cities).map(
                          ([city, cityData]) => (
                            <CityGroup
                              key={city}
                              city={city}
                              cityData={{
                                ...cityData,
                                flights: cityData.flights,
                              }}
                              adults={adults}
                              teens={teens}
                              children={children}
                              infants={infants}
                              isLoading={isLoading}
                              isExpanded={expandedCities[city]}
                              isHighlighted={
                                scrollState.highlightedCity === city
                              }
                              onExpandChange={(expanded) =>
                                handleCityExpandChange(city, expanded)
                              }
                              minPrice={globalMinPrice}
                              maxPrice={globalMaxPrice}
                              highlightedFlightId={
                                scrollState.highlightedFlightId
                              }
                              onFlightHighlight={handleFlightHighlight}
                              tripType={searchParams?.tripType || "return"}
                              sortFlights={sortFlights}
                              columns={columns}
                            />
                          ),
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          },
        )}
      </AnimatePresence>

      {/* Price change disclaimer */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Please note that prices may change due to availability at time of
        booking.
      </div>
    </div>
  );
}
