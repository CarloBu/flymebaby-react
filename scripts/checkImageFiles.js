import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the airports.json file
const airportsPath = path.join(__dirname, "../src/data/airports.json");
const airportsData = JSON.parse(fs.readFileSync(airportsPath, "utf8"));

// Path to images directory
const imagesDir = path.join(__dirname, "../public/city-postcards-webp");

// Get all files in the images directory
const existingImages = fs.readdirSync(imagesDir);

// Track missing and existing images
const missingImages = [];
const existingCount = 0;

// Check each airport's image
airportsData.airports.forEach((airport) => {
  const expectedFilename = `${airport.imageFilename}.webp`;
  if (!existingImages.includes(expectedFilename)) {
    missingImages.push({
      code: airport.code,
      name: airport.name,
      filename: expectedFilename,
    });
  }
});

// Print results
console.log("\nImage Check Results:");
console.log("-------------------");
console.log(`Total airports: ${airportsData.airports.length}`);
console.log(
  `Found images: ${airportsData.airports.length - missingImages.length}`,
);
console.log(`Missing images: ${missingImages.length}`);

if (missingImages.length > 0) {
  console.log("\nMissing Images:");
  console.log("---------------");
  missingImages.forEach((missing) => {
    console.log(`${missing.code} - ${missing.name} (${missing.filename})`);
  });
}
