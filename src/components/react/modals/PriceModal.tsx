import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PriceModalProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  currency?: string;
}

export const PriceModal = ({
  value,
  onChange,
  min = 0,
  max = 10000,
  currency = "EUR",
}: PriceModalProps) => {
  const [open, setOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<"plus" | "minus" | null>(
    null,
  );

  const handleIncrement = () => {
    const newValue = Math.min(value + 50, max);
    onChange(newValue);
    // Visual feedback
    setActiveButton("plus");
    setTimeout(() => setActiveButton(null), 150);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - 50, min);
    onChange(newValue);
    // Visual feedback
    setActiveButton("minus");
    setTimeout(() => setActiveButton(null), 150);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
        case "+":
        case "ArrowRight":
          e.preventDefault();
          handleIncrement();
          break;
        case "ArrowDown":
        case "-":
        case "ArrowLeft":
          e.preventDefault();
          handleDecrement();
          break;
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [value, min, max, open]);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ${currency}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative inline-flex">
        <PopoverTrigger asChild>
          <div className="relative flex min-w-[8rem] cursor-pointer select-none items-center justify-center rounded-full bg-orange-custom px-6 py-3 text-base text-white shadow-orange-shadow button-animation hover:bg-orange-hover-custom hover:shadow-orange-hover-shadow dark:bg-orange-custom dark:text-white dark:hover:bg-orange-hover-custom dark:hover:shadow-orange-hover-shadow">
            <span className="block overflow-hidden">
              <span className="inline-block w-full transition-transform duration-200 ease-in-out">
                {formatPrice(value)}
              </span>
            </span>
          </div>
        </PopoverTrigger>
      </div>

      <PopoverContent
        className={cn(
          "w-auto space-y-2 rounded-3xl border border-gray-100 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800",
        )}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={value <= min}
            aria-label="Decrease price"
            className={cn(
              "h-11 w-14 rounded-full bg-gray-100 text-xl font-medium transition-colors hover:bg-gray-200 focus:outline-none focus:ring-0 focus:ring-transparent disabled:opacity-50 disabled:hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:disabled:opacity-50 dark:disabled:hover:bg-gray-600",
              activeButton === "minus" &&
                "scale-95 bg-gray-200 dark:bg-gray-600",
            )}
          >
            -
          </button>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={value >= max}
            aria-label="Increase price"
            className={cn(
              "h-11 w-14 rounded-full bg-gray-100 text-xl font-medium transition-colors hover:bg-gray-200 focus:outline-none focus:ring-0 focus:ring-transparent disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:disabled:opacity-50 dark:disabled:hover:bg-gray-600",
              activeButton === "plus" &&
                "scale-95 bg-gray-200 dark:bg-gray-600",
            )}
          >
            +
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
