import React, { useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CloseIcon } from "@/components/icons";

interface PassengerType {
  type: "adult" | "teen" | "child" | "infant";
  count: number;
  ageDescription: string;
  label: string;
  pluralLabel: string;
}

interface PassengerState {
  adult: number | null;
  teen: number | null;
  child: number | null;
  infant: number | null;
}

interface PassengerModalProps {
  passengers: PassengerState;
  onChange: (type: keyof PassengerState, count: number | null) => void;
  placeholder?: string;
  "aria-label"?: string;
}

const PassengerBubble = ({
  count,
  label,
  pluralLabel,
  onClick,
  onRemove,
  type,
}: {
  count: number;
  label: string;
  pluralLabel: string;
  onClick: () => void;
  onRemove?: () => void;
  type: keyof PassengerState;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="button-animation relative flex min-w-[7rem] cursor-pointer select-none items-center justify-center rounded-full bg-bubble-color px-7 py-3 text-base text-white shadow-bubble-shadow transition-all hover:bg-bubble-color-hover hover:shadow-bubble-hover-shadow dark:bg-bubble-color dark:text-white dark:hover:bg-bubble-color-hover dark:hover:shadow-bubble-hover-shadow"
  >
    <span>
      {count} {count === 1 ? label : pluralLabel}
    </span>
    {onRemove && type !== "adult" && (
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
        className="right-0 top-1/2 -mr-3 ml-1 rounded-full bg-black bg-transparent p-1 text-white transition-all duration-200 hover:bg-gray-800 hover:text-white dark:bg-black/20 dark:hover:bg-gray-700 dark:hover:text-white"
      >
        <CloseIcon />
      </span>
    )}
  </button>
);

export const PassengerModal = ({
  passengers,
  onChange,
  placeholder = "Select",
  "aria-label": ariaLabel,
}: PassengerModalProps) => {
  const [open, setOpen] = useState(false);
  const [tempPassengers, setTempPassengers] =
    useState<PassengerState>(passengers);
  const [activeButton, setActiveButton] = useState<{
    type: keyof PassengerState;
    action: "plus" | "minus";
  } | null>(null);
  const [activePassengerType, setActivePassengerType] =
    useState<keyof PassengerState>("adult");
  const [hasInteracted, setHasInteracted] = React.useState(() => {
    const saved = localStorage.getItem(
      `passengerModal_${ariaLabel}_hasInteracted`,
    );
    return saved ? JSON.parse(saved) : false;
  });

  // Save interaction state to localStorage whenever it changes
  React.useEffect(() => {
    if (ariaLabel) {
      localStorage.setItem(
        `passengerModal_${ariaLabel}_hasInteracted`,
        JSON.stringify(hasInteracted),
      );
    }
  }, [hasInteracted, ariaLabel]);

  useEffect(() => {
    if (open) {
      setTempPassengers(passengers);
    }
  }, [open, passengers]);

  const passengerTypes: (PassengerType & { type: keyof PassengerState })[] = [
    {
      type: "adult",
      count: tempPassengers.adult ?? 0,
      ageDescription: "16+",
      label: "Adult",
      pluralLabel: "Adults",
    },
    {
      type: "teen",
      count: tempPassengers.teen ?? 0,
      ageDescription: "12-15",
      label: "Teen",
      pluralLabel: "Teens",
    },
    {
      type: "child",
      count: tempPassengers.child ?? 0,
      ageDescription: "2-11",
      label: "Child",
      pluralLabel: "Children",
    },
    {
      type: "infant",
      count: tempPassengers.infant ?? 0,
      ageDescription: "under 2",
      label: "Infant",
      pluralLabel: "Infants",
    },
  ];

  // Filter passengers with count > 0 for display - using actual passengers, not temp
  const activePassengers = passengerTypes
    .map((p) => ({ ...p, count: passengers[p.type] ?? 0 }))
    .filter((p) => p.count > 0);
  const hasPassengers = activePassengers.length > 0;
  const adultCount = tempPassengers.adult ?? 0;

  const handleIncrement = (type: keyof PassengerState) => {
    const currentCount = tempPassengers[type] ?? 0;

    // If incrementing any non-adult passenger and there's no adult, add one adult first
    if (
      type !== "adult" &&
      (!tempPassengers.adult || tempPassengers.adult === 0)
    ) {
      setTempPassengers((prev) => ({ ...prev, adult: 1 }));
    }

    // Check infant-adult ratio
    if (type === "infant" && currentCount >= (tempPassengers.adult ?? 0)) {
      return; // Cannot add more infants than adults
    }

    if (currentCount < 20) {
      setTempPassengers((prev) => ({ ...prev, [type]: currentCount + 1 }));
      setActiveButton({ type, action: "plus" });
      setTimeout(() => setActiveButton(null), 150);
    }
  };

  const handleDecrement = (type: keyof PassengerState) => {
    const currentCount = tempPassengers[type] ?? 0;

    // For adult type, never allow going back to 0 once it's been set
    if (type === "adult") {
      if (currentCount <= 1) return; // Never allow reducing adult below 1 once set
    }

    // If reducing adult count, check if it would violate infant ratio
    if (type === "adult" && currentCount - 1 < (tempPassengers.infant ?? 0)) {
      // First reduce infant count to match new adult count
      setTempPassengers((prev) => ({ ...prev, infant: currentCount - 1 }));
    }

    if (currentCount > 0) {
      setTempPassengers((prev) => ({ ...prev, [type]: currentCount - 1 }));
      setActiveButton({ type, action: "minus" });
      setTimeout(() => setActiveButton(null), 150);
    }
  };

  const handleApplyChanges = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    Object.entries(tempPassengers).forEach(([type, count]) => {
      onChange(type as keyof PassengerState, count);
    });
    setOpen(false);
  };

  const handleClose = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
    handleApplyChanges();
  };

  const PassengerControls = ({
    type,
    isActive,
  }: {
    type: keyof PassengerState;
    isActive: boolean;
  }) => {
    const currentCount = tempPassengers[type] ?? 0;

    const isDecrementDisabled =
      type === "adult" ? currentCount <= 1 : currentCount === 0;

    const isIncrementDisabled =
      type === "infant"
        ? currentCount >= (tempPassengers.adult ?? 0) || currentCount >= 20
        : currentCount >= 20;

    return (
      <div
        className={cn(
          "mb-2 flex items-center gap-2 transition-opacity duration-200 md:mb-0 md:opacity-0 md:transition-opacity md:duration-200",
          isActive ? "md:opacity-100" : "",
        )}
      >
        <button
          type="button"
          onClick={() => handleDecrement(type)}
          disabled={isDecrementDisabled}
          aria-label={`Decrease ${type.toLowerCase()} count`}
          className={cn(
            "h-11 w-14 select-none rounded-full bg-gray-200/70 text-xl font-medium transition-all hover:bg-gray-300/70 focus:ring-0 focus:ring-transparent disabled:opacity-40 disabled:hover:bg-gray-200/60 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:disabled:opacity-50 dark:disabled:hover:bg-gray-600",
            activeButton?.type === type &&
              activeButton?.action === "minus" &&
              "scale-95 bg-gray-300/70 dark:bg-gray-600",
          )}
        >
          -
        </button>
        <button
          type="button"
          onClick={() => handleIncrement(type)}
          disabled={isIncrementDisabled}
          aria-label={`Increase ${type.toLowerCase()} count`}
          className={cn(
            "h-11 w-14 select-none rounded-full bg-gray-200/70 text-xl font-medium transition-all hover:bg-gray-300/70 focus:ring-0 focus:ring-transparent disabled:opacity-40 disabled:hover:bg-gray-200/60 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 dark:disabled:opacity-50 dark:disabled:hover:bg-gray-600",
            activeButton?.type === type &&
              activeButton?.action === "plus" &&
              "scale-95 bg-gray-300/70 dark:bg-gray-600",
          )}
        >
          +
        </button>
      </div>
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleClose();
        }
        setOpen(newOpen);
      }}
    >
      <PopoverTrigger asChild>
        <div className="flex items-center gap-2">
          {hasPassengers ? (
            activePassengers.map((passenger, index) => (
              <React.Fragment key={passenger.type}>
                {index > 0 && (
                  <span className="w-1 text-bubble-color dark:text-bubble-color"></span>
                )}
                <PassengerBubble
                  count={passenger.count}
                  label={passenger.label}
                  pluralLabel={passenger.pluralLabel}
                  onClick={() => setOpen(true)}
                  onRemove={() => onChange(passenger.type, 0)}
                  type={passenger.type}
                />
              </React.Fragment>
            ))
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              className={cn(
                "button-animation relative flex min-w-[7rem] cursor-pointer select-none items-center justify-center rounded-full bg-bubble-color px-7 py-3 text-base text-white shadow-bubble-shadow transition-all hover:bg-bubble-color-hover hover:shadow-bubble-hover-shadow dark:bg-bubble-color dark:text-white dark:hover:bg-bubble-color-hover dark:hover:shadow-bubble-hover-shadow",
                !hasPassengers &&
                  "bg-bubble-color-select hover:bg-bubble-color-select",
                hasInteracted && !hasPassengers
                  ? "!bg-bubble-color-attention"
                  : "",
              )}
              aria-label={ariaLabel}
            >
              {placeholder}
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          "w-[18rem] space-y-2 rounded-3xl border border-gray-200/70 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800 xxsm:w-[23rem]",
        )}
      >
        <div className="space-y-4">
          <div className="space-y-0">
            {passengerTypes.map((passenger) => (
              <div
                key={passenger.type}
                className="group flex items-center justify-between gap-1 xxsm:gap-2"
                onMouseEnter={() => setActivePassengerType(passenger.type)}
                onMouseLeave={() => setActivePassengerType("adult")}
              >
                <div
                  className={cn(
                    "shrink-0 rounded-full px-3 py-2 transition-colors xxsm:px-6",
                    passenger.count > 0 && "bg-gray-200/70 dark:bg-gray-700",
                  )}
                >
                  <div className="flex items-center gap-2 text-base">
                    <span className="font-medium">
                      {passenger.count > 0 ? passenger.count : ""}{" "}
                      {passenger.count === 0
                        ? passenger.label
                        : passenger.count === 1
                          ? passenger.label
                          : passenger.pluralLabel}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-end gap-2 xxsm:gap-4">
                  <span className="shrink text-xs text-gray-500 xxsm:text-base">
                    {passenger.ageDescription}
                  </span>
                  <PassengerControls
                    type={passenger.type}
                    isActive={activePassengerType === passenger.type}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleApplyChanges}
          className="w-full rounded-full bg-gray-200/70 py-3 text-base font-medium text-gray-900 transition-colors hover:bg-gray-300/70 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          Apply
        </button>
      </PopoverContent>
    </Popover>
  );
};
