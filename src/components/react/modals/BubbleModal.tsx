import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface PassengerType {
  type: "teen" | "child" | "infant";
  count: number;
}

interface BubbleModalProps {
  onAddPassenger: (type: PassengerType["type"]) => void;
  selectedTypes: PassengerType["type"][];
  className?: string;
}

export const BubbleModal = ({
  onAddPassenger,
  selectedTypes,
  className = "",
}: BubbleModalProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const options = [
    {
      value: "teen",
      label: "Teens",
      description: "12-15 years at the time of travel",
    },
    {
      value: "child",
      label: "Children",
      description: "2-11 years at the time of travel",
    },
    {
      value: "infant",
      label: "Infant",
      description: "Under 2 years at the time of travel",
    },
  ] as const;

  const handleSelect = (type: PassengerType["type"]) => {
    onAddPassenger(type);
    setIsPopoverOpen(false);
  };

  const TooltipInfo = () => (
    <div className="space-y-2 text-sm">
      {options.map((option) => (
        <div key={option.value}>
          <div className="font-medium">{option.label}</div>
          <div className="text-gray-800 dark:text-gray-200">
            {option.description}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip open={showTooltip}>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <div className="relative">
            <TooltipTrigger
              asChild
              onMouseEnter={() => !isPopoverOpen && setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "relative left-2 rounded-full bg-gray-900 p-3 text-white button-animation hover:opacity-80 dark:bg-gray-100 dark:text-gray-900",
                    className,
                  )}
                >
                  <Plus className="h-5 w-5 stroke-[3]" />
                </button>
              </PopoverTrigger>
            </TooltipTrigger>

            <TooltipContent
              side="top"
              className="mb-2 w-64 rounded-xl border-gray-200 bg-white p-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <TooltipInfo />
            </TooltipContent>

            <PopoverContent
              className="w-auto min-w-36 rounded-3xl border border-gray-100 p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
              align="center"
            >
              <div className="space-y-1">
                {options.map((option) => {
                  const isSelected = selectedTypes.includes(option.value);
                  if (isSelected) return null;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className="block w-full rounded-full px-6 py-2 text-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {option.label.replace(/s$/, "")}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </div>
        </Popover>
      </Tooltip>
    </TooltipProvider>
  );
};
