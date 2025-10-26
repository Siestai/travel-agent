"use client";

import {
  GoogleMap,
  InfoWindow,
  LoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TravelConnection } from "@/lib/types/travel";

// Declare google.maps for TypeScript
declare const google: typeof import("@types/google.maps");

type TravelNode = {
  id: string;
  name: string;
  type: string;
  coordinates?: { lat: number; lng: number };
  address?: string;
  checkIn?: string;
  checkOut?: string;
  documentId: string;
  documentTitle: string;
  departureTime?: string;
  arrivalTime?: string;
};

type TravelMapProps = {
  nodes: TravelNode[];
  connections: TravelConnection[];
};

type MapMarker = TravelNode & {
  coordinates: { lat: number; lng: number };
};

type RouteLine = {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  connection: TravelConnection;
};

const mapContainerStyle = {
  height: "100%",
  width: "100%",
};

const mapOptions = {
  fullscreenControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  zoomControl: true,
};

const getMarkerIcon = (type: string): string | undefined => {
  const iconMap: Record<string, string> = {
    airport: "✈️",
    station: "🚂",
    accommodation: "🏨",
    destination: "📍",
  };
  return iconMap[type] || "📍";
};

export function TravelMap({ nodes, connections }: TravelMapProps) {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [routeLines, setRouteLines] = useState<RouteLine[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 41.2753, lng: 28.7519 });
  const [showAnimation, setShowAnimation] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
      },
      (error) => {
        console.error("Error getting user location:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    // Filter nodes with coordinates
    const validMarkers = nodes.filter(
      (node): node is MapMarker => node.coordinates !== undefined
    );

    setMarkers(validMarkers);

    // Create route lines from connections
    const lines: RouteLine[] = [];
    for (const connection of connections) {
      const fromNode = nodes.find((n) => n.id === connection.from);
      const toNode = nodes.find((n) => n.id === connection.to);

      if (
        fromNode?.coordinates &&
        toNode?.coordinates &&
        fromNode.coordinates !== undefined &&
        toNode.coordinates !== undefined
      ) {
        lines.push({
          from: fromNode.coordinates,
          to: toNode.coordinates,
          connection,
        });
      }
    }
    setRouteLines(lines);

    // Calculate center from all markers
    if (validMarkers.length > 0) {
      const avgLat =
        validMarkers.reduce((sum, m) => sum + m.coordinates.lat, 0) /
        validMarkers.length;
      const avgLng =
        validMarkers.reduce((sum, m) => sum + m.coordinates.lng, 0) /
        validMarkers.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  }, [nodes, connections]);

  // Generate Google Maps URL for trip
  const createGoogleMapsTripUrl = (): string => {
    // Create waypoint URLs
    const waypoints = markers
      .filter((m) => m.coordinates)
      .map((m) => `${m.coordinates.lat},${m.coordinates.lng}`)
      .join("/");

    // Google Maps My Maps trip URL format
    const baseUrl = "https://www.google.com/maps/dir/";
    return `${baseUrl}${waypoints}`;
  };

  const handleOpenInGoogleMaps = () => {
    const url = createGoogleMapsTripUrl();
    window.open(url, "_blank");
  };

  const handleCenterOnUser = () => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  };

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          onClick={() => setShowAnimation(!showAnimation)}
          size="sm"
          variant="outline"
        >
          {showAnimation ? "Stop Animation" : "Animate Journey"}
        </Button>
        {userLocation && (
          <Button
            onClick={handleCenterOnUser}
            size="sm"
            title="Center on your location"
            variant="outline"
          >
            📍 My Location
          </Button>
        )}
        <Button onClick={handleOpenInGoogleMaps} size="sm" variant="default">
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in Google Maps
        </Button>
      </div>

      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
        loadingElement={<div className="h-full w-full" />}
      >
        <GoogleMap
          center={mapCenter}
          mapContainerStyle={mapContainerStyle}
          options={mapOptions}
          zoom={markers.length > 1 ? 4 : 10}
        >
          {/* Render route lines */}
          {routeLines.map((line) => (
            <Polyline
              key={line.connection.id}
              options={{
                strokeColor: "#3b82f6",
                strokeWeight: 3,
                strokeOpacity: 0.6,
                icons: showAnimation
                  ? [
                      {
                        icon: {
                          path: "M 0,-1 0,1",
                          strokeColor: "#3b82f6",
                          strokeWeight: 2,
                          scale: 2,
                        },
                        offset: "0",
                        repeat: "20px",
                      },
                    ]
                  : undefined,
              }}
              path={[line.from, line.to]}
            />
          ))}

          {/* Render user location marker */}
          {userLocation && (
            <Marker
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                  `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="8" fill="#4285F4" stroke="#ffffff" stroke-width="3"/>
                    <circle cx="16" cy="16" r="3" fill="#ffffff"/>
                  </svg>`
                )}`,
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16),
              }}
              key="user-location"
              onClick={() => {
                alert("This is your current location");
              }}
              position={userLocation}
            />
          )}

          {/* Render travel markers */}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              label={getMarkerIcon(marker.type)}
              onClick={() => setSelectedMarker(marker)}
              position={marker.coordinates}
            />
          ))}

          {selectedMarker && (
            <InfoWindow
              onCloseClick={() => setSelectedMarker(null)}
              position={selectedMarker.coordinates}
            >
              <div className="p-2">
                <h3 className="font-semibold text-gray-900">
                  {selectedMarker.name}
                </h3>
                <p className="text-gray-700 text-sm">
                  {selectedMarker.documentTitle}
                </p>
                {selectedMarker.checkIn && selectedMarker.checkOut && (
                  <p className="text-gray-600 text-xs">
                    {new Date(selectedMarker.checkIn).toLocaleDateString()} -{" "}
                    {new Date(selectedMarker.checkOut).toLocaleDateString()}
                  </p>
                )}
                {selectedMarker.departureTime && (
                  <p className="text-gray-600 text-xs">
                    Departure:{" "}
                    {new Date(selectedMarker.departureTime).toLocaleString()}
                  </p>
                )}
                {selectedMarker.arrivalTime && (
                  <p className="text-gray-600 text-xs">
                    Arrival:{" "}
                    {new Date(selectedMarker.arrivalTime).toLocaleString()}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
