import type { Flight, CountryData, CityData } from "../../types/flight";
import {
  formatDateTime,
  generateRyanairLink,
  calculateTripDays,
  getPriceColor,
  INFANT_SEAT_PRICE,
} from "../../utils/flightUtils";
import { useState, useEffect } from "react";
import { Frown } from "lucide-react";

interface FlightResultsProps {
  flights: Flight[];
  adults: number;
  teens: number;
  children: number;
  infants: number;
  isLoading?: boolean;
  searchParams?: SearchParams;
}

interface SearchParams {
  tripType: "oneWay" | "return";
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

// Add export to the LoadingIndicator component
export function LoadingIndicator() {
  return (
    <div className="mx-auto flex max-w-3xl select-none flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-6 flex items-center justify-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-[spin_2s_linear_infinite] rounded-full border-[3px] border-gray-200 dark:border-gray-700" />
          <div className="absolute inset-0 animate-[spin_1.5s_linear_infinite] rounded-full border-[3px] border-transparent border-t-orange-500 dark:border-t-orange-400" />
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
        Searching for flights...
      </h3>
      <p className="text-gray-600 dark:text-gray-400">
        This might take a few moments
      </p>
    </div>
  );
}

// Add new MiniFlightCard component
function MiniFlightCard({
  flight,
  minPrice,
  maxPrice,
  onClick,
  onFlightClick,
  tripType = "return",
}: {
  flight: Flight;
  minPrice: number;
  maxPrice: number;
  onClick?: () => void;
  onFlightClick?: (flightId: string) => void;
  tripType?: "oneWay" | "return";
}) {
  const [isHovered, setIsHovered] = useState(false);
  const flightId = `${flight.outbound.origin}-${flight.outbound.destination}-${flight.outbound.departureTime}`;
  const tripDays =
    tripType === "return"
      ? calculateTripDays(
          flight.outbound.departureTime,
          flight.inbound.departureTime,
        )
      : undefined;

  const handleClick = () => {
    onClick?.();
    onFlightClick?.(flightId);

    setTimeout(() => {
      const detailedCard = document.getElementById(`flight-${flightId}`);
      if (detailedCard) {
        detailedCard.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  const priceColor = getPriceColor(flight.totalPrice, minPrice, maxPrice);

  return (
    <div className="relative inline-block h-[4.5rem] w-[8.8rem] xsm:h-[4.7rem] xsm:w-[9.3rem] sm:h-20 sm:w-[9.85rem]">
      {/* SVG Background */}
      <svg
        width="158"
        height="80"
        viewBox="0 0 158 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-0 top-0 -ml-2 -mt-1 scale-90 transition-all duration-300 xsm:-ml-1 xsm:-mt-[0.15rem] xsm:scale-95 sm:ml-0 sm:mt-0 sm:scale-100"
        style={{
          fill: isHovered ? priceColor.backgroundHover : priceColor.background,
          stroke: isHovered
            ? priceColor.borderColor
            : priceColor.backgroundHover,
        }}
      >
        <path d="M154.576 49.9734L154.611 49.985L154.646 49.9916C156.184 50.2769 157.3 51.5699 157.3 53.125V69.9994C157.294 75.1126 153.144 79.5 148 79.5H9.79999C4.65607 79.5 0.506225 75.1127 0.5 69.9997V53.125C0.5 51.5699 1.61583 50.2769 3.1537 49.9916L3.18927 49.985L3.22351 49.9734C12.4457 46.8365 12.4607 33.1581 3.22303 30.0265L3.18902 30.0149L3.15371 30.0084C1.61583 29.7231 0.5 28.4301 0.5 26.875V10C0.5 4.88996 4.66244 0.506539 9.8003 0.5H148C153.138 0.506539 157.3 4.88996 157.3 10V26.875C157.3 28.4301 156.184 29.7231 154.646 30.0084L154.611 30.0149L154.577 30.0265C145.339 33.1581 145.354 46.8365 154.576 49.9734Z" />
      </svg>

      {/* Content */}
      <div
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col justify-between px-5 py-3"
      >
        <div className="flex items-center justify-between">
          <span className="whitespace-nowrap text-[0.938rem] font-medium text-gray-800 dark:text-gray-800">
            {formatDateTime(flight.outbound.departureTime, true)}
          </span>
          {tripType === "return" && (
            <>
              <span className="px-[2px] text-gray-600 dark:text-gray-800">
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 8 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="translate-y-[1px] -rotate-90"
                >
                  <path
                    d="M4.35355 7.35355C4.15829 7.54882 3.84171 7.54882 3.64645 7.35355L0.464466 4.17157C0.269204 3.97631 0.269204 3.65973 0.464466 3.46447C0.659728 3.2692 0.976311 3.2692 1.17157 3.46447L4 6.29289L6.82843 3.46447C7.02369 3.2692 7.34027 3.2692 7.53553 3.46447C7.7308 3.65973 7.7308 3.97631 7.53553 4.17157L4.35355 7.35355ZM4.5 0L4.5 7H3.5L3.5 0L4.5 0Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="whitespace-nowrap text-[0.938rem] font-medium text-gray-800 dark:text-gray-800">
                {formatDateTime(flight.inbound.departureTime, true)}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          {tripType === "return" && tripDays && (
            <span className="text-xs text-gray-600 dark:text-gray-700">
              {tripDays} day{tripDays !== 1 ? "s" : ""}
            </span>
          )}
          <span className="font-bold" style={{ color: priceColor.text }}>
            €{Math.round(flight.totalPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}

// Update the MiniCityCard component
function MiniCityCard({
  city,
  cityData,
  onCardClick,
  minPrice,
  maxPrice,
}: {
  city: string;
  cityData: CityData;
  onCardClick: () => void;
  minPrice: number;
  maxPrice: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const priceColor = getPriceColor(cityData.minPrice, minPrice, maxPrice);

  return (
    <div className="relative m-2 inline-block h-20 w-[12.5rem]">
      {/* SVG Background - Updated path with only left cutout */}
      <svg
        width="200"
        height="80"
        viewBox="0 0 200 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-0 top-0 transition-all duration-300"
        style={{
          fill: isHovered ? priceColor.backgroundHover : priceColor.background,
          stroke: isHovered
            ? priceColor.borderColor
            : priceColor.backgroundHover,
        }}
      >
        <path d="M3.22351 49.9734C7.43279 48.5416 10.3066 44.4181 10.3 39.9992C10.2933 35.5833 7.44159 31.4566 3.22303 30.0265L3.18902 30.0149L3.15371 30.0084C2.36273 29.8616 1.73122 29.5008 1.23708 28.9245C0.746737 28.3527 0.5 27.678 0.5 26.875V10C0.5 7.38057 1.40928 5.15314 3.238 3.29027C5.06683 1.42729 7.2455 0.503239 9.8003 0.5H190.2C192.754 0.503239 194.933 1.42729 196.762 3.29027C198.591 5.15314 199.5 7.38057 199.5 10V70C199.5 72.6194 198.591 74.8469 196.762 76.7097C194.933 78.5727 192.754 79.4968 190.2 79.5H9.79999C7.24185 79.5 5.06355 78.5775 3.2383 76.715C1.41279 74.8523 0.50318 72.623 0.5 69.9997V53.125C0.5 52.322 0.746738 51.6473 1.23707 51.0755C1.73123 50.4992 2.36273 50.1383 3.1537 49.9916L3.18927 49.985L3.22351 49.9734Z" />
      </svg>

      {/* Content */}
      <div
        onClick={onCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute left-0 top-0 flex h-20 w-[12.5rem] cursor-pointer flex-col justify-between px-6 py-3"
      >
        <div
          className="truncate font-medium text-gray-800 dark:text-gray-800"
          title={city}
        >
          {city}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-600 dark:text-gray-700">
            {cityData.flights.length} flight
            {cityData.flights.length !== 1 ? "s" : ""}
          </span>
          <span className="font-bold" style={{ color: priceColor.text }}>
            €{Math.round(cityData.minPrice)}
          </span>
        </div>
      </div>
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
}

// Add these utility functions to src/utils/flightUtils.ts
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const weekday = date.toLocaleDateString("en-US", {
    weekday: "long", // 'Monday' instead of 'Mon'
  });

  // Format as DD/MM/YYYY
  const numericDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${weekday}, ${numericDate}`;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Add this new component before the CityGroup component
function DetailedFlightCard({
  flight,
  adults,
  teens,
  children,
  infants,
  tripDays,
  minPrice,
  maxPrice,
  isHighlighted,
  tripType = "return",
}: {
  flight: Flight;
  adults: number;
  teens: number;
  children: number;
  infants: number;
  tripDays?: number;
  minPrice: number;
  maxPrice: number;
  isHighlighted?: boolean;
  tripType?: "oneWay" | "return";
}) {
  const [isHovered, setIsHovered] = useState(false);
  const priceColor = getPriceColor(flight.totalPrice, minPrice, maxPrice);
  const flightId = `${flight.outbound.origin}-${flight.outbound.destination}-${flight.outbound.departureTime}`;
  const infantFee =
    INFANT_SEAT_PRICE * infants * (tripType === "return" ? 2 : 1);

  return (
    <div
      id={`flight-${flightId}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative mx-0 my-4 rounded-3xl transition-all duration-200 sm:mx-2 md:mx-8 md:my-8 ${
        isHighlighted ? "ring-2 ring-gray-500 dark:ring-gray-200" : ""
      }`}
    >
      <div className="relative flex flex-col overflow-hidden md:grid md:grid-cols-[3fr,0px,14rem]">
        <div className="space-y-4 rounded-3xl rounded-b-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-300 group-hover:border-slate-200 group-hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 group-hover:dark:border-slate-500 group-hover:dark:bg-slate-700 md:rounded-3xl md:rounded-r-xl md:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-200">
                {tripType === "oneWay" ? "From" : "Outbound"}
              </div>
              <div className="text-xl font-bold md:text-2xl">
                {flight.outbound.origin}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-200 md:text-sm">
                {flight.outbound.originFull}
              </div>
            </div>

            <div className="flex flex-col items-center px-2 md:px-4">
              {tripType === "return" && tripDays && (
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="hidden h-[1px] w-8 border-b border-dashed border-gray-300 dark:border-gray-400 md:block"></div>
                  <div className="flex items-baseline gap-1.5 text-gray-600 dark:text-gray-200">
                    <span className="text-sm md:text-base">{tripDays}</span>
                    <span className="text-sm md:text-base">
                      {tripDays === 1 ? "day" : "days"}
                    </span>
                  </div>
                  <div className="hidden h-[1px] w-8 border-b border-dashed border-gray-300 dark:border-gray-400 md:block"></div>
                </div>
              )}
            </div>

            <div className="space-y-1 text-right">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-200">
                {tripType === "oneWay" ? "To" : "Return"}
              </div>
              <div className="text-xl font-bold md:text-2xl">
                {flight.outbound.destination}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-200 md:text-sm">
                {flight.outbound.destinationFull}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-4 border-t border-dashed border-gray-200 pt-4 dark:border-gray-400 min-[450px]:flex-row md:gap-0">
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-200">
                Departure
              </div>
              <div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-200 md:text-lg">
                  {formatDate(flight.outbound.departureTime)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-200">
                  at {formatTime(flight.outbound.departureTime)}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-200">
                from {flight.outbound.origin}
              </div>
            </div>
            {tripType === "return" && (
              <div className="space-y-2 md:text-right">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-200">
                  Return
                </div>
                <div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-200 md:text-lg">
                    {formatDate(flight.inbound.departureTime)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-200">
                    at {formatTime(flight.inbound.departureTime)}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-200">
                  from {flight.inbound.origin}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vertical divider with cutouts */}
        <div className="relative hidden md:block">
          <div className="-m-[1px] h-full w-[2px] border border-dashed border-white dark:border-gray-900"></div>
        </div>

        {/* Horizontal divider for mobile */}
        <div className="-m-[1px] block h-[2px] border border-dashed border-white dark:border-gray-900 md:hidden"></div>

        {/* Right section - Price and booking */}
        <div
          className="flex flex-col justify-between rounded-3xl rounded-t-xl border p-4 transition-all duration-300 md:rounded-3xl md:rounded-l-xl md:p-6"
          style={{
            backgroundColor: isHovered
              ? priceColor.backgroundHover
              : priceColor.background,
            borderColor: isHovered
              ? priceColor.borderColor
              : priceColor.backgroundHover,
          }}
        >
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-900">
              Total Price
            </div>
            <div
              className="text-2xl font-bold md:text-3xl"
              style={{ color: priceColor.text }}
            >
              €{Math.round(flight.totalPrice)}
            </div>
            <div className="mt-1 space-y-1">
              <div className="text-xs text-gray-500 dark:text-gray-900 md:text-sm">
                {adults > 0 && `${adults} adult${adults !== 1 ? "s" : ""}`}
                {teens > 0 && ` • ${teens} teen${teens !== 1 ? "s" : ""}`}
                {children > 0 &&
                  ` • ${children} ${children === 1 ? "child" : "children"}`}
              </div>
              {infants > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-900 md:text-sm">
                  {infants} infant{infants !== 1 ? "s" : ""} (
                  {tripType === "return" ? "2×" : ""}€25 seat fee)
                </div>
              )}
            </div>
          </div>

          <a
            href={generateRyanairLink(
              flight,
              adults,
              teens,
              children,
              infants,
              tripType,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="button-animation-subtle group/flight-button relative mt-4 inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-black px-3 py-2 text-sm font-semibold text-white transition-all hover:bg-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800 md:px-4 md:py-2.5"
            aria-label={`Book flight from ${flight.outbound.origin} to ${flight.outbound.destination} for €${Math.round(flight.totalPrice)}`}
          >
            <span className="flex items-center">
              Book Flight
              <svg
                width="21"
                height="20"
                viewBox="0 0 21 20"
                fill="none"
                className="ml-2 h-4 w-4 transform transition-all duration-500 ease-pop group-hover/flight-button:translate-x-1"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                role="presentation"
              >
                <path
                  d="M13.553 11.5L8.5 19.5L6.5 19.5L9.026 11.5L3.666 11.5L2 14.5L0.499999 14.5L1.5 10L0.5 5.5L2 5.5L3.667 8.5L9.027 8.5L6.5 0.499999L8.5 0.499999L13.553 8.5L19 8.5C19.3978 8.5 19.7794 8.65804 20.0607 8.93934C20.342 9.22064 20.5 9.60218 20.5 10C20.5 10.3978 20.342 10.7794 20.0607 11.0607C19.7794 11.342 19.3978 11.5 19 11.5L13.553 11.5Z"
                  fill="white"
                />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}

// Update the CityGroup component
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
}: CityGroupProps & {
  minPrice: number;
  maxPrice: number;
  highlightedFlightId?: string | null;
  onFlightHighlight?: (flightId: string | null) => void;
  tripType?: "oneWay" | "return";
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
      className={`mb-2 rounded-3xl border bg-white p-3 transition-all dark:bg-gray-900 max-[450px]:p-2 md:mb-4 md:p-6 ${
        isHighlighted
          ? "border-gray-400 dark:border-gray-400"
          : "border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500"
      }`}
    >
      <div
        className="mb-3 cursor-pointer px-2 text-xl font-semibold text-gray-700 transition-colors hover:text-black dark:text-gray-200 dark:hover:text-gray-400 sm:px-0"
        onClick={handleToggle}
      >
        <div className="mr-1 mt-4 flex select-none items-center justify-between gap-2 sm:mt-1">
          <div className="flex items-baseline gap-2">
            {city}
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({cityData.flights.length} flight
              {cityData.flights.length !== 1 ? "s" : ""})
            </span>
          </div>
          <div className="relative h-5 w-5">
            <div
              className={`absolute left-1/2 top-1/2 h-0.5 w-3.5 -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-300 ${isExpanded ? "rotate-45" : ""}`}
            ></div>
            <div
              className={`absolute left-1/2 top-1/2 h-3.5 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-300 ${isExpanded ? "rotate-45" : ""}`}
            ></div>
          </div>
        </div>
      </div>

      {/* Mini Cards - Show when collapsed */}
      {!isExpanded && (
        <div className="mini-cards mb-1 mt-2 flex flex-wrap gap-x-2 gap-y-2 xxsm:gap-x-2 xsm:mb-0 sm:mt-2 sm:gap-x-4 sm:gap-y-4">
          {cityData.flights
            .sort((a, b) => a.totalPrice - b.totalPrice)
            .map((flight, index) => (
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
              />
            ))}
        </div>
      )}

      {/* Detailed Cards - Show when expanded */}
      {isExpanded && (
        <div className="detailed-cards">
          {cityData.flights
            .sort((a, b) => a.totalPrice - b.totalPrice)
            .map((flight, index) => {
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
        </div>
      )}
    </div>
  );
}

// Add this near the top of the file, after the interfaces
interface CountryOpenState {
  [key: string]: boolean;
}

// Add this near the top with other state interfaces
interface ScrollState {
  highlightedCountry: string | null;
  highlightedCity: string | null;
  highlightedFlightId: string | null;
}

// Add this new component near the top of the file
export function NoResultsMessage({
  searchParams,
}: {
  searchParams?: SearchParams | null;
}) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
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
      {/*<div className="text-sm text-gray-500 dark:text-gray-500">
        Search parameters:
        <div className="mt-2 space-y-1">
          {searchParams && (
            <>
              <div>
                Dates: {searchParams.startDate} - {searchParams.endDate}
              </div>
              <div>From: {searchParams.originAirports.join(", ")}</div>
              <div>To: {searchParams.wantedCountries.join(", ")}</div>
              <div>Max price: €{searchParams.maxPrice}</div>
              <div>
                Stay duration: {searchParams.minDays}-{searchParams.maxDays}{" "}
                days
              </div>
            </>
          )}
        </div>
      </div>*/}
    </div>
  );
}

// Filter flights within date range
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

// Update the main FlightResults component to filter flights
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

  // Filter flights before processing
  const validFlights = flights.filter((flight) =>
    isFlightWithinDateRange(flight, searchParams),
  );

  // Calculate global price range from filtered flights
  const globalMinPrice = Math.min(...validFlights.map((f) => f.totalPrice));
  const globalMaxPrice = Math.max(...validFlights.map((f) => f.totalPrice));

  // Group filtered flights by country and city
  const groupedFlights = validFlights.reduce(
    (acc, flight) => {
      const destinationParts = flight.outbound.destinationFull.split(", ");
      const country =
        destinationParts.length > 1
          ? destinationParts[destinationParts.length - 1]
          : flight.outbound.destinationCountry || "Unknown Country";

      const city =
        destinationParts.length > 1
          ? destinationParts.slice(0, -1).join(", ")
          : flight.outbound.destinationFull;

      if (!acc[country]) {
        acc[country] = {
          minPrice: flight.totalPrice,
          cities: {},
        };
      }

      if (!acc[country].cities[city]) {
        acc[country].cities[city] = {
          flights: [],
          minPrice: flight.totalPrice,
        };
      }

      acc[country].minPrice = Math.min(
        acc[country].minPrice,
        flight.totalPrice,
      );
      acc[country].cities[city].minPrice = Math.min(
        acc[country].cities[city].minPrice,
        flight.totalPrice,
      );
      acc[country].cities[city].flights.push(flight);

      return acc;
    },
    {} as Record<string, CountryData>,
  );

  // Add this function to handle country toggles
  const toggleCountry = (country: string) => {
    setOpenCountries((prev) => ({
      ...prev,
      [country]: !prev[country],
    }));
  };

  // Add function to handle city card click
  const handleCityCardClick = (country: string, city: string) => {
    // Open the country if it's not already open
    setOpenCountries((prev) => ({
      ...prev,
      [country]: true,
    }));

    // Expand the target city group
    setExpandedCities((prev) => ({
      ...prev,
      [city]: true,
    }));

    // Set the highlighted elements
    setScrollState({
      highlightedCountry: country,
      highlightedCity: city,
      highlightedFlightId: null,
    });

    // Scroll to the city element
    setTimeout(() => {
      const cityElement = document.getElementById(
        `city-group-${city.toLowerCase().replace(/\s+/g, "-")}`,
      );
      if (cityElement) {
        cityElement.scrollIntoView({
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

  // Add handler for city group expansion changes
  const handleCityExpandChange = (city: string, expanded: boolean) => {
    setExpandedCities((prev) => ({
      ...prev,
      [city]: expanded,
    }));
  };

  // Add handleCountryCardClick function
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

  return (
    <div className="w-full space-y-4 md:space-y-8">
      <div className="mb-4 h-8 text-2xl font-bold">
        {isLoading ? (
          <p className="text-gray-600">
            Found {validFlights.length} flights so far...
          </p>
        ) : validFlights.length > 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            Found {validFlights.length} flight
            {validFlights.length !== 1 ? "s" : ""} to explore
          </p>
        ) : null}
      </div>

      {Object.entries(groupedFlights)
        .sort(([, countryDataA], [, countryDataB]) => {
          return countryDataA.minPrice - countryDataB.minPrice;
        })
        .map(([country, countryData]) => {
          // Calculate total flights for this country
          const totalFlights = Object.values(countryData.cities).reduce(
            (sum, city) => sum + city.flights.length,
            0,
          );

          return (
            <div
              key={country}
              id={`country-group-${country.toLowerCase().replace(/\s+/g, "-")}`}
              className={`my-4 w-full rounded-3xl border bg-white p-3 transition-all dark:bg-gray-900 max-[450px]:p-2 sm:p-6 ${
                scrollState.highlightedCountry === country
                  ? "border-gray-300 dark:border-gray-400"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              }`}
            >
              <div className="mx-2">
                <div
                  className="mb-4 ml-2 mt-2 cursor-pointer text-3xl font-bold text-gray-800 transition-colors hover:text-black dark:text-gray-100 dark:hover:text-gray-400 sm:mt-0"
                  onClick={() => toggleCountry(country)}
                >
                  <div className="mr-1 flex select-none items-center justify-between gap-2 sm:-mr-1">
                    <div className="flex items-center gap-2">
                      {country}
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        ({totalFlights} flight{totalFlights !== 1 ? "s" : ""})
                      </span>
                    </div>
                    <div className="relative h-6 w-6">
                      <div
                        className={`absolute left-1/2 top-1/2 h-0.5 w-4 -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-300 ${openCountries[country] ? "rotate-45" : ""}`}
                      ></div>
                      <div
                        className={`absolute left-1/2 top-1/2 h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-current transition-transform duration-300 ${openCountries[country] ? "rotate-45" : ""}`}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Mini City Cards - Show when collapsed */}
                {!openCountries[country] && (
                  <div className="mini-cards mb-3 mt-3 flex flex-wrap">
                    {Object.entries(countryData.cities)
                      .sort(([, cityDataA], [, cityDataB]) => {
                        return cityDataA.minPrice - cityDataB.minPrice;
                      })
                      .map(([city, cityData]) => (
                        <MiniCityCard
                          key={`mini-${city}`}
                          city={city}
                          cityData={cityData}
                          onCardClick={() => handleCityCardClick(country, city)}
                          minPrice={globalMinPrice}
                          maxPrice={globalMaxPrice}
                        />
                      ))}
                  </div>
                )}

                {/* Detailed City Groups - Show when expanded */}
                {openCountries[country] && (
                  <div className="space-y-4">
                    {Object.entries(countryData.cities)
                      .sort(([, cityDataA], [, cityDataB]) => {
                        return cityDataA.minPrice - cityDataB.minPrice;
                      })
                      .map(([city, cityData]) => (
                        <CityGroup
                          key={city}
                          city={city}
                          cityData={cityData}
                          adults={adults}
                          teens={teens}
                          children={children}
                          infants={infants}
                          isLoading={isLoading}
                          isExpanded={expandedCities[city]}
                          isHighlighted={scrollState.highlightedCity === city}
                          onExpandChange={(expanded) =>
                            handleCityExpandChange(city, expanded)
                          }
                          minPrice={globalMinPrice}
                          maxPrice={globalMaxPrice}
                          highlightedFlightId={scrollState.highlightedFlightId}
                          onFlightHighlight={handleFlightHighlight}
                          tripType={searchParams?.tripType || "return"}
                        />
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}
