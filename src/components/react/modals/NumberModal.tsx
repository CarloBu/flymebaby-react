import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/icons";
import { X, Plus, Minus } from "lucide-react";

interface NumberModalProps {
  value: number;
  onChange: (value: number) => void;
  singular: string;
  plural: string;
  min?: number;
  max?: number;
  onRemove?: () => void;
  formatValue?: (value: number) => string;
  role?: string;
  "aria-label"?: string;
}

export const NumberModal = ({
  value,
  onChange,
  singular,
  plural,
  min = 0,
  max = 99,
  onRemove,
  formatValue,
  role,
  "aria-label": ariaLabel,
}: NumberModalProps) => {
  const [open, setOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<"plus" | "minus" | null>(
    null,
  );

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
      // Visual feedback
      setActiveButton("plus");
      setTimeout(() => setActiveButton(null), 150);
    }
  };

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
      // Visual feedback
      setActiveButton("minus");
      setTimeout(() => setActiveButton(null), 150);
    }
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard events when modal is open
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="group relative inline-flex">
        <PopoverTrigger asChild>
          <div
            className="button-animation relative flex min-w-[6rem] cursor-pointer select-none items-center justify-center rounded-full bg-orange-custom px-5 py-2 text-base text-white shadow-orange-shadow transition-all hover:bg-orange-hover-custom hover:shadow-orange-hover-shadow dark:bg-orange-custom dark:text-white dark:hover:bg-orange-hover-custom dark:hover:shadow-orange-hover-shadow sm:min-w-[7rem] sm:px-6 sm:py-3"
            role="button"
            tabIndex={0}
            aria-label={ariaLabel}
          >
            <span className="block overflow-hidden">
              <span className="inline-block w-full transition-transform duration-200 ease-in-out">
                {formatValue
                  ? formatValue(value)
                  : `${value} ${value === 1 ? singular : plural}`}
              </span>
            </span>
            {onRemove && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onRemove();
                  }
                }}
                aria-label="Remove"
                className="right-0 top-1/2 -mr-3 ml-1 rounded-full bg-black bg-white/20 p-1 text-white transition-all duration-200 hover:bg-gray-800 hover:text-white dark:bg-black/20 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <CloseIcon />
              </span>
            )}
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
            aria-label={`Decrease ${singular.toLowerCase()} count`}
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
            aria-label={`Increase ${singular.toLowerCase()} count`}
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
