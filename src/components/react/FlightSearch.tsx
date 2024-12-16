import React, { useEffect, useState, FormEvent } from "react";
import { airports } from "../../data/airports";
import { countries } from "../../data/countries";
import type { Flight } from "../../types/flight";
import { FlightResults } from "./FlightResults";
import { BaseModal } from "./modals/BaseModal";
import { NumberModal } from "./modals/NumberModal";
import { BubbleModal } from "./modals/BubbleModal";
import { PriceModal } from "./modals/PriceModal";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "./modals/DatePicker";
import { format } from "date-fns";
import { MultiCombobox } from "@/components/react/modals/multi-combobox";
import { motion } from "framer-motion";
import { PopMotion } from "@/components/react/motion/PopMotion";

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

interface ModalState {
  tripType: boolean;
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

const DEFAULT_SEARCH_PREFERENCES = {
  tripType: "return" as const,
  adults: 1,
  teens: 0,
  children: 0,
  infants: 0,
  maxPrice: 550,
  minDays: 5,
  maxDays: 7,
  originAirports: [] as string[],
  wantedCountries: [] as string[],
  dateRange: undefined as DateRange | undefined,
};

export default function FlightSearch() {
  const [tripType, setTripType] = useState<"oneWay" | "return">("return");
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adults, setAdults] = useState(1);
  const [teens, setTeens] = useState(0);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [minDays, setMinDays] = useState<number>(3);
  const [maxDays, setMaxDays] = useState<number>(7);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);
  const [activeModal, setActiveModal] = useState<ModalState>({
    tripType: false,
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

  const fadeInOut = {
    initial: { opacity: 0, scale: 0.8, y: -10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.8, y: -10 },
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      mass: 1,
    },
  };

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

  const updateFormForTripType = (type: "oneWay" | "return") => {
    setTripType(type);
  };

  const saveFormData = () => {
    const dataToSave = {
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

  const loadFormData = () => {
    const savedData = localStorage.getItem("flightSearchPreferences");

    if (!savedData) {
      setTripType(DEFAULT_SEARCH_PREFERENCES.tripType);
      setAdults(DEFAULT_SEARCH_PREFERENCES.adults);
      setTeens(DEFAULT_SEARCH_PREFERENCES.teens);
      setChildren(DEFAULT_SEARCH_PREFERENCES.children);
      setInfants(DEFAULT_SEARCH_PREFERENCES.infants);
      setMaxPrice(DEFAULT_SEARCH_PREFERENCES.maxPrice);
      setMinDays(DEFAULT_SEARCH_PREFERENCES.minDays);
      setMaxDays(DEFAULT_SEARCH_PREFERENCES.maxDays);
      setSelectedOrigins(DEFAULT_SEARCH_PREFERENCES.originAirports);
      setSelectedCountries(DEFAULT_SEARCH_PREFERENCES.wantedCountries);
      setDateRange(DEFAULT_SEARCH_PREFERENCES.dateRange);
      setPassengers([]);
      return;
    }

    try {
      const formData = JSON.parse(savedData);
      console.log("Loading from localStorage:", formData);

      setPassengers([]);

      if (formData.tripType) {
        setTripType(formData.tripType as "oneWay" | "return");
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
        setDateRange({
          from: formData.dateRange.from
            ? new Date(formData.dateRange.from)
            : undefined,
          to: formData.dateRange.to
            ? new Date(formData.dateRange.to)
            : undefined,
        });
      } else if (formData.startDate || formData.endDate) {
        setDateRange({
          from: formData.startDate ? new Date(formData.startDate) : undefined,
          to: formData.endDate ? new Date(formData.endDate) : undefined,
        });
      }
    } catch (error) {
      //console.error("Error loading saved preferences:", error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newSearchParams: SearchParams = {
      tripType,
      startDate,
      endDate,
      maxPrice,
      minDays: tripType === "oneWay" ? 0 : minDays,
      maxDays: tripType === "oneWay" ? 0 : maxDays,
      originAirports: selectedOrigins,
      wantedCountries: selectedCountries,
      adults,
      teens,
      children,
      infants,
    };

    setSearchParams(newSearchParams);
    setFlights([]);
    setLoading(true);
    setError(null);

    try {
      const searchParamsForUrl = {
        ...newSearchParams,
        originAirports: newSearchParams.originAirports.join(","),
        wantedCountries: newSearchParams.wantedCountries.join(","),
      };

      //const apiUrl =
      //import.meta.env.PUBLIC_API_URL || "http://192.168.1.149:5000";
      const apiUrl =
        import.meta.env.PUBLIC_API_URL ||
        "https://flymebaby-python.onrender.com";
      const eventSource = new EventSource(
        `${apiUrl}/api/search-flights?${new URLSearchParams(
          searchParamsForUrl as any,
        )}`,
      );

      eventSource.onmessage = (event) => {
        if (event.data === "END") {
          //console.log("Search completed");
          eventSource.close();
          setLoading(false);
          return;
        }

        const flight = JSON.parse(event.data);
        //console.log("Received flight:", flight);

        setFlights((prevFlights) => {
          const newFlights = [...prevFlights, flight];
          return newFlights.sort((a, b) => a.totalPrice - b.totalPrice);
        });
      };

      eventSource.onerror = (error) => {
        eventSource.close();
        setLoading(false);
        setError(
          "Unable to connect to flight search service. Please try again later.",
        );
        console.error("SSE Connection Error:", error);
      };

      eventSource.onopen = () => {
        //console.log("SSE connection opened");
      };

      return () => {
        eventSource.close();
      };
    } catch (error) {
      //console.error("Search Error:", error);
      setLoading(false);
      setError("Error searching flights. Please try again.");
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

  const toggleModal = (modalName: keyof ModalState) => {
    setActiveModal((prev) => ({
      tripType: false,
      passengers: false,
      locations: false,
      dates: false,
      duration: false,
      budget: false,
      [modalName]: !prev[modalName],
    }));
  };

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
    <div className="mx-auto max-w-5xl rounded-lg bg-white p-3 dark:bg-gray-900 sm:p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <input type="hidden" name="tripType" value={tripType} />
        <input type="hidden" name="adults" value={adults} />
        <input type="hidden" name="children" value={children} />

        <div className="items-left flex flex-col gap-6 text-lg leading-relaxed md:items-center">
          {/* First line - Trip type and passengers */}
          <div className="flex scale-90 flex-wrap items-center gap-2 md:scale-100">
            I'm looking for a
            <BaseModal
              options={[
                { value: "return", label: "return" },
                { value: "oneWay", label: "one way" },
              ]}
              currentValue={tripType}
              onChange={(value) =>
                updateFormForTripType(value as "oneWay" | "return")
              }
            />
            flight
          </div>

          <motion.div
            layout="position"
            className="layout-animation flex scale-90 flex-wrap items-center gap-2 md:scale-100"
          >
            for
            <NumberModal
              value={adults}
              onChange={setAdults}
              singular="adult"
              plural="adults"
              min={1}
              max={20}
            />
            {passengers.map((passenger, index) => (
              <PopMotion
                key={passenger.type}
                className="flex items-center gap-2"
              >
                {index === 0 && <span className="text-lg">and</span>}
                {index > 0 && <span className="text-lg">and</span>}
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
              </PopMotion>
            ))}
            <BubbleModal
              onAddPassenger={handleAddPassenger}
              selectedTypes={passengers.map((p) => p.type)}
            />
          </motion.div>
          {/* Second line - Locations */}
          <PopMotion
            key="locations-section"
            className="flex flex-wrap items-center gap-2"
          >
            from
            <span className="inline-block transition-all">
              <MultiCombobox
                options={airports}
                selectedValues={selectedOrigins}
                onChange={setSelectedOrigins}
                placeholder="Select airports..."
                searchPlaceholder="Search airports..."
                showCode={true}
                className="min-w-[11.5rem]"
              />
            </span>
            to
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
              />
            </span>
          </PopMotion>
          {/* Third line - Dates */}
          <div className="flex flex-wrap items-center gap-2">
            sometime between
            <DatePickerWithRange
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              className="w-auto"
            />
          </div>
          {/* Fourth line - Duration */}

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
              for
              <NumberModal
                value={minDays}
                onChange={setMinDays}
                singular="day"
                plural="days"
                min={1}
                max={maxDays}
              />
              to
              <NumberModal
                value={maxDays}
                onChange={setMaxDays}
                singular="day"
                plural="days"
                min={minDays}
                max={90}
              />
              trip
            </PopMotion>
          )}

          <div className="flex flex-wrap items-center gap-2">
            with a maximum budget of
            <PriceModal
              value={maxPrice}
              onChange={setMaxPrice}
              min={0}
              max={10000}
            />
          </div>
        </div>
        <div className="text-center">
          <button
            type="submit"
            className="select-nonemt-8 button-animation inline-flex items-center justify-center rounded-full bg-black px-9 py-5 text-base font-medium text-white hover:bg-gray-700 focus:outline-none dark:bg-white dark:text-black"
            disabled={loading}
          >
            {loading ? "Searching..." : "Find Flights"}
          </button>
        </div>
      </form>

      <div className="mt-8 space-y-4">
        {error && <p className="text-red-600">{error}</p>}

        <div>
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
