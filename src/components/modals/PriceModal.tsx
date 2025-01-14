import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PriceModalProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  startFrom?: number;
  currency?: string;
  placeholder?: string;
  "aria-label"?: string;
}

export const PriceModal = ({
  value,
  onChange,
  min = 0,
  max = 1050,
  startFrom,
  currency = "EUR",
  placeholder = "Select",
  "aria-label": ariaLabel,
}: PriceModalProps) => {
  const [open, setOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<"plus" | "minus" | null>(
    null,
  );
  const [hasInteracted, setHasInteracted] = React.useState(() => {
    const saved = localStorage.getItem(`priceModal_${ariaLabel}_hasInteracted`);
    return saved ? JSON.parse(saved) : false;
  });

  // Save interaction state to localStorage whenever it changes
  React.useEffect(() => {
    if (ariaLabel) {
      localStorage.setItem(
        `priceModal_${ariaLabel}_hasInteracted`,
        JSON.stringify(hasInteracted),
      );
    }
  }, [hasInteracted, ariaLabel]);

  const getIncrement = (value: number) => {
    if (value < 50) return 1;
    if (value < 100) return 10;
    return 50;
  };

  const handleIncrement = () => {
    const currentValue = value ?? startFrom ?? min;
    if (currentValue === 1000) {
      onChange(999999);
    } else if (currentValue < max) {
      const increment = getIncrement(currentValue);
      let newValue = currentValue + increment;

      if (currentValue < 50 && newValue > 50) newValue = 50;
      else if (currentValue < 60 && newValue > 60) newValue = 60;

      onChange(newValue);
    }
    setActiveButton("plus");
    setTimeout(() => setActiveButton(null), 150);
  };

  const handleDecrement = () => {
    const currentValue = value ?? startFrom ?? max;
    if (currentValue > min) {
      if (currentValue === 999999) {
        onChange(1000);
      } else {
        const decrement = getIncrement(currentValue - 0.1);
        let newValue = currentValue - decrement;

        if (currentValue > 60 && newValue < 60) newValue = 60;
        else if (currentValue > 50 && newValue < 50) newValue = 50;

        onChange(newValue);
      }
      setActiveButton("minus");
      setTimeout(() => setActiveButton(null), 150);
    }
  };

  const isDecrementDisabled =
    value === null ? false : (value ?? startFrom ?? 0) <= min;
  const isIncrementDisabled =
    value === null
      ? false
      : value === 999999 || (value ?? startFrom ?? 0) >= max;

  const getDisplayValue = () => {
    if (value === null) return placeholder;
    if (value === 1050 || value === 999999) return "GO NUTS!";
    return `${value} ${currency}`;
  };

  return (
    <Popover
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen && !hasInteracted) {
          setHasInteracted(true);
        }
        setOpen(newOpen);
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "button-animation shadow-bubble-shadow hover:shadow-bubble-hover-shadow dark:hover:shadow-bubble-hover-shadow relative flex min-w-[8rem] cursor-pointer select-none items-center justify-center rounded-full bg-bubble-color px-7 py-3 text-base text-white transition-all hover:bg-bubble-color-hover dark:bg-bubble-color dark:text-white dark:hover:bg-bubble-color-hover",
            value === null &&
              "bg-bubble-color-select hover:bg-bubble-color-select",
            hasInteracted && value === null ? "!bg-bubble-color-attention" : "",
          )}
          aria-label={ariaLabel}
        >
          {getDisplayValue()}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className={cn(
          "w-auto space-y-2 rounded-3xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800",
        )}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isDecrementDisabled}
            aria-label="Decrease price"
            className={cn(
              "h-11 w-14 select-none rounded-full bg-gray-200/70 text-xl font-medium transition-colors hover:bg-gray-300/70 focus:outline-none focus:ring-0 focus:ring-transparent disabled:opacity-50 disabled:hover:bg-gray-200/60 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:disabled:opacity-50 dark:disabled:hover:bg-gray-600",
              activeButton === "minus" &&
                "scale-95 bg-gray-300/70 dark:bg-gray-600",
            )}
          >
            -
          </button>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={isIncrementDisabled}
            aria-label="Increase price"
            className={cn(
              "h-11 w-14 select-none rounded-full bg-gray-200/70 text-xl font-medium transition-colors hover:bg-gray-300/70 focus:outline-none focus:ring-0 focus:ring-transparent disabled:opacity-50 disabled:hover:bg-gray-100/60 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:disabled:opacity-50 dark:disabled:hover:bg-gray-600",
              activeButton === "plus" &&
                "scale-95 bg-gray-300/70 dark:bg-gray-600",
            )}
          >
            +
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
