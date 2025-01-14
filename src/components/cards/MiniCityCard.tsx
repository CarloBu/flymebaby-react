import { useState } from "react";
import type { CityData } from "@/types/flight";
import { calculateTotalPrice, getPriceColor } from "@utils/flightUtils";
import { PassengerIcon } from "../icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MiniCityCardProps {
  city: string;
  cityData: CityData;
  onCardClick: () => void;
  minPrice: number;
  maxPrice: number;
  adults: number;
  teens: number;
  children: number;
  infants: number;
  tripType?: "oneWay" | "return" | "weekend" | "longWeekend";
  imageFilename?: string;
}

export function MiniCityCard({
  city,
  cityData,
  onCardClick,
  minPrice,
  maxPrice,
  adults,
  teens,
  children,
  infants,
  tripType = "return",
  imageFilename,
}: MiniCityCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cityMinPrice = Math.min(
    ...cityData.flights.map((flight) =>
      calculateTotalPrice(
        flight.outbound.price,
        flight.inbound.price,
        adults,
        teens,
        children,
        infants,
        tripType,
      ),
    ),
  );
  const priceColor = getPriceColor(cityMinPrice, minPrice, maxPrice);
  const totalPassengers = adults + teens + children + infants;
  const cardPath =
    "M3.22351 49.9734C7.43279 48.5416 10.3066 44.4181 10.3 39.9992C10.2933 35.5833 7.44159 31.4566 3.22303 30.0265L3.18902 30.0149L3.15371 30.0084C2.36273 29.8616 1.73122 29.5008 1.23708 28.9245C0.746737 28.3527 0.5 27.678 0.5 26.875V10C0.5 7.38057 1.40928 5.15314 3.238 3.29027C5.06683 1.42729 7.2455 0.503239 9.8003 0.5H190.2C192.754 0.503239 194.933 1.42729 196.762 3.29027C198.591 5.15314 199.5 7.38057 199.5 10V70C199.5 72.6194 198.591 74.8469 196.762 76.7097C194.933 78.5727 192.754 79.4968 190.2 79.5H9.79999C7.24185 79.5 5.06355 78.5775 3.2383 76.715C1.41279 74.8523 0.50318 72.623 0.5 69.9997V53.125C0.5 52.322 0.746738 51.6473 1.23707 51.0755C1.73123 50.4992 2.36273 50.1383 3.1537 49.9916L3.18927 49.985L3.22351 49.9734Z";

  return (
    <div
      className="relative aspect-[200/80] w-full transition-all duration-300"
      style={{
        filter: isHovered
          ? "drop-shadow(0 3px 6px rgba(0, 0, 0, 0.4))"
          : "none",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SVG Mask Definition */}
      <svg
        width="200"
        height="80"
        viewBox="0 0 200 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-0 top-0 h-full w-full"
      >
        <defs>
          <mask id="cardMask" width="200" height="80">
            <path d={cardPath} fill="white" transform="scale(1)" />
          </mask>
        </defs>
      </svg>

      {/* Background Image with Mask */}
      {imageFilename && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(0, 0, 0, 0.05) 50%, rgba(0, 0, 0, 0.2) 100%), url(/city-postcards-webp/${imageFilename}.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            WebkitMask: `url("data:image/svg+xml,%3Csvg width='200' height='80' viewBox='0 0 200 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${cardPath}' fill='white'/%3E%3C/svg%3E")`,
            WebkitMaskSize: "100% 100%",
            mask: `url("data:image/svg+xml,%3Csvg width='200' height='80' viewBox='0 0 200 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='${cardPath}' fill='white'/%3E%3C/svg%3E")`,
            maskSize: "100% 100%",
          }}
        />
      )}

      {/* SVG Border */}
      <svg
        width="200"
        height="80"
        viewBox="0 0 200 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-0 top-0 h-full w-full transition-all duration-300"
        style={{
          stroke: isHovered ? "rgba(0, 128, 192, 0.5)" : "transparent",
        }}
      >
        <path d={cardPath} />
      </svg>

      {/* Content */}
      <div
        onClick={onCardClick}
        className="absolute left-0 top-0 flex h-full w-full cursor-pointer flex-col justify-between pb-4 pl-7 pr-3 pt-3"
      >
        <div className="flex items-start justify-between">
          <div
            className="-ml-1.5 -mt-1.5 max-w-[80%] truncate p-1 text-[4.2vw] font-medium text-white [text-shadow:0_1px_9px_rgba(0,0,0,0.7)] dark:text-white ssm:text-2xl"
            title={city}
          >
            {city}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center rounded-[0.6rem] bg-white px-3 py-1">
                  <span className="text-[3.2vw] font-medium text-gray-700 ssm:text-xs">
                    {totalPassengers} x
                  </span>
                  <PassengerIcon className="ml-1 h-3 w-3 text-gray-700" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Tickets for{" "}
                  {adults > 0 && `${adults} adult${adults > 1 ? "s" : ""}`}
                  {adults > 0 && (teens > 0 || children > 0 || infants > 0)
                    ? ", "
                    : ""}
                  {teens > 0 && `${teens} teen${teens > 1 ? "s" : ""}`}
                  {teens > 0 && (children > 0 || infants > 0) ? ", " : ""}
                  {children > 0 &&
                    `${children} child${children > 1 ? "ren" : ""}`}
                  {children > 0 && infants > 0 ? ", " : ""}
                  {infants > 0 && `${infants} infant${infants > 1 ? "s" : ""}`}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-end justify-between">
          <span className="mb-1 text-[3.2vw] text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.9)] dark:text-white ssm:text-sm">
            {cityData.flights.length} flight
            {cityData.flights.length !== 1 ? "s" : ""}
          </span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span
                  className="bottom-2 rounded-xl px-4 py-2 text-[4.8vw] font-bold ssm:text-[1rem]"
                  style={{
                    backgroundColor: priceColor.background,
                    color: priceColor.text,
                    backgroundImage: `linear-gradient(180deg, ${priceColor.background} 0%, ${priceColor.backgroundGradient} 100%)`,
                  }}
                >
                  <span className="mr-2 text-[3vw] font-semibold ssm:text-[0.8rem]">
                    Starting from
                  </span>
                  €{Math.round(cityMinPrice)}
                </span>
              </TooltipTrigger>
              <TooltipContent className="mb-1">
                <p>
                  The total price is calculated for {totalPassengers} passengers
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
