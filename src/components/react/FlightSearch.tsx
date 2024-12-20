import React, { useEffect, useState, FormEvent, useRef } from "react";
import { airports } from "../../data/airports";
import { countries } from "../../data/countries";
import type { Flight } from "../../types/flight";
import {
  FlightResults,
  NoResultsMessage,
  LoadingIndicator,
} from "./FlightResults";
import { BaseModal } from "./modals/BaseModal";
import { NumberModal } from "./modals/NumberModal";
import { BubbleModal } from "./modals/BubbleModal";
import { PriceModal } from "./modals/PriceModal";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "./modals/DatePicker";
import { format } from "date-fns";
import { MultiCombobox } from "@/components/react/modals/multi-combobox";
import { PopMotion } from "@/components/react/motion/PopMotion";
import { PlaneTakeoff, PlaneLanding, CalendarFold } from "lucide-react";
import {
  isWeekend,
  isFriday,
  isSaturday,
  isSunday,
  isThursday,
  isMonday,
} from "date-fns";
import type { SearchParams } from "../../types/search";
import { addWeeks, nextFriday, nextThursday, addDays } from "date-fns";

interface ModalState {
  tripType: boolean;
  weekendMode: boolean;
  passengers: boolean;
  locations: boolean;
  dates: boolean;
  duration: boolean;
  budget: boolean;
}

interface PassengerType {
  type: "teen" | "child" | "infant";
  count: number;
}

interface ApiResponse {
  type?: string;
  message?: string;
}

interface WeekendRange {
  startDate: Date;
  endDate: Date;
}

type TripType = "oneWay" | "return" | "weekend" | "longWeekend";

// Helper function to generate valid weekend date ranges based on weekendCount and type
// For regular weekends: Friday-Sunday
// For long weekends: Thursday-Monday
function generateWeekendDates(
  weekendCount: number,
  isLongWeekend: boolean,
): WeekendRange {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if current weekend is still valid
  const friday = new Date(today);
  while (friday.getDay() !== 5) {
    // 5 = Friday
    friday.setDate(friday.getDate() - 1);
  }

  // If it's before or on Friday and the time is before 17:00 on Friday,
  // include current weekend
  const isBeforeFridayEvening =
    today <= friday && (today.getDay() !== 5 || today.getHours() < 17);

  let startDay;
  if (isBeforeFridayEvening) {
    // Use current weekend's Friday/Thursday
    startDay = isLongWeekend
      ? new Date(friday.setDate(friday.getDate() - 1)) // Thursday
      : friday;
  } else {
    // Use next weekend
    startDay = isLongWeekend ? nextThursday(today) : nextFriday(today);
  }

  const endDay = addDays(
    addWeeks(startDay, weekendCount - 1),
    isLongWeekend ? 4 : 2,
  );

  return {
    startDate: startDay,
    endDate: endDay,
  };
}

// Handles API requests with a timeout to prevent hanging requests
const fetchWithTimeout = async (url: string, timeout = 5000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

// Creates and manages SSE connection for real-time flight search results
// Returns cleanup function to properly close connection
const createEventSourceWithCleanup = (url: string) => {
  const eventSource = new EventSource(url, { withCredentials: false });

  const cleanup = () => {
    if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
      eventSource.close();
    }
  };

  return { eventSource, cleanup };
};

// Validates if a date is a valid weekend outbound date based on mode,
// I'm tired debugging python backend, so it's easier for me just filter incoming flights to fit into date range :P
// Default mode: Friday or Saturday
// Relaxed mode: Thursday, Friday or Saturday
const isValidWeekendOutbound = (
  date: Date,
  mode: "default" | "relaxed",
): boolean => {
  if (mode === "default") {
    return isFriday(date) || isSaturday(date);
  }
  return isThursday(date) || isFriday(date) || isSaturday(date);
};

// Validates if a date is a valid weekend return date based on outbound date
// Default mode: Saturday or Sunday for Friday departures
// Relaxed mode: Sunday or Monday for Thursday/Friday departures
const isValidWeekendReturn = (
  date: Date,
  mode: "default" | "relaxed",
  outboundDate: Date,
): boolean => {
  if (mode === "default") {
    return isSaturday(date) || isSunday(date);
  }
  if (isThursday(outboundDate)) {
    return isSaturday(date) || isSunday(date);
  }
  return isSunday(date) || isMonday(date);
};

