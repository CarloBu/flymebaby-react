"use client";

import * as React from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  className,
  dateRange,
  onDateRangeChange,
}: DatePickerWithRangeProps) {
  const [isStartDateOpen, setIsStartDateOpen] = React.useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);

  const formatStartDate = () => {
    if (!dateRange?.from) return "Select first date";
    return format(dateRange.from, "MMMM d, yyyy");
  };

  const formatEndDate = () => {
    if (!dateRange?.to) return "Select last date";
    return format(dateRange.to, "MMMM d, yyyy");
  };

  const handleDateSelect = (
    range: DateRange | undefined,
    isStartDate: boolean,
  ) => {
    onDateRangeChange(range);
    if (isStartDate) {
      setIsStartDateOpen(false);
      if (range?.from && !range.to) {
        setIsEndDateOpen(true);
      }
    } else {
      setIsEndDateOpen(false);
    }
  };

  return (
    <div className={cn("relative inline-flex gap-2", className)} ref={modalRef}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
        {/* Start Date Picker - Mobile */}
        <div className="flex w-full items-center justify-end gap-2 sm:hidden">
          <span id="date-range-label" className="whitespace-nowrap">
            sometime between
          </span>
          <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="orange-button button-animation w-full"
              >
                {formatStartDate()}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto rounded-3xl border border-gray-100 bg-white p-0 dark:border-gray-700 dark:bg-gray-800"
              align="center"
              sideOffset={8}
            >
              <Calendar
                initialFocus
                mode="single"
                selected={dateRange?.from}
                onSelect={(date) =>
                  handleDateSelect({ from: date, to: dateRange?.to }, true)
                }
                numberOfMonths={1}
                classNames={{
                  months:
                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-2",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium text-xl",
                  nav: "space-x-1 flex items-center ",
                  nav_button:
                    "h-10 w-10 bg-transparent p-1 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1 items-center",
                  nav_button_next: "absolute right-1 items-center ",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex space-x-2",
                  head_cell:
                    "text-muted-foreground w-9 font-normal text-[0.9rem]",
                  row: " flex w-full mt-2",
                  cell: "h-11 w-11 text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-range-start)]:rounded-l-full [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20",
                  day: "h-11 w-11 p-2 font-normal aria-selected:opacity-100",
                  day_range_start: "day-range-start rounded-full",
                  day_range_end: "day-range-end rounded-full",
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                  day_today:
                    "bg-orange-custom bg-accent text-accent-foreground rounded-full text-white shadow-orange-shadow",
                  day_outside:
                    "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                  day_disabled: "text-muted-foreground opacity-100",
                  day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-xl",
                  day_hidden: "invisible",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date Picker - Mobile */}
        <div className="flex w-full items-center justify-end gap-2 sm:hidden">
          <span className="whitespace-nowrap">to</span>
          <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="orange-button button-animation-subtle w-full max-w-52"
              >
                {formatEndDate()}
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto rounded-3xl border border-gray-100 bg-white p-0 dark:border-gray-700 dark:bg-gray-800"
              align="center"
              sideOffset={8}
            >
              <Calendar
                initialFocus
                mode="single"
                selected={dateRange?.to}
                onSelect={(date) =>
                  handleDateSelect({ from: dateRange?.from, to: date }, false)
                }
                numberOfMonths={1}
                fromDate={dateRange?.from}
                classNames={{
                  months:
                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-2",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium text-xl",
                  nav: "space-x-1 flex items-center ",
                  nav_button:
                    "h-10 w-10 bg-transparent p-1 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1 items-center",
                  nav_button_next: "absolute right-1 items-center ",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex space-x-2",
                  head_cell:
                    "text-muted-foreground w-9 font-normal text-[0.9rem]",
                  row: " flex w-full mt-2",
                  cell: "h-11 w-11 text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-range-start)]:rounded-l-full [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20",
                  day: "h-11 w-11 p-2 font-normal aria-selected:opacity-100",
                  day_range_start: "day-range-start rounded-full",
                  day_range_end: "day-range-end rounded-full",
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                  day_today:
                    "bg-orange-custom bg-accent text-accent-foreground rounded-full text-white shadow-orange-shadow",
                  day_outside:
                    "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                  day_disabled: "text-muted-foreground opacity-100",
                  day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-xl",
                  day_hidden: "invisible",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Desktop Range Picker */}
        <div className="hidden sm:block">
          <Popover>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <span id="date-range-label" className="whitespace-nowrap">
                  sometime between
                </span>
                <div className="w-52">
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="orange-button button-animation w-52"
                    >
                      {formatStartDate()}
                    </button>
                  </PopoverTrigger>
                </div>
              </div>
              <span className="px-4 text-gray-900 dark:text-white">to</span>
              <div className="w-52">
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="orange-button button-animation-subtle w-52"
                  >
                    {formatEndDate()}
                  </button>
                </PopoverTrigger>
              </div>
            </div>
            <PopoverContent
              className="w-auto rounded-3xl border border-gray-100 bg-white p-0 dark:border-gray-700 dark:bg-gray-800"
              align="center"
              sideOffset={8}
              alignOffset={0}
              side="bottom"
            >
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
                classNames={{
                  months:
                    "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-2",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium text-xl",
                  nav: "space-x-1 flex items-center ",
                  nav_button:
                    "h-10 w-10 bg-transparent p-1 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1 items-center",
                  nav_button_next: "absolute right-1 items-center ",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex space-x-2",
                  head_cell:
                    "text-muted-foreground w-9 font-normal text-[0.9rem]",
                  row: " flex w-full mt-2",
                  cell: "h-11 w-11 text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-range-start)]:rounded-l-full [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20",
                  day: "h-11 w-11 p-2 font-normal aria-selected:opacity-100",
                  day_range_start:
                    "day-range-start rounded-full dark:text-gray-900",
                  day_range_end: "day-range-end rounded-full",
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full  ",
                  day_today:
                    "bg-orange-custom bg-accent text-accent-foreground rounded-full text-white shadow-orange-shadow",
                  day_outside:
                    "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                  day_disabled: "text-muted-foreground opacity-100",
                  day_range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground  rounded-xl",
                  day_hidden: "invisible",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}
