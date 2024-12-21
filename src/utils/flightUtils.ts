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
  backgroundHover: string;
  borderColor: string;
  hoverBorderColor: string;
} {
  if (maxPrice === minPrice) {
    return {
      text: "rgb(21, 128, 61)",
      background: "rgb(220, 252, 231)",
      backgroundHover: "rgb(187, 247, 208)",
      borderColor: "rgb(134, 239, 172)",
      hoverBorderColor: "rgb(31, 41, 55)",
    };
  }

  const percentage = (price - minPrice) / (maxPrice - minPrice);

  const colors = {
    green: {
      text: { r: 21, g: 128, b: 61 },
      bg: { r: 220, g: 252, b: 231 },
      bgHover: { r: 187, g: 247, b: 208 },
      border: { r: 134, g: 239, b: 172 },
    },
    yellow: {
      text: { r: 239, g: 184, b: 98 },
      bg: { r: 254, g: 249, b: 195 },
      bgHover: { r: 254, g: 240, b: 138 },
      border: { r: 250, g: 204, b: 21 },
    },
    red: {
      text: { r: 225, g: 112, b: 85 },
      bg: { r: 254, g: 226, b: 226 },
      bgHover: { r: 254, g: 202, b: 202 },
      border: { r: 248, g: 113, b: 113 },
    },
  };

  let r,
    g,
    b,
    bgR,
    bgG,
    bgB,
    bgHoverR,
    bgHoverG,
    bgHoverB,
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
    [bgHoverR, bgHoverG, bgHoverB] = interpolateColors(
      colors.green.bgHover,
      colors.yellow.bgHover,
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
    [bgHoverR, bgHoverG, bgHoverB] = interpolateColors(
      colors.yellow.bgHover,
      colors.red.bgHover,
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
    backgroundHover: `rgb(${bgHoverR}, ${bgHoverG}, ${bgHoverB})`,
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
  basePrice: number,
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

  const infantFee =
    INFANT_SEAT_PRICE * infants * (tripType === "return" ? 2 : 1);

  // Add reserved seat fee when there are children
  // One reserved seat fee per flight when there are children, regardless of the number of children
  const reservedSeatFee =
    children > 0 ? RESERVED_SEAT_FEE * (isReturn ? 2 : 1) : 0;

  return basePrice + infantFee + reservedSeatFee;
}
