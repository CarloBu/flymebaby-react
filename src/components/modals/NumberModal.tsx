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
  value: number | null;
  onChange: (value: number | null) => void;
  singular: string;
  plural: string;
  min?: number;
  max?: number;
  startFrom?: number | null;
  onRemove?: () => void;
  formatValue?: (value: number) => string;
  placeholder?: string;
  role?: string;
  "aria-label"?: string;
  className?: string;
}

export const NumberModal = ({
  value,
  onChange,
  singular,
  plural,
  min = 0,
  max = 99,
  startFrom = null,
  onRemove,
  formatValue,
  placeholder = "Select",
  role,
  "aria-label": ariaLabel,
  className,
}: NumberModalProps) => {
  const [open, setOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<"plus" | "minus" | null>(
    null,
  );
  const [hasInteracted, setHasInteracted] = React.useState(() => {
    const saved = localStorage.getItem(
      `numberModal_${ariaLabel}_hasInteracted`,
    );
    return saved ? JSON.parse(saved) : false;
  });

  // Save interaction state to localStorage whenever it changes
  React.useEffect(() => {
    if (ariaLabel) {
      localStorage.setItem(
        `numberModal_${ariaLabel}_hasInteracted`,
        JSON.stringify(hasInteracted),
      );
    }
  }, [hasInteracted, ariaLabel]);

  const handleIncrement = () => {
    const currentValue = value ?? startFrom ?? min;
    if (currentValue < max) {
      onChange(currentValue + 1);
      // Visual feedback
      setActiveButton("plus");
      setTimeout(() => setActiveButton(null), 150);
    }
  };

  const handleDecrement = () => {
    const currentValue = value ?? startFrom ?? max;
    if (currentValue > min) {
      onChange(currentValue - 1);
      // Visual feedback
      setActiveButton("minus");
      setTimeout(() => setActiveButton(null), 150);
    }
  };

  // Calculate disabled states
  const isDecrementDisabled =
    value === null ? false : (value ?? startFrom ?? 0) <= min;
  const isIncrementDisabled =
    value === null ? false : (value ?? startFrom ?? 0) >= max;

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
    <Popover
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen && !hasInteracted) {
          setHasInteracted(true);
        }
        setOpen(newOpen);
      }}
    >
      <div className="group relative inline-flex">
        <PopoverTrigger asChild>
          <div
            className={cn(
              "button-animation relative flex min-w-[7rem] cursor-pointer select-none items-center justify-center rounded-full bg-bubble-color px-7 py-3 text-base text-white shadow-bubble-shadow transition-all hover:bg-bubble-color-hover hover:shadow-bubble-hover-shadow dark:bg-bubble-color dark:text-white dark:hover:bg-bubble-color-hover dark:hover:shadow-bubble-hover-shadow",
              className,
              value === null &&
                "bg-bubble-color-select hover:bg-bubble-color-select",
              className,
            )}
            role="button"
            tabIndex={0}
            aria-label={ariaLabel}
          >
            <span className="block overflow-hidden">
              <span className="inline-block w-full transition-transform duration-200 ease-in-out">
                {value === null
                  ? placeholder
                  : formatValue
                    ? formatValue(value)
                    : `${value} ${value === 1 ? singular : plural}`}
              </span>
            </span>
            {onRemove && value !== null && (
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
          "w-auto space-y-2 rounded-3xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800",
        )}
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={isDecrementDisabled}
            aria-label={`Decrease ${singular.toLowerCase()} count`}
            className={cn(
              "h-11 w-14 rounded-full bg-gray-200/70 text-xl font-medium transition-colors hover:bg-gray-300/70 focus:outline-none focus:ring-0 focus:ring-transparent disabled:opacity-50 disabled:hover:bg-gray-200/60 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:disabled:opacity-50 dark:disabled:hover:bg-gray-600",
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
            aria-label={`Increase ${singular.toLowerCase()} count`}
            className={cn(
              "h-11 w-14 rounded-full bg-gray-200/70 text-xl font-medium transition-colors hover:bg-gray-300/70 focus:outline-none focus:ring-0 focus:ring-transparent disabled:opacity-50 disabled:hover:bg-gray-200/60 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:disabled:opacity-50 dark:disabled:hover:bg-gray-600",
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
