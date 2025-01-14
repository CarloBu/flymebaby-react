import { useState } from "react";
import type { Flight } from "@/types/flight";
import {
  calculateTotalPrice,
  getPriceColor,
  formatDateTime,
  calculateTripDays,
} from "@utils/flightUtils";

const cardPath =
  "M154.576 49.9734L154.611 49.985L154.646 49.9916C156.184 50.2769 157.3 51.5699 157.3 53.125V69.9994C157.294 75.1126 153.144 79.5 148 79.5H9.79999C4.65607 79.5 0.506225 75.1127 0.5 69.9997V53.125C0.5 51.5699 1.61583 50.2769 3.1537 49.9916L3.18927 49.985L3.22351 49.9734C12.4457 46.8365 12.4607 33.1581 3.22303 30.0265L3.18902 30.0149L3.15371 30.0084C1.61583 29.7231 0.5 28.4301 0.5 26.875V10C0.5 4.88996 4.66244 0.506539 9.8003 0.5H148C153.138 0.506539 157.3 4.88996 157.3 10V26.875C157.3 28.4301 156.184 29.7231 154.646 30.0084L154.611 30.0149L154.577 30.0265C145.339 33.1581 145.354 46.8365 154.576 49.9734Z";

interface MiniFlightCardProps {
  flight: Flight;
  minPrice: number;
  maxPrice: number;
  onClick?: () => void;
  onFlightClick?: (flightId: string) => void;
  tripType?: "oneWay" | "return" | "weekend" | "longWeekend";
  adults: number;
  teens: number;
  children: number;
  infants: number;
}

export function MiniFlightCard({
  flight,
  minPrice,
  maxPrice,
  onClick,
  onFlightClick,
  tripType = "return",
  adults,
  teens,
  children,
  infants,
}: MiniFlightCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const showReturnInfo = tripType !== "oneWay";
  const flightId = `${flight.outbound.origin}-${flight.outbound.destination}-${flight.outbound.departureTime}`;
  const tripDays = showReturnInfo
    ? calculateTripDays(
        flight.outbound.departureTime,
        flight.inbound.departureTime,
      )
    : undefined;

  const totalPrice = calculateTotalPrice(
    flight.outbound.price,
    flight.inbound.price,
    adults,
    teens,
    children,
    infants,
    tripType,
  );

  const priceColor = getPriceColor(totalPrice, minPrice, maxPrice);

  const handleClick = () => {
    onClick?.();
    onFlightClick?.(flightId);

    setTimeout(() => {
      const detailedCard = document.getElementById(`flight-${flightId}`);
      if (detailedCard) {
        detailedCard.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  return (
    <div className="relative aspect-[158/80] w-full">
      <div
        className="group absolute inset-0 cursor-pointer transition-all duration-300"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          filter: isHovered
            ? `drop-shadow(0 4px 6px rgba(${priceColor.shadowColor.replace(/[^\d,]/g, "")}, 0.5))`
            : "none",
        }}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 158 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={cardPath} fill={`url(#cardGradient-${flightId})`} />
          <defs>
            <linearGradient
              id={`cardGradient-${flightId}`}
              x1="0"
              y1="0"
              x2="0"
              y2="80"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={priceColor.background} />
              <stop offset="100%" stopColor={priceColor.backgroundGradient} />
            </linearGradient>
          </defs>
        </svg>

        <svg
          viewBox="0 0 158 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 h-full w-full transition-all duration-300"
          style={{
            stroke: isHovered
              ? priceColor.backgroundGradientDarker
              : "transparent",
          }}
        >
          <path d={cardPath} />
        </svg>

        <div className="absolute inset-0 flex flex-col justify-between px-[12.5%] pb-[6%] pt-[8%]">
          <div className="flex items-center justify-between">
            <span className="whitespace-nowrap text-[clamp(0.6rem,3vw,0.8rem)] font-medium text-gray-800 dark:text-gray-800 xsm:text-base">
              {formatDateTime(flight.outbound.departureTime, true)}
            </span>
            {showReturnInfo && (
              <>
                <span className="px-[2px] text-gray-600 dark:text-gray-800">
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[0.5em] w-[0.5em] translate-y-[1px] -rotate-90"
                  >
                    <path
                      d="M4.35355 7.35355C4.15829 7.54882 3.84171 7.54882 3.64645 7.35355L0.464466 4.17157C0.269204 3.97631 0.269204 3.65973 0.464466 3.46447C0.659728 3.2692 0.976311 3.2692 1.17157 3.46447L4 6.29289L6.82843 3.46447C7.02369 3.2692 7.34027 3.2692 7.53553 3.46447C7.7308 3.65973 7.7308 3.97631 7.53553 4.17157L4.35355 7.35355ZM4.5 0L4.5 7H3.5L3.5 0L4.5 0Z"
                      fill="currentColor"
                    />
                  </svg>
                </span>
                <span className="whitespace-nowrap text-[clamp(0.6rem,3vw,0.8rem)] font-medium text-gray-800 dark:text-gray-800 xsm:text-base">
                  {formatDateTime(flight.inbound.departureTime, true)}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between">
            {showReturnInfo && tripDays && (
              <span className="text-[clamp(0.5rem,2.3vw,0.67rem)] text-gray-600 dark:text-gray-700 xsm:text-sm">
                {tripDays} day{tripDays !== 1 ? "s" : ""}
              </span>
            )}
            <span
              className="text-[clamp(0.6rem,3.5vw,0.98rem)] font-bold xsm:text-lg"
              style={{ color: priceColor.text }}
            >
              €{Math.round(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
