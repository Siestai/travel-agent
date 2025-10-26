# Travel Map Integration Guide

## Overview

The travel map integration allows users to visualize their parsed travel documents on an interactive Google Map with the ability to animate journeys and create Google Maps trips.

## Features

### 1. **Geocoding Service** (`lib/google/geocoding-service.ts`)

Converts addresses from parsed documents into latitude/longitude coordinates using the Google Maps Geocoding API.

#### Functions:

- `geocodeAddress(address: string)` - Geocode a single address
- `geocodeAddresses(addresses: string[])` - Batch geocode multiple addresses
- `reverseGeocode(lat: number, lng: number)` - Convert coordinates to address

### 2. **Parsed Data API** (`app/(chat)/api/travel/parsed-data/route.ts`)

Fetches and enriches parsed travel documents with location data.

#### Endpoint: `GET /api/travel/parsed-data`

Returns:

- `nodes`: Array of travel locations with coordinates
- `connections`: Array of travel connections between locations

#### Data Processing:

1. Fetches all parsed documents for the current user
2. Extracts locations from both housing and transportation documents
3. Automatically geocodes addresses to get coordinates
4. Creates connections between departure and arrival locations

### 3. **Enhanced Travel Map** (`components/travel-map.tsx`)

Interactive map component with advanced features.

#### Features:

- **Visual Markers**: Different icons for airports (✈️), stations (🚂), accommodations (🏨), and destinations (📍)
- **Route Lines**: Connects locations to show travel paths
- **Animation**: Animated route lines showing journey direction
- **Info Windows**: Click markers to see detailed location information including dates and times
- **Google Maps Integration**: Opens your trip in Google Maps with all waypoints

#### Controls:

- **Animate Journey**: Toggle animation on route lines to show travel direction
- **Open in Google Maps**: Opens your complete trip in Google Maps with turn-by-turn directions

### 4. **Maps Page** (`app/(chat)/maps/page.tsx`)

Main page that displays all travel locations on a map.

#### States:

- **Loading**: Shows while fetching travel data
- **Empty**: Shown when no parsed documents exist
- **Error**: Displays error messages if data fetching fails
- **Map View**: Interactive map with all locations and routes

## Usage Flow

### 1. Parse Documents

Users parse travel documents (PDFs) from Google Drive:

- Housing documents extract: property addresses, check-in/out dates
- Transportation documents extract: departure/arrival locations, dates and times

### 2. Automatic Geocoding

After parsing, the system automatically:

- Extracts addresses from parsed data
- Geocodes addresses to get coordinates
- Stores enriched data

### 3. View on Map

Users navigate to the Maps page to:

- See all their travel locations on a map
- View route lines connecting locations
- Get information about each location
- Animate the journey
- Open in Google Maps for navigation

## Google Maps API Setup

### Required API Key

The integration requires a Google Maps API key with the following APIs enabled:

1. **Maps JavaScript API** - For displaying the interactive map
2. **Geocoding API** - For converting addresses to coordinates

### Environment Variables

Add to `.env.local`:

```bash
GOOGLE_MAPS_API_KEY=your_api_key_here
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable required APIs:
   - Maps JavaScript API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key (recommended):
   - API restrictions: Select only "Maps JavaScript API" and "Geocoding API"
   - Application restrictions: Add your domain

## Data Structure

### TravelNode

```typescript
{
  id: string;
  name: string;
  type: "airport" | "station" | "accommodation" | "destination";
  coordinates?: { lat: number; lng: number };
  address?: string;
  checkIn?: string;
  checkOut?: string;
  documentId: string;
  documentTitle: string;
  departureTime?: string;
  arrivalTime?: string;
}
```

### TravelConnection

```typescript
{
  id: string;
  type: "flight" | "train" | "bus" | "ferry" | "car";
  from: string; // Node ID
  to: string; // Node ID
  departureTime?: string;
  arrivalTime?: string;
  carrier?: string;
  bookingReference?: string;
}
```

## Examples

### Housing Document Example

**Parsed Data:**

```json
{
  "propertyName": "Grand Hotel",
  "propertyAddress": "123 Main Street, Paris, France",
  "checkInDate": "2024-03-15",
  "checkOutDate": "2024-03-18"
}
```

**Result:**

- Creates one node with coordinates for the hotel
- Displays check-in/out dates in info window

### Transportation Document Example

**Parsed Data:**

```json
{
  "transportationType": "flight",
  "departureLocation": "New York JFK Airport",
  "arrivalLocation": "London Heathrow Airport",
  "departureDateTime": "2024-03-15T10:00:00",
  "arrivalDateTime": "2024-03-15T22:00:00",
  "carrierName": "British Airways",
  "confirmationNumber": "BA12345"
}
```

**Result:**

- Creates two nodes: departure and arrival airports
- Creates a connection showing the flight route
- Displays airline and booking reference in info windows

## Troubleshooting

### Map Not Displaying

**Check:**

1. API key is correctly set in environment variables
2. Maps JavaScript API is enabled
3. Browser console for any API errors

### Locations Not Showing

**Possible issues:**

1. No parsed documents yet - parse documents first
2. Addresses couldn't be geocoded - check address format in parsed data
3. API rate limits - too many geocoding requests

### Geocoding Fails

**Solutions:**

1. Verify addresses are in the parsed data
2. Check Google Maps Geocoding API quota
3. Ensure API key has Geocoding API enabled

## Future Enhancements

1. **Batch Geocoding**: Cache geocoded results to avoid repeated API calls
2. **Custom Icons**: Use custom marker icons based on travel type
3. **Street View**: Integration with Google Street View API
4. **Directions**: Calculate and display driving/walking directions
5. **Timeline View**: Show travel timeline alongside map
6. **Export Trip**: Export trip data to Google My Maps or other formats

## API Usage Notes

### Rate Limiting

The Google Maps Geocoding API has rate limits:

- Free tier: 40 requests/second
- The implementation includes throttling (100ms delay between requests)

### Caching

Consider implementing caching for geocoded addresses:

- Store geocoded results in database
- Reuse coordinates for duplicate addresses
- Periodically refresh stale geocoding data

### Cost Optimization

1. Only geocode addresses that don't have coordinates
2. Cache results to avoid repeated API calls
3. Use batch geocoding when possible
4. Monitor API usage in Google Cloud Console

## Testing

To test the integration:

1. Parse a travel document with a valid address
2. Navigate to the Maps page
3. Verify the location appears on the map
4. Click the marker to see details
5. Toggle animation to see route lines
6. Click "Open in Google Maps" to verify trip creation

## Support

For issues or questions:

- Check the Google Maps API documentation
- Review parsed data in the database
- Check browser console for errors
- Verify API key permissions and quotas
