import React, { useEffect, useState, FormEvent, useRef } from "react";
import type { Flight } from "@/types/flight";
import { airports } from "@/data/airports";
import { countries } from "@/data/countries";
import {
  FlightResults,
  NoResultsMessage,
  LoadingIndicator,
} from "@components/FlightResults";
import { BaseModal } from "@components/modals/BaseModal";
import { NumberModal } from "@components/modals/NumberModal";
import { PriceModal } from "@components/modals/PriceModal";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@components/modals/DatePicker";
import { format } from "date-fns";
import { MultiCombobox } from "@components/modals/MultiComboBox";
import { PopMotion } from "@components/motion/PopMotion";
import { PlaneTakeoff, PlaneLanding, CalendarFold } from "lucide-react";
import type { SearchParams } from "@/types/search";
import { addWeeks, nextFriday, nextThursday, addDays } from "date-fns";
import {
  isWeekend,
  isFriday,
  isSaturday,
  isSunday,
  isThursday,
  isMonday,
} from "date-fns";
import { PassengerModal } from "@components/modals/PassengerModal";
import { QuestionBubble } from "@/components/modals/QuestionBubble";
import { FAQ } from "@components/FAQ";
import { motion } from "framer-motion";
import { AirplaneIcon } from "@/components/icons";
import { SearchButton } from "@/components/buttons/SearchButton";

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

type TripType = "return" | "oneWay" | "weekend" | "longWeekend";

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

interface FlightSearchProps {
  className?: string;
}

interface PassengerState {
  adult: number | null;
  teen: number | null;
  child: number | null;
  infant: number | null;
}

// Add new interface for tracking answered questions
interface AnsweredQuestions {
  tripType: boolean;
  passengers: boolean;
  locations: boolean;
  dates: boolean;
  duration: boolean;
  budget: boolean;
}

// Add new interface for animation delays
interface AnimationState {
  question: boolean;
  value: boolean;
}

interface AnimationStates {
  tripType: AnimationState;
  passengers: AnimationState;
  locations: AnimationState;
  dates: AnimationState;
  duration: AnimationState;
  budget: AnimationState;
  searchButton: boolean;
}