// Checks if time is after standard work hours (17:00/5PM)
// Used for validating Friday evening departures
const isOutsideWorkHours = (date: Date): boolean => {
  const hours = date.getHours();
  return hours >= 17; // After 5 PM
};

// Validates if a flight matches weekend trip criteria
// Regular weekend: Depart Friday evening/Saturday, return Saturday/Sunday
// Long weekend: Depart Thursday-Saturday, return based on departure day
const isValidWeekendFlight = (
  flight: Flight,
  isLongWeekend: boolean,
): boolean => {
  const outboundDate = new Date(flight.outbound.departureTime);
  const returnDate = new Date(flight.inbound.departureTime);

  if (!isLongWeekend) {
    // Regular weekend
    const isValidOutbound =
      (isFriday(outboundDate) && isOutsideWorkHours(outboundDate)) ||
      isSaturday(outboundDate);
    const isValidReturn = isSaturday(returnDate) || isSunday(returnDate);
    return isValidOutbound && isValidReturn;
  } else {
    // Long weekend
    const isValidOutbound =
      isThursday(outboundDate) ||
      isFriday(outboundDate) ||
      isSaturday(outboundDate);

    if (isThursday(outboundDate)) {
      return (
        isValidOutbound && (isSaturday(returnDate) || isSunday(returnDate))
      );
    } else {
      return isValidOutbound && (isSunday(returnDate) || isMonday(returnDate));
    }
  }
};

// Type guard to check if trip type is weekend-related
const isWeekendTripType = (type: TripType): boolean => {
  return type === "weekend" || type === "longWeekend";
};

