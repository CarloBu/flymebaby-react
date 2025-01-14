import type { Flight } from "@/types/flight";

// Compress flight data into a shorter format
export function compressFlightData(
  flight: Flight,
  adults: number,
  teens: number = 0,
  children: number = 0,
  infants: number = 0,
  priceRange?: { min: number; max: number },
): string {
  console.log(
    "Starting flight data compression with full flight object:",
    JSON.stringify(flight, null, 2),
  );
  console.log("Passengers:", { adults, teens, children, infants });

  const out = flight.outbound;
  const inn = flight.inbound;

  // Format: o|d|dc|dt|at|fn|p|fd_i|d|dc|dt|at|fn|p|fd|a|t|c|i|min|max
  // where o=origin, d=destination, dc=destination country, dt=departure time, at=arrival time, fn=flight number, p=price, fd=flight duration
  // a=adults, t=teens, c=children, i=infants, min=min price, max=max price
  const data = [
    out.origin,
    out.destination,
    out.destinationCountry,
    out.departureTime,
    out.arrivalTime,
    out.flightNumber.split(" ")[1], // Remove "FR" prefix
    out.price,
    out.flightDuration,
    inn.origin,
    inn.destination,
    inn.destinationCountry,
    inn.departureTime,
    inn.arrivalTime,
    inn.flightNumber.split(" ")[1],
    inn.price,
    inn.flightDuration,
    adults,
    teens,
    children,
    infants,
    priceRange?.min || "",
    priceRange?.max || "",
  ].join("|");

  const compressed = btoa(data).replace(/=+$/, "");
  console.log("Compression details:", {
    originalData: data,
    dataFields: data.split("|"),
    originalLength: data.length,
    compressedLength: compressed.length,
    compressed,
  });
  return compressed;
}

// Decompress flight data from URL
export function decompressFlightData(compressed: string): {
  flight: Flight;
  adults: number;
  teens: number;
  children: number;
  infants: number;
  priceRange?: { min: number; max: number };
} {
  try {
    const data = atob(compressed);
    const [
      outOrigin,
      outDest,
      outDestCountry,
      outDepTime,
      outArrTime,
      outFlightNum,
      outPrice,
      outFlightDuration,
      inOrigin,
      inDest,
      inDestCountry,
      inDepTime,
      inArrTime,
      inFlightNum,
      inPrice,
      inFlightDuration,
      adults,
      teens,
      children,
      infants,
      minPrice,
      maxPrice,
    ] = data.split("|");

    const flight: Flight = {
      outbound: {
        origin: outOrigin,
        destination: outDest,
        destinationCountry: outDestCountry || "Unknown",
        departureTime: outDepTime,
        arrivalTime: outArrTime,
        flightNumber: `FR ${outFlightNum}`,
        price: parseFloat(outPrice),
        currency: "EUR",
        originFull: "",
        destinationFull: "",
        flightDuration: parseInt(outFlightDuration),
      },
      inbound: {
        origin: inOrigin,
        destination: inDest,
        destinationCountry: inDestCountry || "Unknown",
        departureTime: inDepTime,
        arrivalTime: inArrTime,
        flightNumber: `FR ${inFlightNum}`,
        price: parseFloat(inPrice),
        currency: "EUR",
        originFull: "",
        destinationFull: "",
        flightDuration: parseInt(inFlightDuration),
      },
      totalPrice: parseFloat(outPrice) + parseFloat(inPrice),
    };

    console.log(
      "Reconstructed flight object:",
      JSON.stringify(flight, null, 2),
    );

    const result: {
      flight: Flight;
      adults: number;
      teens: number;
      children: number;
      infants: number;
      priceRange?: { min: number; max: number };
    } = {
      flight,
      adults: parseInt(adults),
      teens: parseInt(teens),
      children: parseInt(children),
      infants: parseInt(infants),
    };

    // Add price range if available
    if (minPrice && maxPrice) {
      result.priceRange = {
        min: parseFloat(minPrice),
        max: parseFloat(maxPrice),
      };
    }

    return result;
  } catch (error) {
    console.error("Decompression error details:", {
      error,
      compressed,
      decodedAttempt: (() => {
        try {
          return atob(compressed);
        } catch (e) {
          return "Failed to decode base64";
        }
      })(),
    });
    if (error instanceof Error) {
      throw new Error(`Failed to decompress flight data: ${error.message}`);
    } else {
      throw new Error("Failed to decompress flight data: Unknown error");
    }
  }
}

// Generate shareable URL
export function generateShareableUrl(
  flight: Flight,
  adults: number,
  teens: number = 0,
  children: number = 0,
  infants: number = 0,
  priceRange?: { min: number; max: number },
): string {
  console.log("Generating shareable URL");
  console.log("Input flight:", JSON.stringify(flight, null, 2));
  console.log("Passengers:", { adults, teens, children, infants });
  console.log("Price range:", priceRange);

  const compressed = compressFlightData(
    flight,
    adults,
    teens,
    children,
    infants,
    priceRange,
  );
  const url = `http://gimme.flights/ticket?f=${compressed}`;
  console.log("Generated URL:", url);
  return url;
}
