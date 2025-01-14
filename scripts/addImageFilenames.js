import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the airports.json file
const airportsPath = path.join(__dirname, "../src/data/airports.json");
const airportsData = JSON.parse(fs.readFileSync(airportsPath, "utf8"));

// Function to generate image filename
const generateImageFilename = (name, country) => {
  // Convert to lowercase and replace spaces with hyphens
  const processedName = name.toLowerCase().replace(/\s+/g, "-");
  const processedCountry = country.toLowerCase().replace(/\s+/g, "-");

  // Remove special characters (keeping only letters, numbers, and hyphens)
  const cleanName = processedName.replace(/[^a-z0-9-]/g, "");
  const cleanCountry = processedCountry.replace(/[^a-z0-9-]/g, "");

  // Combine name and country with underscore
  return `${cleanName}_${cleanCountry}`;
};

// Add image filenames to each airport
const updatedAirports = airportsData.airports.map((airport) => ({
  ...airport,
  imageFilename: generateImageFilename(airport.name, airport.country),
}));

// Create the new data structure
const newData = {
  airports: updatedAirports,
};

// Write back to the file with pretty formatting
fs.writeFileSync(airportsPath, JSON.stringify(newData, null, 2), "utf8");

console.log("Successfully added image filenames to airports.json");