export default function FlightSearch() {
  // State for form values and UI control
  const [tripType, setTripType] = useState<TripType>("return");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adults, setAdults] = useState(1);
  const [teens, setTeens] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(550);
  const [minDays, setMinDays] = useState<number>(5);
  const [maxDays, setMaxDays] = useState<number>(7);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [activeModal, setActiveModal] = useState<ModalState>({
    tripType: false,
    weekendMode: false,
    passengers: false,
    locations: false,
    dates: false,
    duration: false,
    budget: false,
  });
  const [passengers, setPassengers] = useState<PassengerType[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  });
  const [noFlightsFound, setNoFlightsFound] = useState(false);
  const [weekendCount, setWeekendCount] = useState<number>(4);

  // Cleanup reference for SSE connection
  const cleanupRef = React.useRef<(() => void) | null>(null);
  // Reference for scroll behavior after search
  const submitResultsFold = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (dateRange?.from) {
      setStartDate(format(dateRange.from, "yyyy-MM-dd"));
    }
    if (dateRange?.to) {
      setEndDate(format(dateRange.to, "yyyy-MM-dd"));
    }
  }, [dateRange]);

  // Updates form state based on selected trip type
  // Resets relevant fields for different trip types
  const updateFormForTripType = (type: TripType) => {
    setTripType(type);
  };

  // Persists form data to localStorage for user convenience
  const saveFormData = () => {
    const dataToSave = {
      tripType,
      weekendCount,
      adults,
      teens,
      children,
      infants,
      startDate,
      endDate,
      maxPrice,
      minDays,
      maxDays,
      originAirports: selectedOrigins,
      wantedCountries: selectedCountries,
      dateRange: dateRange
        ? {
            from: dateRange.from?.toISOString(),
            to: dateRange.to?.toISOString(),
          }
        : undefined,
    };
    localStorage.setItem("flightSearchPreferences", JSON.stringify(dataToSave));
  };

  // Loads saved form data from localStorage
  // Initializes default values if no saved data exists
  const loadFormData = () => {
    const savedData = localStorage.getItem("flightSearchPreferences");

    if (!savedData) {
      setTripType("return");
      setWeekendCount(4);
      setAdults(1);
      setTeens(0);
      setChildren(0);
      setInfants(0);
      setMaxPrice(550);
      setMinDays(5);
      setMaxDays(7);
      setSelectedOrigins([]);
      setSelectedCountries([]);
      setDateRange(undefined);
      setPassengers([]);
      return;
    }

    try {
      const formData = JSON.parse(savedData);
      console.log("Loading from localStorage:", formData);

      setPassengers([]);

      if (formData.tripType) {
        setTripType(formData.tripType as TripType);
      }
      if (formData.adults) {
        setAdults(Number(formData.adults));
      }

      const newPassengers: PassengerType[] = [];

      if (formData.teens && Number(formData.teens) > 0) {
        newPassengers.push({ type: "teen", count: Number(formData.teens) });
        setTeens(Number(formData.teens));
      }
      if (formData.children && Number(formData.children) > 0) {
        newPassengers.push({ type: "child", count: Number(formData.children) });
        setChildren(Number(formData.children));
      }
      if (formData.infants && Number(formData.infants) > 0) {
        newPassengers.push({ type: "infant", count: Number(formData.infants) });
        setInfants(Number(formData.infants));
      }

      setPassengers(newPassengers);

      if (formData.startDate) {
        setStartDate(formData.startDate);
      }
      if (formData.endDate) {
        setEndDate(formData.endDate);
      }
      if (formData.maxPrice) {
        setMaxPrice(Number(formData.maxPrice));
      }
      if (formData.minDays) {
        setMinDays(Number(formData.minDays));
      }
      if (formData.maxDays) {
        setMaxDays(Number(formData.maxDays));
      }
      if (formData.originAirports) {
        setSelectedOrigins(formData.originAirports);
      }
      if (formData.wantedCountries) {
        setSelectedCountries(formData.wantedCountries);
      }
      if (formData.dateRange) {
        const newDateRange = {
          from: formData.dateRange.from
            ? new Date(formData.dateRange.from)
            : undefined,
          to: formData.dateRange.to
            ? new Date(formData.dateRange.to)
            : undefined,
        };
        setDateRange(newDateRange);
        if (newDateRange.from) {
          setStartDate(format(newDateRange.from, "yyyy-MM-dd"));
        }
        if (newDateRange.to) {
          setEndDate(format(newDateRange.to, "yyyy-MM-dd"));
        }
      } else if (formData.startDate || formData.endDate) {
        const newDateRange = {
          from: formData.startDate ? new Date(formData.startDate) : undefined,
          to: formData.endDate ? new Date(formData.endDate) : undefined,
        };
        setDateRange(newDateRange);
        if (formData.startDate) {
          setStartDate(formData.startDate);
        }
        if (formData.endDate) {
          setEndDate(formData.endDate);
        }
      }
      if (formData.weekendCount) {
        setWeekendCount(Number(formData.weekendCount));
      }
    } catch (error) {
      console.error("Error loading saved preferences:", error);
    }
  };

  // Validates if a flight's return date is within selected date range
  const isFlightWithinDateRange = (flight: Flight) => {
    if (!endDate) return true;
    const inboundDate = new Date(flight.inbound.departureTime);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999); // Set to end of day
    return inboundDate <= endDateObj;
  };

  // Handles form submission and initiates flight search
  // Sets up SSE connection for real-time results
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFlights([]);
    setLoading(true);
    setError(null);
    setNoFlightsFound(false);

    if (cleanupRef.current) {
      cleanupRef.current();
    }

    // Calculate weekend dates if in weekend mode
    let searchStartDate = startDate;
    let searchEndDate = endDate;

    if (isWeekendTripType(tripType)) {
      const { startDate: start, endDate: end } = generateWeekendDates(
        weekendCount,
        tripType === "longWeekend",
      );
      searchStartDate = format(start, "yyyy-MM-dd");
      searchEndDate = format(end, "yyyy-MM-dd");
    }

    const newSearchParams: SearchParams = {
      tripType,
      startDate: searchStartDate,
      endDate: searchEndDate,
      maxPrice,
      minDays: isWeekendTripType(tripType)
        ? 1
        : tripType === "oneWay"
          ? 0
          : minDays,
      maxDays:
        tripType === "weekend"
          ? 2
          : tripType === "longWeekend"
            ? 3
            : tripType === "oneWay"
              ? 0
              : maxDays,
      originAirports: selectedOrigins,
      wantedCountries: selectedCountries,
      adults,
      teens,
      children,
      infants,
    };

    if (selectedOrigins.length === 0) {
      setError("Please select at least one departure airport");
      setLoading(false);
      return;
    }

    if (selectedCountries.length === 0) {
      setError("Please select at least one destination country");
      setLoading(false);
      return;
    }

    if (tripType !== "weekend" && tripType !== "longWeekend") {
      if (!startDate) {
        setError("Please select a departure date");
        setLoading(false);
        return;
      }

      if (tripType === "return" && !endDate) {
        setError("Please select a return date");
        setLoading(false);
        return;
      }
    }

    setSearchParams(newSearchParams);

    try {
      const searchParamsForUrl = {
        ...newSearchParams,
        originAirports: newSearchParams.originAirports.join(","),
        wantedCountries: newSearchParams.wantedCountries.join(","),
        ...(tripType === "weekend" && {
          weekendCount: weekendCount,
        }),
      };

      const apiUrl = "https://flymebaby-python.onrender.com";
      //const apiUrl = "http://127.0.0.1:5000";
      const searchUrl = `${apiUrl}/api/search-flights?${new URLSearchParams(
        searchParamsForUrl as any,
      )}`;
      //console.log("Raw API request:", { url: searchUrl });
      const { eventSource, cleanup } = createEventSourceWithCleanup(searchUrl);
      cleanupRef.current = cleanup;

      eventSource.onerror = (error) => {
        if (flights.length > 0 || !loading) {
          cleanup();
          setLoading(false);
          return;
        }

        console.error("EventSource failed:", error);
        cleanup();
        setLoading(false);
        setError(
          "Connection to flight search service was lost. Please try again.",
        );
      };

      eventSource.onmessage = (event) => {
        //console.log("Raw API response:", event.data);
        setTimeout(() => {
          submitResultsFold.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);

        if (event.data === "END") {
          cleanup();
          setLoading(false);

          // Check if we have any valid flights
          setFlights((currentFlights) => {
            const validFlights = currentFlights.filter((flight) =>
              isWeekendTripType(tripType)
                ? isValidWeekendFlight(flight, tripType === "longWeekend")
                : isFlightWithinDateRange(flight),
            );
            if (validFlights.length === 0) {
              setNoFlightsFound(true);
            }
            return validFlights;
          });
          return;
        }

        try {
          const data = JSON.parse(event.data) as ApiResponse | Flight;

          if ("type" in data && data.type === "NO_FLIGHTS") {
            setNoFlightsFound(true);
            cleanup();
            setLoading(false);
            return;
          }

          // Only add flights that meet the criteria
          const flight = data as Flight;
          if (
            isWeekendTripType(tripType)
              ? isValidWeekendFlight(flight, tripType === "longWeekend")
              : isFlightWithinDateRange(flight)
          ) {
            setFlights((prevFlights) => {
              const newFlights = [...prevFlights, flight];
              return newFlights.sort((a, b) => a.totalPrice - b.totalPrice);
            });
          }

          if (loading) {
            setLoading(false);
          }
        } catch (error) {
          console.error("Error parsing flight data:", error);
          setError("Error processing flight data. Please try again.");
          cleanup();
          setLoading(false);
        }
      };
    } catch (error) {
      setLoading(false);
      setError(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred. Please try again.",
      );
    }
  };

  useEffect(() => {
    saveFormData();
  }, [
    tripType,
    adults,
    teens,
    children,
    infants,
    startDate,
    endDate,
    maxPrice,
    minDays,
    maxDays,
    selectedOrigins,
    selectedCountries,
  ]);

  // Manages modal visibility state
  // Ensures only one modal is open at a time
  const toggleModal = (modalName: keyof ModalState) => {
    setActiveModal((prev) => ({
      tripType: false,
      weekendMode: false,
      passengers: false,
      locations: false,
      dates: false,
      duration: false,
      budget: false,
      [modalName]: !prev[modalName],
    }));
  };

  // Passenger management functions
  const handleAddPassenger = (type: PassengerType["type"]) => {
    setPassengers((prev) => [...prev, { type, count: 1 }]);

    switch (type) {
      case "teen":
        setTeens(1);
        break;
      case "child":
        setChildren(1);
        break;
      case "infant":
        setInfants(1);
        break;
    }
  };

  // Handles removing a specific passenger type and resets its count
  const handleRemovePassenger = (typeToRemove: PassengerType["type"]) => {
    setPassengers((prev) => prev.filter((p) => p.type !== typeToRemove));

    switch (typeToRemove) {
      case "teen":
        setTeens(0);
        break;
      case "child":
        setChildren(0);
        break;
      case "infant":
        setInfants(0);
        break;
    }
  };

  // Updates the count for a specific passenger type
  // Syncs the count between passengers array and individual state variables
  const handleUpdatePassengerCount = (
    type: PassengerType["type"],
    count: number,
  ) => {
    setPassengers((prev) =>
      prev.map((p) => (p.type === type ? { ...p, count } : p)),
    );

    switch (type) {
      case "teen":
        setTeens(count);
        break;
      case "child":
        setChildren(count);
        break;
      case "infant":
        setInfants(count);
        break;
    }
  };

  return (
    <div className="mx-auto max-w-5xl rounded-lg bg-white p-4 dark:bg-gray-900 sm:p-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-8"
        role="search"
        aria-label="Flight search form"
      >
        <input type="hidden" name="tripType" value={tripType} />
        <input type="hidden" name="adults" value={adults} />
        <input type="hidden" name="children" value={children} />

        <div className="items-left flex flex-col gap-4 text-base leading-relaxed sm:items-center sm:gap-6 sm:text-lg">
          <PopMotion
            key="mode-section"
            className="flex flex-wrap items-center gap-x-2 gap-y-4"
            aria-label="trip-type-group"
          >
            <span id="trip-type-group">I'm looking for a</span>
            <BaseModal
              options={[
                { value: "return", label: "return" },
                { value: "oneWay", label: "one way" },
                { value: "weekend", label: "weekend" },
                { value: "longWeekend", label: "long weekend" },
              ]}
              currentValue={tripType}
              onChange={(value) => updateFormForTripType(value as TripType)}
              aria-label="Select trip type"
            />
            <span>flight</span>
            {(tripType === "weekend" || tripType === "longWeekend") && (
              <div className="flex items-center gap-2">
                <span>in the next</span>
                <NumberModal
                  value={weekendCount}
                  onChange={setWeekendCount}
                  singular="weekend"
                  plural="weekends"
                  min={1}
                  max={6}
                  aria-label="Number of weekends to search"
                />
              </div>
            )}
          </PopMotion>

          <PopMotion
            key="pasenger-section"
            layout="position"
            className="layout-animation flex flex-wrap items-center justify-end gap-x-1 gap-y-4 xsm:gap-x-2"
          >
            <span className="mr-1 xsm:mr-0">for</span>
            <NumberModal
              value={adults}
              onChange={setAdults}
              singular="adult"
              plural="adults"
              min={1}
              max={20}
            />
            {passengers.map((passenger, index) => (
              <div
                key={`${passenger.type}-${index}`}
                className="flex items-center gap-2"
              >
                {index === 0 && (
                  <span className="text-base sm:text-lg">and</span>
                )}
                {index > 0 && <span className="text-base sm:text-lg">and</span>}
                <NumberModal
                  value={passenger.count}
                  onChange={(count) =>
                    handleUpdatePassengerCount(passenger.type, count)
                  }
                  singular={passenger.type}
                  plural={
                    passenger.type === "child"
                      ? "children"
                      : `${passenger.type}s`
                  }
                  min={1}
                  max={20}
                  onRemove={() => handleRemovePassenger(passenger.type)}
                />
              </div>
            ))}
            <BubbleModal
              onAddPassenger={handleAddPassenger}
              selectedTypes={passengers.map((p) => p.type)}
              aria-label="Add passenger type"
              buttonAriaLabel="Add additional passenger type"
            />
          </PopMotion>

          <PopMotion
            key="locations-section"
            className="flex flex-wrap items-center gap-4 sm:gap-2"
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <span id="origin-label">from</span>
              <span className="inline-block transition-all">
                <MultiCombobox
                  options={airports}
                  selectedValues={selectedOrigins}
                  onChange={setSelectedOrigins}
                  placeholder="Select airports..."
                  searchPlaceholder="Search airports..."
                  showCode={true}
                  className="min-w-[11.2rem]"
                  ariaLabel="Open departure airports selection"
                />
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span id="destination-label">to</span>
              <span className="inline-block transition-all">
                <MultiCombobox
                  options={countries.map((country) => ({
                    code: country,
                    name: country,
                  }))}
                  selectedValues={selectedCountries}
                  onChange={setSelectedCountries}
                  placeholder="Select countries..."
                  searchPlaceholder="Search countries..."
                  showAllOption={true}
                  allOptionText="All Countries"
                  className="min-w-[12rem]"
                  ariaLabel="Open destination countries selection"
                />
              </span>
            </div>
          </PopMotion>

          {tripType !== "weekend" && tripType !== "longWeekend" && (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <DatePickerWithRange
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                className="w-auto"
                aria-label="Pick a date range"
              />
            </div>
          )}

          {tripType === "return" && (
            <PopMotion
              key="duration-section"
              className="layout-animation flex flex-wrap items-center gap-2"
              onAnimationComplete={() => {
                if (!tripType.includes("return")) {
                  setMinDays(0);
                  setMaxDays(0);
                }
              }}
            >
              <span id="min-days-label">for</span>
              <NumberModal
                value={minDays}
                onChange={setMinDays}
                singular="day"
                plural="days"
                min={1}
                max={maxDays}
                aria-label="Minimum trip duration"
              />
              <span id="max-days-label">to</span>
              <NumberModal
                value={maxDays}
                onChange={setMaxDays}
                singular="day"
                plural="days"
                min={minDays}
                max={90}
                aria-label="Maximum trip duration"
              />
              <span>trip</span>
            </PopMotion>
          )}

          <PopMotion
            key="price-section"
            className="-mb-6 flex flex-wrap items-center justify-end gap-2"
          >
            <span id="price-label">with a maximum budget of</span>
            <PriceModal
              value={maxPrice}
              onChange={setMaxPrice}
              min={0}
              max={10000}
              aria-label="Set a maximum budget"
            />
          </PopMotion>
        </div>
        <div ref={submitResultsFold} className="h-1 w-full"></div>
        <PopMotion key="search-button-section" className="text-center">
          <button
            type="submit"
            className="button-animation mb-10 inline-flex select-none items-center justify-center rounded-full bg-black px-9 py-5 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            disabled={loading}
            aria-busy={loading}
            role="button"
            aria-label={
              loading ? "Searching for flights" : "Search for flights"
            }
          >
            {loading ? "Searching..." : "Gimme Flights"}
          </button>
        </PopMotion>
      </form>

      <div
        className="mx-auto mt-8 flex flex-col items-center justify-center space-y-4"
        role="region"
        aria-label="Search results"
      >
        {error && (
          <div
            className="flex max-w-2xl flex-col items-center justify-center rounded-lg bg-red-50 px-12 py-6 dark:bg-red-900/20"
            role="alert"
          >
            {error.toLowerCase().includes("departure airport") ? (
              <PlaneTakeoff className="text-red-700 dark:text-red-200" />
            ) : error.toLowerCase().includes("destination country") ? (
              <PlaneLanding className="text-red-700 dark:text-red-200" />
            ) : error.toLowerCase().includes("date") ? (
              <CalendarFold className="text-red-700 dark:text-red-200" />
            ) : null}
            <div className="mt-3 flex items-center gap-3">
              <p className="text-red-700 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        <div
          className="w-full"
          aria-live="polite"
          aria-busy={loading}
          aria-atomic="true"
        >
          {loading && flights.length === 0 && <LoadingIndicator />}

          {!loading && noFlightsFound && flights.length === 0 && (
            <NoResultsMessage searchParams={searchParams} />
          )}

          {flights.length > 0 && searchParams && (
            <FlightResults
              flights={flights}
              adults={adults}
              teens={teens}
              children={children}
              infants={infants}
              isLoading={loading}
              searchParams={searchParams}
            />
          )}
        </div>
      </div>
    </div>
  );
}
