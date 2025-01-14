export const generateImageFilename = (
  name: string,
  country: string,
): string => {
  // Convert to lowercase and replace spaces with hyphens
  const processedName = name.toLowerCase().replace(/\s+/g, "-");
  const processedCountry = country.toLowerCase().replace(/\s+/g, "-");

  // Remove special characters (keeping only letters, numbers, and hyphens)
  const cleanName = processedName.replace(/[^a-z0-9-]/g, "");
  const cleanCountry = processedCountry.replace(/[^a-z0-9-]/g, "");

  // Combine name and country with underscore
  return `${cleanName}_${cleanCountry}`;
};

// Function to add image filenames to all airports
export const addImageFilenamesToAirports = (airports: any[]) => {
  return airports.map((airport) => ({
    ...airport,
    imageFilename: generateImageFilename(airport.name, airport.country),
  }));
};