export function FlightSearch({ className }: FlightSearchProps) {
  // State for form values and UI control
  const [tripType, setTripType] = useState<TripType | null>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minDays, setMinDays] = useState<number | null>(null);
  const [maxDays, setMaxDays] = useState<number | null>(null);
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
  const [passengers, setPassengers] = useState<PassengerState>({
    adult: null,
    teen: null,
    child: null,
    infant: null,
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  });
  const [noFlightsFound, setNoFlightsFound] = useState(false);
  const [weekendCount, setWeekendCount] = useState<number | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Cleanup reference for SSE connection
  const cleanupRef = React.useRef<(() => void) | null>(null);
  // Reference for scroll behavior after search
  const submitResultsFold = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  // Add new state for tracking answered questions and current question
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestions>(
    {
      tripType: false,
      passengers: false,
      locations: false,
      dates: false,
      duration: false,
      budget: false,
    },
  );

  const [currentQuestion, setCurrentQuestion] =
    useState<keyof AnsweredQuestions>("tripType");

  // Add new state for controlling animations
  const [animationStates, setAnimationStates] = useState<AnimationStates>({
    tripType: { question: false, value: false },
    passengers: { question: false, value: false },
    locations: { question: false, value: false },
    dates: { question: false, value: false },
    duration: { question: false, value: false },
    budget: { question: false, value: false },
    searchButton: false,
  });

  // Add unified reveal animation function
  const revealQuestion = (
    questionKey: keyof Omit<AnimationStates, "searchButton">,
    isInitialLoad = false,
    startDelay = 0,
  ) => {
    const questionDelay = 100;
    const valueDelay = 50;
    const totalDelay = startDelay;

    // Only reset and animate if it's a new question (not already shown)
    if (!isInitialLoad && !animationStates[questionKey].question) {
      // First, hide the new question
      setAnimationStates((prev) => ({
        ...prev,
        [questionKey]: { question: false, value: false },
      }));

      // Then animate it in
      setTimeout(() => {
        setAnimationStates((prev) => ({
          ...prev,
          [questionKey]: { ...prev[questionKey], question: true },
        }));
      }, totalDelay);

      setTimeout(() => {
        setAnimationStates((prev) => ({
          ...prev,
          [questionKey]: { ...prev[questionKey], value: true },
        }));
      }, totalDelay + valueDelay);
    } else if (isInitialLoad) {
      // For initial load, just follow the normal animation sequence
      setTimeout(() => {
        setAnimationStates((prev) => ({
          ...prev,
          [questionKey]: { ...prev[questionKey], question: true },
        }));
      }, totalDelay);

      setTimeout(() => {
        setAnimationStates((prev) => ({
          ...prev,
          [questionKey]: { ...prev[questionKey], value: true },
        }));
      }, totalDelay + valueDelay);
    }

    // Return the total animation duration for this question
    return questionDelay;
  };

  // Initial page load animation
  useEffect(() => {
    const questions: (keyof Omit<AnimationStates, "searchButton">)[] = [
      "tripType",
      "passengers",
      "locations",
      "dates",
      "duration",
      "budget",
    ];

    let cumulativeDelay = 0;

    questions.forEach((question) => {
      const animationDuration = revealQuestion(question, true, cumulativeDelay);
      cumulativeDelay += animationDuration;
    });

    // Show search button after all questions are revealed
    setTimeout(() => {
      setAnimationStates((prev) => ({
        ...prev,
        searchButton: true,
      }));
    }, cumulativeDelay + 150); // Add extra delay for better visual effect
  }, []);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      hasScrolled.current = false;
    };
  }, []);

  useEffect(() => {
    loadFormData();
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (dateRange?.from) {
      setStartDate(format(dateRange.from, "yyyy-MM-dd"));
    }
    if (dateRange?.to) {
      setEndDate(format(dateRange.to, "yyyy-MM-dd"));
    }
  }, [dateRange]);

  // Modify updateFormForTripType to handle null values
  const updateFormForTripType = (type: TripType) => {
    setTripType(type);
    setAnsweredQuestions((prev) => ({
      ...prev,
      tripType: true,
    }));
    setCurrentQuestion("passengers");
    revealQuestion("passengers");
    saveFormData();
  };

  // Persists form data to localStorage for user convenience
  const saveFormData = () => {
    const dataToSave = {
      tripType: tripType || undefined,
      weekendCount,
      adults: passengers.adult ?? undefined,
      teens: passengers.teen ?? undefined,
      children: passengers.child ?? undefined,
      infants: passengers.infant ?? undefined,
      startDate,
      endDate,
      maxPrice,
      minDays: minDays ?? undefined,
      maxDays: maxDays ?? undefined,
      originAirports: selectedOrigins,
      wantedCountries: selectedCountries,
      dateRange: dateRange
        ? {
            from: dateRange.from?.toISOString(),
            to: dateRange.to?.toISOString(),
          }
        : undefined,
      answeredQuestions,
      currentQuestion,
      // Add interaction states with consistent keys
      hasInteracted: {
        weekends: localStorage.getItem(
          "numberModal_weekends-search_hasInteracted",
        ),
        minDays: localStorage.getItem("numberModal_min-duration_hasInteracted"),
        maxDays: localStorage.getItem("numberModal_max-duration_hasInteracted"),
        price: localStorage.getItem("priceModal_budget_hasInteracted"),
        date: localStorage.getItem("datePicker_hasInteracted"),
        tripType: localStorage.getItem("baseModal_trip-type_hasInteracted"),
        passengers: localStorage.getItem(
          "passengerModal_passengers_hasInteracted",
        ),
      },
    };
    localStorage.setItem("flightSearchPreferences", JSON.stringify(dataToSave));
  };

  // Loads saved form data from localStorage
  const loadFormData = () => {
    const savedData = localStorage.getItem("flightSearchPreferences");

    if (!savedData) {
      initializeEmptyState();
      return;
    }

    try {
      const formData = JSON.parse(savedData);
      console.log("Loading from localStorage:", formData);
      applyLoadedData(formData);
    } catch (error) {
      console.error("Error loading saved preferences:", error);
      initializeEmptyState();
    }
  };

  // Initialize empty state
  const initializeEmptyState = () => {
    setTripType(null);
    setWeekendCount(null);
    setMaxPrice(null);
    setMinDays(null);
    setMaxDays(null);
    setSelectedOrigins([]);
    setSelectedCountries([]);
    setDateRange(undefined);
    setPassengers({
      adult: null,
      teen: null,
      child: null,
      infant: null,
    });
    setAnsweredQuestions({
      tripType: false,
      passengers: false,
      locations: false,
      dates: false,
      duration: false,
      budget: false,
    });
    setCurrentQuestion("tripType");
  };

  // Apply loaded data
  const applyLoadedData = (formData: any) => {
    // First apply all form values
    if (formData.tripType) {
      setTripType(formData.tripType as TripType);
    }

    const loadedPassengers: PassengerState = {
      adult: formData.adults ? Number(formData.adults) : null,
      teen: formData.teens ? Number(formData.teens) : null,
      child: formData.children ? Number(formData.children) : null,
      infant: formData.infants ? Number(formData.infants) : null,
    };
    setPassengers(loadedPassengers);

    if (formData.startDate) setStartDate(formData.startDate);
    if (formData.endDate) setEndDate(formData.endDate);
    if (formData.maxPrice) setMaxPrice(Number(formData.maxPrice));
    if (formData.minDays) setMinDays(Number(formData.minDays));
    if (formData.maxDays) setMaxDays(Number(formData.maxDays));
    if (formData.originAirports) setSelectedOrigins(formData.originAirports);
    if (formData.wantedCountries)
      setSelectedCountries(formData.wantedCountries);
    if (formData.dateRange) {
      const newDateRange = {
        from: formData.dateRange.from
          ? new Date(formData.dateRange.from)
          : undefined,
        to: formData.dateRange.to ? new Date(formData.dateRange.to) : undefined,
      };
      setDateRange(newDateRange);
    }
    if (formData.weekendCount) setWeekendCount(Number(formData.weekendCount));

    // Update answered questions based on loaded values
    const newAnsweredQuestions = {
      tripType: Boolean(formData.tripType),
      passengers: Boolean(loadedPassengers.adult),
      locations: Boolean(
        formData.originAirports?.length && formData.wantedCountries?.length,
      ),
      dates: Boolean(formData.startDate && formData.endDate),
      duration: Boolean(formData.minDays && formData.maxDays),
      budget: Boolean(formData.maxPrice),
    };
    setAnsweredQuestions(newAnsweredQuestions);

    // Set current question to first unanswered
    const firstUnanswered = Object.entries(newAnsweredQuestions).find(
      ([_, isAnswered]) => !isAnswered,
    )?.[0] as keyof AnsweredQuestions;
    setCurrentQuestion(firstUnanswered || "tripType");

    // Set interaction states for all answered questions
    Object.entries(newAnsweredQuestions).forEach(([key, isAnswered]) => {
      if (isAnswered) {
        switch (key) {
          case "tripType":
            localStorage.setItem("baseModal_trip-type_hasInteracted", "true");
            break;
          case "passengers":
            localStorage.setItem(
              "passengerModal_passengers_hasInteracted",
              "true",
            );
            break;
          case "dates":
            if (formData.weekendCount !== null) {
              localStorage.setItem(
                "numberModal_weekends-search_hasInteracted",
                "true",
              );
            } else {
              localStorage.setItem("datePicker_hasInteracted", "true");
            }
            break;
          case "duration":
            localStorage.setItem(
              "numberModal_min-duration_hasInteracted",
              "true",
            );
            localStorage.setItem(
              "numberModal_max-duration_hasInteracted",
              "true",
            );
            break;
          case "budget":
            localStorage.setItem("priceModal_budget_hasInteracted", "true");
            break;
        }
      }
    });
  };

  // Save data when relevant state changes
  useEffect(() => {
    if (!isInitialLoad) {
      // Only save if it's not the initial load
      const hasAnyData = Object.values(answeredQuestions).some(Boolean);
      if (hasAnyData) {
        saveFormData();
      }
    }
  }, [
    isInitialLoad,
    tripType,
    passengers,
    startDate,
    endDate,
    maxPrice,
    minDays,
    maxDays,
    selectedOrigins,
    selectedCountries,
    answeredQuestions,
  ]);

  // Validates if a flight's return date is within selected date range
  const isFlightWithinDateRange = (flight: Flight) => {
    if (!endDate) return true;
    const inboundDate = new Date(flight.inbound.departureTime);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999); // Set to end of day
    return inboundDate <= endDateObj;
  };

  // Calculate total passenger count for budget starting value
  const getTotalPassengers = () => {
    return (
      (passengers.adult ?? 0) +
      (passengers.teen ?? 0) +
      (passengers.child ?? 0) +
      (passengers.infant ?? 0)
    );
  };

  // Handles form submission and initiates flight search
  // Sets up SSE connection for real-time results
  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }

    // Clear previous state
    setError(null);
    setFlights([]);
    setNoFlightsFound(false);

    // Validate inputs before setting loading state
    if (!tripType) {
      setError("Please select a trip type");
      return;
    }

    if (passengers.adult === null) {
      setError("Please select number of passengers");
      return;
    }

    if (
      (tripType === "weekend" || tripType === "longWeekend") &&
      weekendCount === null
    ) {
      setError("Please select number of weekends");
      return;
    }

    if (selectedOrigins.length === 0) {
      setError("Please select at least one departure airport");
      return;
    }

    if (selectedCountries.length === 0) {
      setError("Please select at least one destination country");
      return;
    }

    if (tripType !== "weekend" && tripType !== "longWeekend") {
      if (!startDate) {
        setError("Please select a departure date");
        return;
      }

      if (tripType === "return" && !endDate) {
        setError("Please select a return date");
        return;
      }
    }

    if (tripType === "return" && (minDays === null || maxDays === null)) {
      setError("Please select trip duration");
      return;
    }

    if (maxPrice === null) {
      setError("Please select a budget");
      return;
    }

    // Start loading only after all validations pass
    setLoading(true);

    if (cleanupRef.current) {
      cleanupRef.current();
    }

    // Calculate weekend dates if in weekend mode
    let searchStartDate = startDate;
    let searchEndDate = endDate;

    if (isWeekendTripType(tripType) && weekendCount !== null) {
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
      maxPrice: maxPrice === 999999 ? 999999 : maxPrice || 0,
      minDays: isWeekendTripType(tripType)
        ? 1
        : tripType === "oneWay"
          ? 0
          : minDays || 1,
      maxDays:
        tripType === "weekend"
          ? 2
          : tripType === "longWeekend"
            ? 3
            : tripType === "oneWay"
              ? 0
              : maxDays || 90,
      originAirports: selectedOrigins,
      wantedCountries: selectedCountries,
      adults: passengers.adult || 0,
      teens: passengers.teen || 0,
      children: passengers.child || 0,
      infants: passengers.infant || 0,
    };

    setSearchParams(newSearchParams);

    try {
      const searchParamsForUrl = {
        ...newSearchParams,
        originAirports: newSearchParams.originAirports.join(","),
        wantedCountries: newSearchParams.wantedCountries
          .map(
            (code) =>
              countries.find((country) => country.code === code)?.name || code,
          )
          .join(","),
        includeArrivalTime: true,
        ...(tripType === "weekend" && {
          weekendCount: weekendCount,
        }),
      };

      const apiUrl = "https://flymebaby-python.onrender.com";
      //const apiUrl = "http://127.0.0.1:5000";
      const urlParams = new URLSearchParams();

      // Explicitly add each parameter to ensure proper encoding
      Object.entries(searchParamsForUrl).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          urlParams.append(key, value.toString());
        }
      });

      const searchUrl = `${apiUrl}/api/search-flights?${urlParams.toString()}`;
      console.log("Search parameters:", searchParamsForUrl);
      console.log("Full search URL:", searchUrl);

      const { eventSource, cleanup } = createEventSourceWithCleanup(searchUrl);
      cleanupRef.current = cleanup;

      eventSource.onerror = (error) => {
        console.error("EventSource error:", error);
        cleanup();
        setLoading(false);
        if (flights.length === 0) {
          setError(
            "Connection to flight search service was lost. Please try again.",
          );
        }
      };

      eventSource.onmessage = (event) => {
        //console.log("Raw SSE event:", event);
        console.log("Raw SSE data:", event.data);

        if (!hasScrolled.current) {
          setTimeout(() => {
            submitResultsFold.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 100);
          hasScrolled.current = true;
        }

        if (event.data === "END") {
          cleanup();
          setLoading(false);
          hasScrolled.current = false;

          setFlights((currentFlights) => {
            if (currentFlights.length === 0) {
              setNoFlightsFound(true);
            }
            return currentFlights;
          });
          return;
        }

        try {
          const data = JSON.parse(event.data) as ApiResponse | Flight;
          console.log("Parsed flight data:", data);

          if ("type" in data && data.type === "NO_FLIGHTS") {
            console.log("No flights found response received");
            setNoFlightsFound(true);
            cleanup();
            setLoading(false);
            return;
          }

          // It's a valid flight, add it to the list
          const flight = data as Flight;
          setFlights((prevFlights) => {
            const newFlights = [...prevFlights, flight];
            return newFlights.sort((a, b) => a.totalPrice - b.totalPrice);
          });

          if (loading) {
            setLoading(false);
          }
        } catch (error) {
          console.error("Error parsing flight data:", error);
          console.error("Raw data that failed to parse:", event.data);
          cleanup();
          setLoading(false);
          setError("Error processing flight data. Please try again.");
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

  // Add handlers for each question type
  const handlePassengersChange = (
    type: keyof PassengerState,
    count: number | null,
  ) => {
    setPassengers((prev) => ({
      ...prev,
      [type]: count,
    }));
    if (
      (type === "adult" && count !== null) ||
      (type !== "adult" && count !== null && count > 0)
    ) {
      setAnsweredQuestions((prev) => ({
        ...prev,
        passengers: true,
      }));
      setCurrentQuestion("locations");
      revealQuestion("locations");
      saveFormData();
    }
  };

  const handleLocationsChange = (origins: string[], countries: string[]) => {
    setSelectedOrigins(origins);
    setSelectedCountries(countries);

    // Update answered state based on whether both origins and countries are selected
    const hasValidSelections = origins.length > 0 && countries.length > 0;
    setAnsweredQuestions((prev) => ({
      ...prev,
      locations: hasValidSelections,
    }));

    // Only proceed to next question if selections are valid
    if (hasValidSelections) {
      setCurrentQuestion("dates");
      revealQuestion("dates");
    } else {
      // If selections become invalid, set current question back to locations
      setCurrentQuestion("locations");
    }
    saveFormData();
  };

  const handleDatesChange = (range: DateRange | undefined) => {
    setDateRange(range);

    // Check if dates are valid based on trip type
    const hasValidDates = Boolean(
      range?.from && (tripType === "oneWay" || range.to),
    );

    setAnsweredQuestions((prev) => ({
      ...prev,
      dates: hasValidDates,
    }));

    // Only proceed to next question if dates are valid
    if (hasValidDates) {
      if (tripType === "return") {
        setCurrentQuestion("duration");
        revealQuestion("duration");
      } else {
        setCurrentQuestion("budget");
        revealQuestion("budget");
      }
    } else {
      // If dates become invalid, set current question back to dates
      setCurrentQuestion("dates");
    }
    saveFormData();
  };

  const handleDurationChange = (min: number | null, max: number | null) => {
    if (min !== null && maxDays !== null && min > maxDays) {
      min = maxDays;
    }
    if (max !== null && minDays !== null && max < minDays) {
      max = minDays;
    }

    setMinDays(min);
    setMaxDays(max);

    if (min !== null && max !== null) {
      setAnsweredQuestions((prev) => ({
        ...prev,
        duration: true,
      }));
      setCurrentQuestion("budget");
      revealQuestion("budget");
      saveFormData();
    }
  };

  const handleBudgetChange = (price: number | null) => {
    setMaxPrice(price);
    if (price !== null) {
      setAnsweredQuestions((prev) => ({
        ...prev,
        budget: true,
      }));
      // Show the search button after budget is set
      setTimeout(() => {
        setAnimationStates((prev) => ({
          ...prev,
          searchButton: true,
        }));
      }, 150);
      saveFormData();
    }
  };

  // Add handler for weekend count changes
  const handleWeekendCountChange = (value: number | null) => {
    setWeekendCount(value);
    if (value !== null) {
      setAnsweredQuestions((prev) => ({
        ...prev,
        dates: true,
      }));
      setCurrentQuestion("budget");
      revealQuestion("budget");
    } else {
      setAnsweredQuestions((prev) => ({
        ...prev,
        dates: false,
      }));
      setCurrentQuestion("dates");
    }
    saveFormData();
  };

  // Helper function to determine if a question should be shown
  const shouldShowQuestion = (questionKey: keyof AnsweredQuestions) => {
    return (
      animationStates[questionKey].question &&
      (currentQuestion === questionKey || answeredQuestions[questionKey])
    );
  };

  // Add shouldShowValue helper
  const shouldShowValue = (questionKey: keyof AnsweredQuestions) => {
    return (
      animationStates[questionKey].value &&
      (currentQuestion === questionKey || answeredQuestions[questionKey])
    );
  };

  return (
    <>
      <div className="z-20 text-center">
        <h1 className="mb-6 ml-8 mt-24 text-left text-2xl font-bold md:mb-10 md:mt-32 md:text-center md:text-3xl">
          Find the best Ryanair deals!
        </h1>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="mx-auto max-w-6xl px-4"
        role="search"
        aria-label="Flight search form"
      >
        <div className="items-left flex flex-col gap-4 text-base leading-relaxed md:items-center md:gap-6 md:text-lg">
          {/* Trip Type Question */}
          {animationStates.tripType.question && (
            <PopMotion
              key="mode-section"
              className="flex flex-col gap-x-2 gap-y-2 md:flex-row md:items-center md:gap-y-4"
              aria-label="trip-type-group"
            >
              <QuestionBubble
                question="What type of the trip you want?"
                isAnswered={answeredQuestions.tripType}
                className="self-start md:self-auto"
              />
              {shouldShowValue("tripType") && (
                <BaseModal
                  options={[
                    { value: "return", label: "Round trip" },
                    //{ value: "oneWay", label: "One way" },
                    { value: "weekend", label: "Weekend" },
                    { value: "longWeekend", label: "Long weekend" },
                  ]}
                  currentValue={tripType}
                  onChange={(value) => updateFormForTripType(value as TripType)}
                  placeholder="Select flight type"
                  aria-label="Select trip type"
                  className="self-end md:self-auto"
                />
              )}
            </PopMotion>
          )}

          {/* Passengers Question */}
          {shouldShowQuestion("passengers") && (
            <PopMotion
              key="passenger-section"
              className="flex flex-col gap-x-2 gap-y-2 md:flex-row md:items-center md:gap-y-4"
            >
              <QuestionBubble
                question="How many passengers?"
                isAnswered={answeredQuestions.passengers}
                className="min-w-[200px] self-start md:self-auto"
              />
              {shouldShowValue("passengers") && (
                <div className="self-end md:self-auto">
                  <PassengerModal
                    passengers={passengers}
                    onChange={handlePassengersChange}
                    placeholder="Select passengers"
                    aria-label="Select number of passengers"
                  />
                </div>
              )}
            </PopMotion>
          )}

          {/* Locations Question */}
          {shouldShowQuestion("locations") && (
            <PopMotion
              key="locations-section"
              className="flex flex-col gap-2 md:flex-row md:items-center"
            >
              <QuestionBubble
                question="From where to fly?"
                isAnswered={answeredQuestions.locations}
                className="min-w-[200px] self-start md:self-auto"
              />
              {shouldShowValue("locations") && (
                <div className="flex flex-col items-end gap-2 self-end md:flex-row md:items-center md:self-auto">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="text-bubble-color dark:text-bubble-color"></span>
                      <span className="inline-block transition-all">
                        <MultiCombobox
                          options={airports}
                          selectedValues={selectedOrigins}
                          onChange={(values) =>
                            handleLocationsChange(values, selectedCountries)
                          }
                          placeholder="Select airports..."
                          searchPlaceholder="Search airports..."
                          showCode={true}
                          className="min-w-[16rem]"
                          ariaLabel="Open departure airports selection"
                          mobileBreakpoint={360}
                          label="From"
                        />
                      </span>
                    </div>
                    <div className="ml-1 flex items-center gap-1 md:gap-2">
                      <span className="text-bubble-color dark:text-bubble-color"></span>
                      <span className="inline-block transition-all">
                        <MultiCombobox
                          options={countries.map((country) => ({
                            code: country.code,
                            name: country.name,
                          }))}
                          selectedValues={selectedCountries}
                          onChange={(values) =>
                            handleLocationsChange(selectedOrigins, values)
                          }
                          placeholder="Select countries..."
                          searchPlaceholder="Search countries..."
                          showAllOption={true}
                          allOptionText="All listed countries"
                          className="min-w-[15rem]"
                          ariaLabel="Open destination countries selection"
                          mobileBreakpoint={423}
                          label="To"
                        />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </PopMotion>
          )}

          {/* Dates Question */}
          {shouldShowQuestion("dates") && (
            <PopMotion
              key="dates-section"
              className="flex flex-col gap-2 md:flex-row md:items-center"
            >
              <QuestionBubble
                question="What is your search window?"
                isAnswered={answeredQuestions.dates}
                className="min-w-[200px] self-start md:self-auto"
              />
              {shouldShowValue("dates") && (
                <div className="self-end md:self-auto">
                  {tripType === "weekend" || tripType === "longWeekend" ? (
                    <NumberModal
                      value={weekendCount}
                      onChange={handleWeekendCountChange}
                      singular="weekend"
                      plural="weekends"
                      min={1}
                      max={6}
                      placeholder="Select weekends"
                      aria-label="weekends-search"
                    />
                  ) : (
                    <DatePickerWithRange
                      dateRange={dateRange}
                      onDateRangeChange={handleDatesChange}
                      className="w-auto"
                      aria-label="date-range"
                    />
                  )}
                </div>
              )}
            </PopMotion>
          )}

          {/* Duration Question */}
          {tripType === "return" && shouldShowQuestion("duration") && (
            <PopMotion
              key="duration-section"
              className="flex flex-col gap-2 md:flex-row md:items-center"
            >
              <QuestionBubble
                question="How long is the trip?"
                isAnswered={answeredQuestions.duration}
                className="min-w-[200px] self-start md:self-auto"
              />
              {shouldShowValue("duration") && (
                <div className="flex items-center gap-2 self-end md:self-auto">
                  <NumberModal
                    value={minDays}
                    onChange={(value) => handleDurationChange(value, maxDays)}
                    singular="day"
                    plural="days"
                    min={1}
                    max={maxDays ?? 90}
                    startFrom={maxDays}
                    placeholder="Select"
                    aria-label="min-duration"
                  />
                  <span className="w-1 text-bubble-color dark:text-bubble-color"></span>
                  <NumberModal
                    value={maxDays}
                    onChange={(value) => handleDurationChange(minDays, value)}
                    singular="day"
                    plural="days"
                    min={minDays ?? 1}
                    max={90}
                    startFrom={minDays}
                    placeholder="Select"
                    aria-label="max-duration"
                  />
                </div>
              )}
            </PopMotion>
          )}

          {/* Budget Question */}
          {shouldShowQuestion("budget") && (
            <PopMotion
              key="budget-section"
              className="flex flex-col gap-2 md:flex-row md:items-center"
            >
              <QuestionBubble
                question="What is the trip budget?"
                isAnswered={answeredQuestions.budget}
                className="min-w-[200px] self-start md:self-auto"
              />
              {shouldShowValue("budget") && (
                <div className="self-end md:self-auto">
                  <PriceModal
                    value={maxPrice}
                    onChange={handleBudgetChange}
                    min={0}
                    max={1050}
                    startFrom={getTotalPassengers() * 100}
                    placeholder="Set trip budget"
                    aria-label="Set a maximum budget"
                  />
                </div>
              )}
            </PopMotion>
          )}
        </div>

        {/* Only show search button when all questions are answered AND animation is complete */}
        {Object.values(answeredQuestions).every(Boolean) &&
          animationStates.searchButton &&
          selectedOrigins.length > 0 &&
          selectedCountries.length > 0 &&
          (tripType === "oneWay" ||
            tripType === "weekend" ||
            tripType === "longWeekend" ||
            (minDays !== null && maxDays !== null)) &&
          maxPrice !== null &&
          passengers.adult !== null && (
            <PopMotion
              key="search-button-section"
              className="select-none text-center"
            >
              <button
                type="submit"
                className="button-animation mb-5 mt-12 inline-flex select-none items-center justify-center rounded-full bg-bubble-color px-9 py-5 text-base font-medium text-white shadow-[0_0.4rem_1.5rem_-0.3rem] shadow-black/30 transition-all will-change-transform [transform-style:preserve-3d] hover:bg-bubble-color-hover hover:shadow-[0_0.4rem_1rem_-0.2rem] hover:shadow-black/30 focus:outline-none focus:ring-2 focus:ring-offset-2"
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
          )}
        <div ref={submitResultsFold} className="h-1 w-full select-none"></div>
      </form>

      {/* Show error if present */}
      {error && (
        <div className="mx-auto mt-8 max-w-4xl px-4 text-center text-red-600">
          {error}
        </div>
      )}

      {/* Show loading indicator when searching */}
      {loading && flights.length === 0 && !error && <LoadingIndicator />}

      {/* Show flight results if available */}
      {flights.length > 0 && (
        <div className="mx-auto mt-8 max-w-5xl px-4">
          <FlightResults
            flights={flights}
            adults={passengers.adult ?? 0}
            teens={passengers.teen ?? 0}
            children={passengers.child ?? 0}
            infants={passengers.infant ?? 0}
            isLoading={loading}
            searchParams={searchParams ?? undefined}
          />
        </div>
      )}

      {/* Show no results message when search is complete but no flights found */}
      {!loading && flights.length === 0 && noFlightsFound && (
        <NoResultsMessage searchParams={searchParams} />
      )}

      {/* Show FAQ section */}
      <FAQ animated />
    </>
  );
}

export default FlightSearch;
