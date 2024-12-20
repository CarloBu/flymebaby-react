# Flymebaby React

A fun flight search application built with Astro, React, TypeScript, and Tailwind CSS that helps users and me find the best Ryanair flight deals.
Built with frustration of current flight search providers that don't give the best flight deals. This is a part 1 of two part project.

For now, the flights are taken from the Ryanair publicAPI, because I want to run this app at minimal cost, but in the future, maybe I will expand the backend to include other airlines.

## Features
- A fun colorful reimagined User Experience/UI for searching and viewing best flight deals
- Real-time flight search with Server-Sent Events (SSE)
- Smart weekend flight detection
- Flexible search options (one-way, return, weekend, long weekend)
- Multi-airport and multi-country selection
- Price-based color coding for visual feedback
- Hierarchical results organization (by country and city)
- Dark/light theme support
- Form state persistence
- Responsive design
- Accessibility features

## Architecture

### Frontend (Astro + React)

The application is built using Astro as the meta-framework with React components for interactive features. Key components include:

#### FlightSearch Component
- Main form component handling search parameters
- Manages search state and form validation
- Establishes SSE connection with backend
- Handles real-time flight updates
- Persists search preferences in localStorage

#### FlightResults Component
- Organizes flights hierarchically (Country → City → Flight)
- Provides collapsible sections for better navigation
- Implements smooth scrolling and highlighting
- Shows both compact and detailed flight views
- Color codes prices for visual feedback

#### Modal Components
- BaseModal: Trip type selection
- NumberModal: Passenger count and duration
- BubbleModal: Additional passenger types
- PriceModal: Budget selection
- DatePicker: Date range selection
- MultiCombobox: Airport and country selection

### API Integration

The frontend communicates with a custom Python backend endpoint:

### Backend (Python Flask)

The backend is built with Flask and provides a real-time flight search API using Server-Sent Events (SSE). The backend repository is available at [flymebaby-python](https://github.com/CarloBu/flymebaby-python).

#### Key Features

- Real-time flight data streaming using SSE
- Smart weekend flight detection and validation
- Price per passenger calculation
- Flight deduplication
- Rate limiting
- CORS support
- Comprehensive error handling and logging

#### API Endpoint

The main endpoint `/api/search-flights` accepts the following parameters:

- `tripType`: "oneWay" | "return" | "weekend" | "longWeekend"
- `startDate`: Departure date (YYYY-MM-DD)
- `endDate`: Return date for return trips (YYYY-MM-DD)
- `maxPrice`: Maximum total budget
- `minDays`/`maxDays`: Trip duration range (for return trips)
- `originAirports`: Comma-separated airport codes
- `wantedCountries`: Comma-separated country names
- `adults`: Number of adult passengers
- `children`: Number of child passengers
- `infants`: Number of infant passengers
- `teens`: Number of teen passengers

#### Response Format

The API streams flight results in real-time using Server-Sent Events (SSE). Each event contains:

- Flight details (outbound and inbound)
- Airport codes and full names
- Departure times
- Total price for all passengers

## Development

1. Install dependencies:

npm install

2. Run the development server:

npm run dev
