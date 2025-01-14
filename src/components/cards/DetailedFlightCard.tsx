import { useState, useEffect } from "react";
import type { Flight } from "@/types/flight";
import {
  calculateTotalPrice,
  getPriceColor,
  generateRyanairLink,
  INFANT_SEAT_PRICE,
  RESERVED_SEAT_FEE,
  formatDate,
  formatTime,
  formatFlightDuration,
} from "@utils/flightUtils";
import { generateShareableUrl } from "@utils/shareUtils";
import { AirplaneIcon } from "@/components/icons";
import { SquareArrowOutUpRight, Check, Heart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  addLikedFlight,
  isFlightLiked,
  removeLikedFlight,
} from "@/utils/likeUtils";
import styles from "@/components/buttons/BookFlightButton.module.css";

interface DetailedFlightCardProps {
  flight: Flight;
  adults: number;
  teens: number;
  children: number;
  infants: number;
  tripDays?: number;
  minPrice: number;
  maxPrice: number;
  isHighlighted?: boolean;
  tripType?: "oneWay" | "return" | "weekend" | "longWeekend";
  bgColor?: string;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}

export function DetailedFlightCard({
  flight,
  adults,
  teens,
  children,
  infants,
  tripDays,
  minPrice,
  maxPrice,
  isHighlighted,
  tripType = "return",
  bgColor = "bg-white dark:bg-gray-200",
}: DetailedFlightCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showLikeTooltip, setShowLikeTooltip] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const showReturnInfo = tripType !== "oneWay";

  useEffect(() => {
    const checkLikedStatus = (): void => {
      setIsLiked(isFlightLiked(flight));
    };

    checkLikedStatus();

    // Listen for storage changes
    window.addEventListener("storage", checkLikedStatus);
    return () => window.removeEventListener("storage", checkLikedStatus);
  }, [flight]);

  const handleLike = () => {
    const flightKey = `${flight.outbound.origin}-${flight.outbound.destination}-${flight.outbound.departureTime}`;

    if (isLiked) {
      removeLikedFlight(flightKey);
      setIsLiked(false);
    } else {
      addLikedFlight(flight, adults, teens, children, infants, {
        min: minPrice,
        max: maxPrice,
      });
      setIsLiked(true);
      setShowLikeTooltip(true);
      setTimeout(() => setShowLikeTooltip(false), 2000);
    }
  };

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
  const flightId = `${flight.outbound.origin}-${flight.outbound.destination}-${flight.outbound.departureTime}`;
  const isReturn = tripType !== "oneWay";
  const infantFee = INFANT_SEAT_PRICE * (isReturn ? 2 : 1);
  const reservedSeatFee = RESERVED_SEAT_FEE * (isReturn ? 2 : 1);

  const handleShare = () => {
    const outboundCountry = flight.outbound.destinationFull.split(", ")[1];
    const inboundCountry = flight.inbound.destinationFull.split(", ")[1];

    if (!outboundCountry || !inboundCountry) {
      console.error("Missing destination country in flight data:", {
        outbound: flight.outbound.destinationFull,
        inbound: flight.inbound.destinationFull,
      });
      return;
    }

    const flightWithCountries = {
      ...flight,
      outbound: {
        ...flight.outbound,
        destinationCountry: outboundCountry,
      },
      inbound: {
        ...flight.inbound,
        destinationCountry: inboundCountry,
      },
    };

    console.log(
      "Sharing flight with countries:",
      JSON.stringify(flightWithCountries, null, 2),
    );
    const shareUrl = generateShareableUrl(
      flightWithCountries,
      adults,
      teens,
      children,
      infants,
      { min: minPrice, max: maxPrice },
    );
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    });
  };

  return (
    <div
      id={`flight-${flightId}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative mt-2 rounded-3xl transition-all duration-300 md:rounded-[1.8rem] ${
        isHighlighted ? "ring-2 ring-gray-600 dark:ring-white" : ""
      }`}
      style={{
        filter: isHovered
          ? `drop-shadow(0 3px 4px rgba(${priceColor.text.replace(/[^\d,]/g, "")}, 0.3))`
          : "none",
      }}
    >
      <div className="relative mx-auto flex flex-col overflow-hidden md:grid md:grid-cols-[5fr,0px,17rem]">
        <div
          className={`space-y-4 rounded-3xl rounded-b-xl border border-slate-200 p-7 transition-all duration-300 md:rounded-[1.8rem] md:rounded-r-xl ${bgColor}`}
          style={{
            backgroundImage: `linear-gradient(${isDesktop ? "90deg" : "180deg"}, rgba(255, 255, 255, 0) 50%, ${priceColor.background.replace("rgb", "rgba").replace(")", ", 0.5)")} 100%)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-600">
                {tripType === "oneWay" ? "From" : "Departure"}
              </div>
              <div className="text-xl font-bold text-gray-900 md:text-2xl">
                {flight.outbound.origin}
              </div>
              <div className="text-base text-gray-600">
                {flight.outbound.originFull}
              </div>

              <div className="text-sm text-gray-600">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`https://www.ryanair.com/gb/en/lp/travel-updates?carrierCode=FR&flightNumber=${flight.outbound.flightNumber.split(" ")[1]}&dateOut=${flight.outbound.departureTime.split("T")[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-black hover:underline"
                      >
                        Ryanair {flight.outbound.flightNumber}
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to check flight status and updates on Ryanair</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex flex-col items-center px-3 md:px-6">
              {showReturnInfo && tripDays && (
                <div className="flex items-center gap-1.5 md:gap-3">
                  <div className="hidden h-[1px] w-12 border-b border-dashed border-gray-600 md:block"></div>
                  <div className="flex items-baseline gap-1 text-gray-600">
                    <span className="text-xs md:text-sm">{tripDays}</span>
                    <span className="text-xs md:text-sm">
                      {tripDays === 1 ? "day" : "days"}
                    </span>
                  </div>
                  <div className="hidden h-[1px] w-12 border-b border-dashed border-gray-600 md:block"></div>
                </div>
              )}
            </div>

            <div className="space-y-1 text-right">
              <div className="text-sm font-medium text-gray-600">
                {tripType === "oneWay" ? "To" : "Return"}
              </div>
              <div className="text-xl font-bold text-gray-900 md:text-2xl">
                {flight.outbound.destination}
              </div>
              <div className="text-base text-gray-600">
                {flight.outbound.destinationFull}
              </div>

              <div className="text-sm text-gray-600">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`https://www.ryanair.com/gb/en/lp/travel-updates?carrierCode=FR&flightNumber=${flight.inbound.flightNumber.split(" ")[1]}&dateOut=${flight.inbound.departureTime.split("T")[0]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-black hover:underline"
                      >
                        Ryanair {flight.inbound.flightNumber}
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to check flight status and updates on Ryanair</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          <div className="0 flex flex-col justify-between gap-3 border-t border-dashed border-gray-200 pt-4 xsm:flex-row md:gap-6">
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600">Departure</div>
              <div>
                <div className="mb-2 text-lg font-medium text-gray-900 sm:text-xl md:text-[1.35rem]">
                  {formatDate(flight.outbound.departureTime)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-base text-gray-600">
                      {formatTime(flight.outbound.departureTime)}
                    </span>
                    <div className="flex items-center px-2">
                      <div className="mr-1.5 h-[1px] w-4 bg-gray-600"></div>
                      <AirplaneIcon className="h-3 w-3 text-gray-600" />
                      <div className="ml-1.5 h-[1px] w-4 bg-gray-600"></div>
                    </div>
                    <span className="text-base text-gray-600">
                      {formatTime(flight.outbound.arrivalTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">
                      {flight.outbound.origin}
                    </span>
                    <span className="text-sm text-gray-600">
                      {/*{formatFlightDuration(flight.outbound.flightDuration)} ·*/}
                      Direct
                    </span>
                    <span className="text-sm font-medium text-gray-600">
                      {flight.outbound.destination}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {showReturnInfo && (
              <div className="space-y-2 md:text-right">
                <div className="text-xs font-medium text-gray-600">Return</div>
                <div>
                  <div className="mb-2 text-lg font-medium text-gray-900 md:text-[1.35rem]">
                    {formatDate(flight.inbound.departureTime)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base text-gray-600">
                        {formatTime(flight.inbound.departureTime)}
                      </span>
                      <div className="flex items-center px-1.5">
                        <div className="mr-1.5 h-[1px] w-4 bg-gray-600"></div>
                        <AirplaneIcon className="h-3 w-4 text-gray-600" />
                        <div className="ml-1.5 h-[1px] w-4 bg-gray-600"></div>
                      </div>
                      <span className="text-base text-gray-600">
                        {formatTime(flight.inbound.arrivalTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        {flight.inbound.origin}
                      </span>
                      <span className="text-sm text-gray-600">
                        {/*{formatFlightDuration(flight.inbound.flightDuration)} ·*/}
                        Direct
                      </span>
                      <span className="text-sm font-medium text-gray-600">
                        {flight.inbound.destination}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vertical divider with cutouts */}
        <div className="relative hidden md:block">
          <div className="my-3 h-[93%] w-[1px] border border-dashed border-white"></div>
        </div>

        {/* Horizontal divider for mobile */}
        <div className="-m-[1px] ml-3 block h-[1px] w-[95%] border border-dashed border-white md:hidden"></div>

        {/* Right section - Price and booking */}
        <div
          className="flex flex-col justify-between rounded-3xl rounded-t-xl border border-slate-200 p-6 transition-all duration-300 md:rounded-[1.8rem] md:rounded-l-xl"
          style={{
            backgroundColor: isHovered
              ? priceColor.backgroundGradient
              : priceColor.background,
            backgroundImage: `linear-gradient(90deg, ${priceColor.background} 0%, ${priceColor.backgroundGradient} 100%)`,
          }}
        >
          <div>
            <div className="mb-1 flex items-center justify-between text-lg text-gray-800 md:mb-2 md:text-base">
              <div>Total Price</div>
              <div className="space-x-2">
                <TooltipProvider>
                  <Tooltip
                    open={showShareTooltip ? showShareTooltip : undefined}
                  >
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleShare}
                        className="scale-100 select-none rounded-xl border border-transparent p-2.5 shadow-sm transition-all duration-300 ease-pop will-change-transform [backface-visibility:hidden] [transform-style:preserve-3d] hover:scale-[1.08] hover:border-current active:scale-90"
                        aria-label="Share flight"
                        style={{
                          backgroundColor: `${priceColor.background}`,
                          color: priceColor.text,
                        }}
                      >
                        {showShareTooltip ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <SquareArrowOutUpRight className="h-4 w-4" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {showShareTooltip
                          ? "Link copied!"
                          : "Share this ticket"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip open={showLikeTooltip ? true : undefined}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleLike}
                        className="scale-100 select-none rounded-xl border border-transparent p-2.5 shadow-sm transition-all duration-300 ease-pop will-change-transform [backface-visibility:hidden] [transform-style:preserve-3d] hover:scale-[1.08] hover:border-current active:scale-90"
                        aria-label={
                          isLiked ? "You saved a flight" : "Save flight"
                        }
                        style={{
                          backgroundColor: isLiked
                            ? "rgb(254, 226, 226)"
                            : `${priceColor.background}`,
                          color: isLiked ? "rgb(220, 38, 38)" : priceColor.text,
                        }}
                      >
                        <Heart
                          className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isLiked ? (
                        <a
                          href="/liked"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          You saved a flight
                        </a>
                      ) : (
                        <p>Save flight</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className="inline-block rounded-2xl bg-gray-900 px-7 py-3.5 text-4xl font-bold md:px-5 md:py-2.5 md:text-2xl md:text-[1.9rem]"
                    style={{
                      backgroundColor: `${priceColor.backgroundGradient}`,
                      backgroundImage: `linear-gradient(180deg,rgba(0, 0, 0, 0.03) 0%, rgba(0, 0, 0, 0.1) 100%)`,
                      color: priceColor.text,
                      cursor: "default",
                    }}
                  >
                    €{Math.round(totalPrice)}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    The total price is calculated for{" "}
                    {adults + teens + children + infants} passengers
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="mt-6 space-y-1 md:mt-4">
              <div className="text-base text-gray-900">
                {[
                  adults > 0 && `${adults} adult${adults !== 1 ? "s" : ""}`,
                  teens > 0 && `${teens} teen${teens !== 1 ? "s" : ""}`,
                  children > 0 &&
                    `${children} ${children === 1 ? "child" : "children"}`,
                  infants > 0 && `${infants} infant${infants !== 1 ? "s" : ""}`,
                ]
                  .filter(Boolean)
                  .join(" • ")}
              </div>
              {(infants > 0 || children > 0) && (
                <div className="text-sm font-medium text-black/60">
                  {[
                    children > 0 && `Reserved seat €${reservedSeatFee} fee`,
                    infants > 0 && `infant seat €${infantFee} fee`,
                  ]
                    .filter(Boolean)
                    .join(" and ")}{" "}
                  {children > 0 && infants > 0 ? "are" : "is"} included
                </div>
              )}
            </div>
          </div>

          <a
            href={generateRyanairLink(
              flight,
              adults,
              teens,
              children,
              infants,
              tripType,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.bookFlightButton} group/flight-button relative mt-4 inline-flex w-full items-center justify-center overflow-hidden rounded-[1.2rem] px-3 py-4 text-base font-medium text-white shadow-[0_0.4rem_1.5rem_-0.3rem] shadow-black/30 [filter:brightness(1.1)_saturate(1.15)] hover:opacity-90 hover:shadow-[0_0.4rem_1rem_-0.2rem] hover:shadow-black/30 md:px-7 md:py-3`}
            aria-label={`Book flight from ${flight.outbound.origin} to ${flight.outbound.destination} for €${Math.round(totalPrice)}`}
            style={{
              backgroundColor: priceColor.text,
              backgroundImage:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.15) 100%), " +
                "linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.07) 50%, rgba(255, 255, 255, 0) 100%)",
            }}
          >
            <span className={styles.buttonText}>Book Flight</span>

            <span className={styles.primaryPlane}>
              <AirplaneIcon
                className="ml-2 h-4 w-4 transform transition-all duration-500 ease-pop group-hover/flight-button:translate-x-1"
                fill="white"
              />
            </span>

            <span className={styles.secondaryPlane}>
              <AirplaneIcon
                className="ml-2 hidden h-4 w-4 transform transition-all duration-500 ease-pop group-hover/flight-button:translate-x-1 md:block"
                fill="white"
              />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
