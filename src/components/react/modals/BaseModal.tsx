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
  currentValue: string;
  onChange: (value: string) => void;
  className?: string;
}

export const BaseModal = ({
  options,
  currentValue,
  onChange,
  className = "",
}: BaseModalProps) => {
  const [open, setOpen] = useState(false);
  const currentOption = options.find((opt) => opt.value === currentValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className="orange-button button-animation">
          {currentOption?.label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-auto space-y-2 rounded-3xl border border-gray-100 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800",
          className,
        )}
      >
        <div className="space-y-2">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-full px-6 py-2 text-center hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span>{option.label}</span>
              {currentValue === option.value && (
                <svg
                  className="-mr-2 ml-2 h-5 w-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
