"use client";

import * as React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/icons";

export type SortOption = "price" | "time";

interface TimeRange {
  start: number;
  end: number;
}

interface FlightFiltersProps {
  onDepartTimeChange?: (range: TimeRange | null) => void;
  onReturnTimeChange?: (range: TimeRange | null) => void;
  onDepartDaysChange?: (days: string[] | null) => void;
  onReturnDaysChange?: (days: string[] | null) => void;
  onSortChange?: (sortBy: SortOption) => void;
  sortBy?: SortOption;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatTime = (hour: number, isEnd: boolean = false) => {
  if (hour === 24) {
    return "23:59";
  }
  return `${hour.toString().padStart(2, "0")}:00`;
};

export function FlightFilters({
  onDepartTimeChange,
  onReturnTimeChange,
  onDepartDaysChange,
  onReturnDaysChange,
  onSortChange,
  sortBy = "price",
}: FlightFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [removingFilters, setRemovingFilters] = useState<Set<string>>(
    new Set(),
  );
  const [departTime, setDepartTime] = useState<TimeRange>({
    start: 0,
    end: 24,
  });
  const [returnTime, setReturnTime] = useState<TimeRange>({
    start: 0,
    end: 24,
  });
  const [selectedDepartDays, setSelectedDepartDays] =
    useState<string[]>(WEEKDAYS);
  const [selectedReturnDays, setSelectedReturnDays] =
    useState<string[]>(WEEKDAYS);

  const toggleFilter = (filter: string) => {
    const newFilters = new Set(activeFilters);
    if (newFilters.has(filter)) {
      handleRemoveFilter(filter);
    } else {
      newFilters.add(filter);
      // Reapply the filter when adding it
      switch (filter) {
        case "depart":
          onDepartTimeChange?.(departTime);
          break;
        case "return":
          onReturnTimeChange?.(returnTime);
          break;
        case "departDays":
          onDepartDaysChange?.(selectedDepartDays);
          break;
        case "returnDays":
          onReturnDaysChange?.(selectedReturnDays);
          break;
      }
      setActiveFilters(newFilters);
    }
  };

  const handleRemoveFilter = (filter: string) => {
    setRemovingFilters((prev) => new Set([...prev, filter]));

    // Reset the filter
    switch (filter) {
      case "depart":
        onDepartTimeChange?.(null);
        break;
      case "return":
        onReturnTimeChange?.(null);
        break;
      case "departDays":
        onDepartDaysChange?.(null);
        break;
      case "returnDays":
        onReturnDaysChange?.(null);
        break;
    }

    // Remove the filter after animation completes
    setTimeout(() => {
      setActiveFilters((prev) => {
        const newFilters = new Set(prev);
        newFilters.delete(filter);
        return newFilters;
      });
      setRemovingFilters((prev) => {
        const newRemoving = new Set(prev);
        newRemoving.delete(filter);
        return newRemoving;
      });
    }, 100); // Shortened from 300ms to 100ms
  };

  const handleDepartTimeChange = (values: number[]) => {
    const newRange = { start: values[0], end: values[1] };
    setDepartTime(newRange);
    onDepartTimeChange?.(newRange);
  };

  const handleReturnTimeChange = (values: number[]) => {
    const newRange = { start: values[0], end: values[1] };
    setReturnTime(newRange);
    onReturnTimeChange?.(newRange);
  };

  const toggleDepartDay = (day: string) => {
    const newSelectedDays = selectedDepartDays.includes(day)
      ? selectedDepartDays.filter((d) => d !== day)
      : [...selectedDepartDays, day];
    setSelectedDepartDays(newSelectedDays);
    onDepartDaysChange?.(newSelectedDays);
  };

  const toggleReturnDay = (day: string) => {
    const newSelectedDays = selectedReturnDays.includes(day)
      ? selectedReturnDays.filter((d) => d !== day)
      : [...selectedReturnDays, day];
    setSelectedReturnDays(newSelectedDays);
    onReturnDaysChange?.(newSelectedDays);
  };

  const springConfig = {
    type: "spring",
    stiffness: 700,
    damping: 35,
    mass: 0.5,
    duration: 0.1,
  };

  const isFilterActive = (filter: string) =>
    activeFilters.has(filter) && !removingFilters.has(filter);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col items-start gap-4">
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-start">
          <span className="mt-3 self-start text-base font-medium text-gray-900 dark:text-gray-100 md:w-16">
            Sort by
          </span>
          <div className="flex gap-2">
            <button
              className={cn(
                "button-filter button-filter-animation",
                sortBy === "price" && "button-filter-selected",
              )}
              onClick={() => onSortChange?.("price")}
            >
              Price
            </button>
            <button
              className={cn(
                "button-filter button-filter-animation",
                sortBy === "time" && "button-filter-selected",
              )}
              onClick={() => onSortChange?.("time")}
            >
              Departure time
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-start">
          <span className="mt-3 text-base font-medium text-gray-900 dark:text-gray-100 md:w-16">
            Filters
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              className={cn(
                "button-filter button-filter-animation",
                activeFilters.has("depart") && "button-filter-selected",
              )}
              onClick={() => toggleFilter("depart")}
            >
              Depart time
            </button>
            <button
              className={cn(
                "button-filter button-filter-animation",
                activeFilters.has("return") && "button-filter-selected",
              )}
              onClick={() => toggleFilter("return")}
            >
              Return time
            </button>
            <button
              className={cn(
                "button-filter button-filter-animation",
                activeFilters.has("departDays") && "button-filter-selected",
              )}
              onClick={() => toggleFilter("departDays")}
            >
              Departure days
            </button>
            <button
              className={cn(
                "button-filter button-filter-animation",
                activeFilters.has("returnDays") && "button-filter-selected",
              )}
              onClick={() => toggleFilter("returnDays")}
            >
              Return days
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {(activeFilters.has("depart") || removingFilters.has("depart")) && (
          <>
            <h3 className="block text-base font-medium text-gray-900 dark:text-gray-100 md:hidden">
              Depart time
            </h3>
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={
                isFilterActive("depart")
                  ? { opacity: 1, height: "auto", y: 0 }
                  : { opacity: 0, height: 0, y: -20 }
              }
              transition={springConfig}
              className="relative flex items-start justify-start gap-4 overflow-visible"
            >
              <h3 className="mt-3 hidden w-24 whitespace-nowrap text-base font-medium text-gray-900 dark:text-gray-100 md:block">
                Depart time
              </h3>
              <Slider
                defaultValue={[departTime.start, departTime.end]}
                max={24}
                step={1}
                onValueChange={(values) =>
                  setDepartTime({ start: values[0], end: values[1] })
                }
                onValueCommit={handleDepartTimeChange}
                className="w-[24.8rem] md:w-[27.5rem]"
              />
              <button
                className="button-close ml-[5.5rem] mt-0.5 rounded-full bg-gray-200 p-3 text-black transition-all duration-1000 ease-pop hover:bg-gray-900 hover:text-white active:scale-95 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900 md:ml-24 md:bg-white"
                onClick={() => handleRemoveFilter("depart")}
                aria-label="Close depart time filter"
              >
                <CloseIcon className="h-5 w-5 border-gray-900" />
              </button>
            </motion.div>
          </>
        )}
        {(activeFilters.has("return") || removingFilters.has("return")) && (
          <>
            <h3 className="block text-base font-medium text-gray-900 dark:text-gray-100 md:hidden">
              Return time
            </h3>
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={
                isFilterActive("return")
                  ? { opacity: 1, height: "auto", y: 0 }
                  : { opacity: 0, height: 0, y: -20 }
              }
              transition={springConfig}
              className="relative flex items-start justify-start gap-4 overflow-visible"
            >
              <h3 className="mt-3 hidden w-24 whitespace-nowrap text-base font-medium text-gray-900 dark:text-gray-100 md:block">
                Return time
              </h3>
              <Slider
                defaultValue={[returnTime.start, returnTime.end]}
                max={24}
                step={1}
                onValueChange={(values) =>
                  setReturnTime({ start: values[0], end: values[1] })
                }
                onValueCommit={handleReturnTimeChange}
                className="w-[24.8rem] md:w-[27.5rem]"
              />
              <button
                className="button-close ml-[5.5rem] mt-0.5 rounded-full bg-gray-200 p-3 text-black transition-all duration-1000 ease-pop hover:bg-gray-900 hover:text-white active:scale-95 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900 md:ml-24 md:bg-white"
                onClick={() => handleRemoveFilter("return")}
                aria-label="Close return time filter"
              >
                <CloseIcon className="h-5 w-5 border-gray-900" />
              </button>
            </motion.div>
          </>
        )}

        {(activeFilters.has("departDays") ||
          removingFilters.has("departDays")) && (
          <>
            <h3 className="block text-base font-medium text-gray-900 dark:text-gray-100 md:hidden">
              Depart days
            </h3>
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={
                isFilterActive("departDays")
                  ? { opacity: 1, height: "auto", y: 0 }
                  : { opacity: 0, height: 0, y: -20 }
              }
              transition={springConfig}
              className="relative flex items-start justify-start gap-4 overflow-visible"
            >
              <h3 className="mt-3 hidden w-24 whitespace-nowrap text-base font-medium text-gray-900 dark:text-gray-100 md:block">
                Depart days
              </h3>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day}
                    className={cn(
                      "button-filter button-filter-ani mation",
                      selectedDepartDays.includes(day) &&
                        "button-filter-selected",
                    )}
                    onClick={() => toggleDepartDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <button
                className="button-close -mt-0.5 rounded-full bg-gray-200 p-3 text-black transition-all duration-1000 ease-pop hover:bg-gray-900 hover:text-white active:scale-95 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900 md:mt-0.5 md:bg-white"
                onClick={() => handleRemoveFilter("departDays")}
                aria-label="Close departure days filter"
              >
                <CloseIcon className="h-5 w-5 border-gray-900" />
              </button>
            </motion.div>
          </>
        )}

        {(activeFilters.has("returnDays") ||
          removingFilters.has("returnDays")) && (
          <>
            <h3 className="block text-base font-medium text-gray-900 dark:text-gray-100 md:hidden">
              Return days
            </h3>
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={
                isFilterActive("returnDays")
                  ? { opacity: 1, height: "auto", y: 0 }
                  : { opacity: 0, height: 0, y: -20 }
              }
              transition={springConfig}
              className="relative flex items-start justify-start gap-4 overflow-visible"
            >
              <h3 className="mt-3 hidden w-24 whitespace-nowrap text-base font-medium text-gray-900 dark:text-gray-100 md:block">
                Return days
              </h3>
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day}
                    className={cn(
                      "button-filter button-filter-animation",
                      selectedReturnDays.includes(day) &&
                        "button-filter-selected",
                    )}
                    onClick={() => toggleReturnDay(day)}
                  >
                    {day}
                  </button>
                ))}
              </div>
              <button
                className="button-close -mt-0.5 rounded-full bg-gray-200 p-3 text-black transition-all duration-1000 ease-pop hover:bg-gray-900 hover:text-white active:scale-95 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-100 dark:hover:text-gray-900 md:mt-0.5 md:bg-white"
                onClick={() => handleRemoveFilter("returnDays")}
                aria-label="Close departure days filter"
              >
                <CloseIcon className="h-5 w-5 border-gray-900" />
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
