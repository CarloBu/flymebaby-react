import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface BaseModalProps {
  options: {
    value: string;
    label: string;
  }[];
  currentValue: string | null;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  "aria-label"?: string;
}

export const BaseModal = ({
  options,
  currentValue,
  onChange,
  className = "",
  placeholder = "Select",
  "aria-label": ariaLabel,
}: BaseModalProps) => {
  const [open, setOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(() => {
    const saved = localStorage.getItem(`baseModal_${ariaLabel}_hasInteracted`);
    return saved ? JSON.parse(saved) : false;
  });
  const currentOption = options.find((opt) => opt.value === currentValue);

  // Save interaction state to localStorage whenever it changes
  React.useEffect(() => {
    if (ariaLabel) {
      localStorage.setItem(
        `baseModal_${ariaLabel}_hasInteracted`,
        JSON.stringify(hasInteracted),
      );
    }
  }, [hasInteracted, ariaLabel]);

  const handleSelect = (value: string) => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    onChange(value);
    setOpen(false);
  };

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "button-animation relative flex w-fit cursor-pointer select-none items-center justify-center rounded-full bg-bubble-color px-7 py-3 text-base text-white shadow-bubble-shadow transition-all hover:bg-bubble-color-hover hover:shadow-bubble-hover-shadow dark:bg-bubble-color dark:text-white dark:hover:bg-bubble-color-hover dark:hover:shadow-bubble-hover-shadow",
              !currentValue &&
                "bg-bubble-color-select hover:bg-bubble-color-select",
            )}
          >
            {currentOption?.label || placeholder}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto space-y-2 rounded-3xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={cn(
                  "flex w-full items-center justify-between rounded-full px-6 py-2 text-center transition-all hover:bg-gray-200/70 dark:hover:bg-gray-700",
                  currentValue === option.value && "",
                )}
              >
                <span>{option.label}</span>
                {currentValue === option.value && (
                  <Check
                    className="-mr-2 ml-3 h-4 w-4 text-gray-900 dark:text-gray-200"
                    aria-label="Option selected"
                  />
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
