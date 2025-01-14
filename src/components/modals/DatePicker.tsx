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
import { PopMotion } from "@/components/motion/PopMotion";

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
  const [windowWidth, setWindowWidth] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [hasInteractedStart, setHasInteractedStart] = React.useState(() => {
    const saved = localStorage.getItem("datePicker_start_hasInteracted");
    return saved ? JSON.parse(saved) : false;
  });
  const [hasInteractedEnd, setHasInteractedEnd] = React.useState(() => {
    const saved = localStorage.getItem("datePicker_end_hasInteracted");
    return saved ? JSON.parse(saved) : false;
  });
  const [tempDateRange, setTempDateRange] = React.useState<
    DateRange | undefined
  >(dateRange);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Save interaction states to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem(
      "datePicker_start_hasInteracted",
      JSON.stringify(hasInteractedStart),
    );
  }, [hasInteractedStart]);

  React.useEffect(() => {
    localStorage.setItem(
      "datePicker_end_hasInteracted",
      JSON.stringify(hasInteractedEnd),
    );
  }, [hasInteractedEnd]);

  React.useEffect(() => {
    // Set initial width
    setWindowWidth(window.innerWidth);

    // Add resize listener
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  React.useEffect(() => {
    if (open) {
      setTempDateRange(dateRange);
    }
  }, [open, dateRange]);

  // Add effect to handle mobile scroll behavior
  React.useEffect(() => {
    if (open && windowWidth <= 768 && buttonRef.current) {
      setTimeout(() => {
        const yOffset = -80; // Add some padding at the top
        const element = buttonRef.current;
        if (element) {
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({
            top: y,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [open, windowWidth]);

  const formatStartDate = () => {
    if (!dateRange?.from) return "Select first date";
    return format(dateRange.from, "MMMM d, yyyy");
  };

  const formatEndDate = () => {
    if (!dateRange?.to) return "Select last date";
    return format(dateRange.to, "MMMM d, yyyy");
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    // Track interaction based on which date was changed
    if (range?.from !== tempDateRange?.from) {
      setHasInteractedStart(true);
    }
    if (range?.to !== tempDateRange?.to) {
      setHasInteractedEnd(true);
    }

    setTempDateRange(range);
    if (windowWidth > 768) {
      onDateRangeChange(range);
    }
  };

  const handleApplyChanges = () => {
    // Track interaction for both dates when applying changes
    if (tempDateRange?.from) {
      setHasInteractedStart(true);
    }
    if (tempDateRange?.to) {
      setHasInteractedEnd(true);
    }

    onDateRangeChange(tempDateRange);
    setOpen(false);
  };

  return (
    <PopMotion
      key="date-section"
      className={cn("relative inline-flex gap-2", className)}
    >
      <div className="flex w-full flex-wrap justify-end gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              ref={buttonRef}
              type="button"
              className="flex w-full flex-wrap items-center justify-end gap-2"
            >
              <div className="flex items-center gap-2">
                <div className="min-w-52 flex-1">
                  <div
                    className={cn(
                      "button-animation shadow-bubble-shadow hover:shadow-bubble-hover-shadow dark:hover:shadow-bubble-hover-shadow relative flex min-w-[7rem] cursor-pointer select-none items-center justify-center rounded-full bg-bubble-color px-7 py-3 text-base text-white transition-all hover:bg-bubble-color-hover dark:bg-bubble-color dark:text-white dark:hover:bg-bubble-color-hover",
                      !dateRange?.from &&
                        "bg-bubble-color-select hover:bg-bubble-color-select",
                      hasInteractedStart && !dateRange?.from
                        ? "!bg-bubble-color-attention"
                        : "",
                    )}
                  >
                    {formatStartDate()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className=""></span>
                <div className="min-w-52 flex-1">
                  <div
                    className={cn(
                      "button-animation-subtle shadow-bubble-shadow hover:shadow-bubble-hover-shadow dark:hover:shadow-bubble-hover-shadow relative flex min-w-[7rem] cursor-pointer select-none items-center justify-center rounded-full bg-bubble-color px-7 py-3 text-base text-white transition-all hover:bg-bubble-color-hover dark:bg-bubble-color dark:text-white dark:hover:bg-bubble-color-hover",
                      !dateRange?.to &&
                        "bg-bubble-color-select hover:bg-bubble-color-select",
                      hasInteractedEnd && !dateRange?.to
                        ? "!bg-bubble-color-attention"
                        : "",
                    )}
                  >
                    {formatEndDate()}
                  </div>
                </div>
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent
            ref={modalRef}
            className="w-auto rounded-[2rem] border border-none bg-none p-0 dark:border-none dark:bg-none"
            align="center"
            sideOffset={8}
            alignOffset={0}
            side={windowWidth <= 768 ? "top" : "bottom"}
          >
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={tempDateRange}
              onSelect={handleDateSelect}
              numberOfMonths={windowWidth <= 768 ? 1 : 2}
              classNames={{
                root: "p-2 select-none",
                months:
                  windowWidth <= 768
                    ? "flex flex-col space-y-4"
                    : "flex flex-row space-x-4 [&>:first-child_.apply-button]:hidden",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-xl",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-10 w-10 bg-transparent p-1 opacity-50 hover:opacity-100",
                nav_button_previous: "absolute left-1 items-center",
                nav_button_next: "absolute right-1 items-center",
                table: "w-full border-collapse space-y-1",
                head_row: "flex space-x-2",
                head_cell:
                  "text-muted-foreground w-9 font-normal text-[0.9rem]",
                row: "flex w-full mt-2",
                cell: "h-11 w-11 text-center text-base p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-full [&:has([aria-selected].day-range-start)]:rounded-l-full [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full focus-within:relative focus-within:z-20",
                day: "h-11 w-11 p-2 font-normal aria-selected:opacity-100",
                day_range_start:
                  "day-range-start rounded-full dark:text-gray-900",
                day_range_end: "day-range-end rounded-full",
                day_selected:
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                day_today:
                  "bg-bubble-color bg-accent text-accent-foreground rounded-full text-white shadow-bubble-shadow",
                day_outside:
                  "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
                day_disabled: "text-muted-foreground opacity-100",
                day_range_middle:
                  "aria-selected:bg-accent aria-selected:text-accent-foreground rounded-xl",
                day_hidden: "invisible",
              }}
              footer={
                <div className="apply-button flex w-full justify-end">
                  {windowWidth <= 768 ? (
                    <button
                      type="button"
                      onClick={handleApplyChanges}
                      className="-mb-1 mt-2 w-full rounded-full bg-gray-200/70 py-3 text-base font-medium text-gray-900 transition-colors hover:bg-gray-300/70 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                    >
                      Apply
                    </button>
                  ) : (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleApplyChanges}
                        className="-mb-1 mt-2 w-80 rounded-full bg-gray-200/70 py-3 text-base font-medium text-gray-900 transition-colors hover:bg-gray-300/70 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              }
            />
          </PopoverContent>
        </Popover>
      </div>
    </PopMotion>
  );
}
