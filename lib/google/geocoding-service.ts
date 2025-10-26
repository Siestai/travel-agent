/**
 * Google Maps Geocoding Service
 * Converts addresses to latitude/longitude coordinates
 */

type GeocodeResult = {
  lat: number;
  lng: number;
  address: string;
  formattedAddress?: string;
};

/**
 * Geocode a single address to coordinates
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult | null> {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key is not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`
    );

    if (!response.ok) {
      console.error(`Geocoding API returned status ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      const result = data.results[0];
      const location = result.geometry.location;

      return {
        lat: location.lat,
        lng: location.lng,
        address: result.formatted_address,
        formattedAddress: result.formatted_address,
      };
    }

    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}

/**
 * Batch geocode multiple addresses
 */
export async function geocodeAddresses(
  addresses: string[]
): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>();

  // Process in parallel with a small delay to avoid rate limits
  const geocodePromises = addresses.map(async (address, index) => {
    // Small delay to avoid overwhelming the API
    await new Promise((resolve) => setTimeout(resolve, index * 100));

    const result = await geocodeAddress(address);
    if (result) {
      results.set(address, result);
    }
  });

  await Promise.all(geocodePromises);

  return results;
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key is not configured");
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    return null;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
}
