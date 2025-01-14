import type { Flight } from "../types/flight";

export const INFANT_SEAT_PRICE = 25; // EUR per one-way flight
export const RESERVED_SEAT_FEE = 8; // EUR per flight when there are children

export function formatDateTime(dateString: string, short: boolean = false) {
  const date = new Date(dateString);

  if (short) {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    });
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateRyanairLink(
  flight: Flight,
  adults: number,
  teens: number,
  children: number,
  infants: number,
  tripType: "oneWay" | "return" | "weekend" | "longWeekend",
): string {
  const isReturn =
    tripType === "return" ||
    tripType === "weekend" ||
    tripType === "longWeekend";

  const baseUrl = "https://www.ryanair.com/gb/en/trip/flights/select";
  const params = new URLSearchParams({
    adults: adults.toString(),
    teens: teens.toString(),
    children: children.toString(),
    infants: infants.toString(),
    dateOut: formatDateForRyanair(flight.outbound.departureTime),
    originIata: flight.outbound.origin,
    destinationIata: flight.outbound.destination,
    isReturn: isReturn.toString(),
  });

  if (isReturn && flight.inbound) {
    params.append("dateIn", formatDateForRyanair(flight.inbound.departureTime));
  }

  return `${baseUrl}?${params.toString()}`;
}

function formatDateForRyanair(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

export function calculateTripDays(
  outboundDate: string,
  inboundDate: string,
): number {
  const outbound = new Date(outboundDate);
  const inbound = new Date(inboundDate);

  // Reset time part to compare only dates
  outbound.setHours(0, 0, 0, 0);
  inbound.setHours(0, 0, 0, 0);

  // Calculate difference in days
  const diffTime = inbound.getTime() - outbound.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function getPriceColor(
  price: number,
  minPrice: number,
  maxPrice: number,
): {
  text: string;
  background: string;
  backgroundGradient: string;
  backgroundGradientDarker: string;
  shadowColor: string;
  borderColor: string;
  hoverBorderColor: string;
} {
  const percentage = (price - minPrice) / (maxPrice - minPrice);

  const colors = {
    green: {
      bg: { r: 199, g: 255, b: 165 },
      text: { r: 70, g: 133, b: 33 },
      bgGradient: { r: 157, g: 250, b: 100 },
      bgShadow: { r: 115, g: 194, b: 66 },
      border: { r: 64, g: 120, b: 31 },
    },
    yellow: {
      bg: { r: 255, g: 243, b: 165 },
      text: { r: 133, g: 124, b: 33 },
      bgGradient: { r: 250, g: 234, b: 100 },
      bgShadow: { r: 194, g: 181, b: 66 },
      border: { r: 120, g: 112, b: 31 },
    },
    red: {
      bg: { r: 255, g: 190, b: 190 },
      text: { r: 133, g: 55, b: 55 },
      bgGradient: { r: 250, g: 150, b: 150 },
      bgShadow: { r: 194, g: 96, b: 96 },
      border: { r: 120, g: 51, b: 51 },
    },
  };

  let r,
    g,
    b,
    bgR,
    bgG,
    bgB,
    bgShadowR,
    bgShadowG,
    bgShadowB,
    bgGradientR,
    bgGradientG,
    bgGradientB,
    borderR,
    borderG,
    borderB;

  if (percentage <= 0.5) {
    const factor = percentage * 2;
    [r, g, b] = interpolateColors(
      colors.green.text,
      colors.yellow.text,
      factor,
    );
    [bgR, bgG, bgB] = interpolateColors(
      colors.green.bg,
      colors.yellow.bg,
      factor,
    );
    [bgShadowR, bgShadowG, bgShadowB] = interpolateColors(
      colors.green.bgShadow,
      colors.yellow.bgShadow,
      factor,
    );
    [bgGradientR, bgGradientG, bgGradientB] = interpolateColors(
      colors.green.bgGradient,
      colors.yellow.bgGradient,
      factor,
    );
    [borderR, borderG, borderB] = interpolateColors(
      colors.green.border,
      colors.yellow.border,
      factor,
    );
  } else {
    const factor = (percentage - 0.5) * 2;
    [r, g, b] = interpolateColors(colors.yellow.text, colors.red.text, factor);
    [bgR, bgG, bgB] = interpolateColors(
      colors.yellow.bg,
      colors.red.bg,
      factor,
    );
    [bgShadowR, bgShadowG, bgShadowB] = interpolateColors(
      colors.yellow.bgShadow,
      colors.red.bgShadow,
      factor,
    );
    [bgGradientR, bgGradientG, bgGradientB] = interpolateColors(
      colors.yellow.bgGradient,
      colors.red.bgGradient,
      factor,
    );
    [borderR, borderG, borderB] = interpolateColors(
      colors.yellow.border,
      colors.red.border,
      factor,
    );
  }

  return {
    text: `rgb(${r}, ${g}, ${b})`,
    background: `rgb(${bgR}, ${bgG}, ${bgB})`,
    shadowColor: `rgb(${bgShadowR}, ${bgShadowG}, ${bgShadowB})`,
    backgroundGradient: `rgb(${bgGradientR}, ${bgGradientG}, ${bgGradientB})`,
    backgroundGradientDarker: `rgb(${bgGradientR * 0.84}, ${bgGradientG * 0.84}, ${bgGradientB * 0.84})`,
    borderColor: `rgb(${borderR}, ${borderG}, ${borderB})`,
    hoverBorderColor: "rgb(31, 41, 55)",
  };
}

function interpolateColors(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number },
  factor: number,
): [number, number, number] {
  return [
    Math.round(color1.r + (color2.r - color1.r) * factor),
    Math.round(color1.g + (color2.g - color1.g) * factor),
    Math.round(color1.b + (color2.b - color1.b) * factor),
  ];
}

export function calculateTotalPrice(
  outboundPrice: number,
  inboundPrice: number,
  adults: number,
  teens: number,
  children: number,
  infants: number,
  tripType: "oneWay" | "return" | "weekend" | "longWeekend" = "return",
): number {
  const isReturn =
    tripType === "return" ||
    tripType === "weekend" ||
    tripType === "longWeekend";

  // Calculate base price for outbound flight
  const outboundBasePrice = outboundPrice * (adults + teens + children);

  // Calculate base price for inbound flight if it's a return trip
  const inboundBasePrice = isReturn
    ? inboundPrice * (adults + teens + children)
    : 0;

  // Calculate infant fees (per flight)
  const infantFee = INFANT_SEAT_PRICE * infants * (isReturn ? 2 : 1);

  // Add reserved seat fee when there are children
  // One reserved seat fee per flight when there are children, regardless of the number of children
  const reservedSeatFee =
    children > 0 ? RESERVED_SEAT_FEE * (isReturn ? 2 : 1) : 0;

  return outboundBasePrice + inboundBasePrice + infantFee + reservedSeatFee;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const weekday = date.toLocaleDateString("en-US", {
    weekday: "long", // 'Monday' instead of 'Mon'
  });

  // Format as DD/MM/YYYY
  const numericDate = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${weekday}, ${numericDate}`;
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatFlightDuration(durationInMinutes: number): string {
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

export function generateFlightKey(flight: Flight): string {
  return `${flight.outbound.origin}-${flight.outbound.destination}-${flight.outbound.departureTime}`;
}
