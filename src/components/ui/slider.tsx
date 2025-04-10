"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  className?: string;
  defaultValue?: [number, number];
  max?: number;
  step?: number;
  onValueChange?: (values: number[]) => void;
  onValueCommit?: (values: number[]) => void;
}

const formatTime = (hour: number) => {
  if (hour === 24) {
    return "23:59";
  }
  return `${hour.toString().padStart(2, "0")}:00`;
};

const HANDLER_WIDTH = 91; // Width of the handler in pixels

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      defaultValue = [0, 24],
      max = 24,
      step = 1,
      onValueChange,
      onValueCommit,
    },
    ref,
  ) => {
    const [values, setValues] = React.useState<[number, number]>(defaultValue);
    const [isDragging, setIsDragging] = React.useState<number | null>(null);
    const sliderRef = React.useRef<HTMLDivElement>(null);

    const calculatePosition = (clientX: number, forceNoOffset = false) => {
      if (!sliderRef.current) return 0;
      const rect = sliderRef.current.getBoundingClientRect();
      const width = rect.width;

      // Adjust the clientX based on which handler is being dragged
      let adjustedClientX = clientX;
      if (isDragging !== null && !forceNoOffset) {
        const offset = (HANDLER_WIDTH / 2) * (isDragging === 0 ? 1 : -1);
        adjustedClientX += offset;
      }

      const position = ((adjustedClientX - rect.left) / width) * max;
      return Math.min(Math.max(Math.round(position / step) * step, 0), max);
    };

    const handlePointerDown = (
      e: React.PointerEvent<HTMLDivElement>,
      index: number,
    ) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(index);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (isDragging === null) return;

      const newPosition = calculatePosition(e.clientX);
      const newValues: [number, number] = [...values];

      // Ensure values stay in order and maintain minimum step difference
      if (isDragging === 0) {
        // Ensure the start time is not greater than end time minus step
        newValues[0] = Math.min(newPosition, values[1] - step);
      } else {
        // Ensure the end time is not less than start time plus step
        newValues[1] = Math.max(newPosition, values[0] + step);
      }

      setValues(newValues);
      onValueChange?.(newValues);
    };

    const handlePointerUp = () => {
      if (isDragging !== null) {
        onValueCommit?.(values);
        setIsDragging(null);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative ml-24 h-12 w-full touch-none select-none",
          className,
        )}
      >
        <div
          ref={sliderRef}
          className="absolute inset-0 h-full cursor-pointer"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Left padding */}
          <div
            className="absolute left-0 h-full w-24 -translate-x-full rounded-l-full bg-gray-200 dark:bg-gray-700"
            onClick={(e) => {
              // Set position to 0 when clicking left padding
              const newValues: [number, number] = [...values];
              newValues[0] = 0;
              setValues(newValues);
              onValueChange?.(newValues);
              onValueCommit?.(newValues);
              e.stopPropagation();
            }}
          />

          {/* Background track */}
          <div
            className="absolute inset-0 h-full bg-gray-200 dark:bg-gray-700"
            onClick={(e) => {
              if (isDragging !== null) return;
              const rect = sliderRef.current?.getBoundingClientRect();
              if (!rect) return;

              // Calculate the raw desired position without any offsets
              const desiredPosition = calculatePosition(e.clientX, true);

              // Find the nearest handle
              const distanceToFirst = Math.abs(desiredPosition - values[0]);
              const distanceToSecond = Math.abs(desiredPosition - values[1]);
              const handleIndex = distanceToFirst <= distanceToSecond ? 0 : 1;

              // Calculate the clientX that would result in our desired position after offset
              const handleOffset =
                (HANDLER_WIDTH / 2) * (handleIndex === 0 ? 1 : -1);
              const adjustedClientX = e.clientX + handleOffset;
              let newPosition = calculatePosition(adjustedClientX);

              const newValues: [number, number] = [...values];

              // Apply the minimum step constraint when setting the position via click
              if (handleIndex === 0) {
                // Moving the start handle: ensure it's not >= end handle - step
                newPosition = Math.min(newPosition, values[1] - step);
              } else {
                // Moving the end handle: ensure it's not <= start handle + step
                newPosition = Math.max(newPosition, values[0] + step);
              }

              newValues[handleIndex] = newPosition;

              setValues(newValues);
              onValueChange?.(newValues);
              onValueCommit?.(newValues);
            }}
          >
            {/* Active range */}
            <div
              className="absolute top-[0.375rem] h-9 bg-gray-200 dark:bg-gray-700"
              style={{
                left: `${(values[0] / max) * 100}%`,
                right: `${100 - (values[1] / max) * 100}%`,
              }}
            />

            {/* Right padding */}
            <div className="absolute right-0 h-full w-24 translate-x-full rounded-r-full bg-gray-200 dark:bg-gray-700" />

            {/* Thumbs */}
            {[0, 1].map((index) => (
              <div
                key={index}
                className={cn(
                  "absolute top-[0.375rem] flex h-9 w-[5.5rem] cursor-grab items-center justify-center bg-black text-lg font-medium text-white dark:bg-gray-200 dark:text-gray-900",
                  index === 0 ? "rounded-full" : "rounded-full",
                )}
                style={{
                  left: `${(values[index] / max) * 100}%`,
                  transform: `translate(-${index === 0 ? 100 : 0}%, 0)`,
                }}
                onPointerDown={(e) => handlePointerDown(e, index)}
              >
                {formatTime(values[index])}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
);

Slider.displayName = "Slider";

export { Slider };
