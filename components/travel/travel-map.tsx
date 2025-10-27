"use client";

import {
  GoogleMap,
  InfoWindow,
  LoadScript,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { TravelConnection } from "@/lib/types/travel";

// Google Maps types will be available at runtime when LoadScript loads the API

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
  const [selectedConnection, setSelectedConnection] =
    useState<RouteLine | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 41.2753, lng: 28.7519 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const animationSpeed = 2000; // milliseconds per step
  const [visibleLines, setVisibleLines] = useState<Set<string>>(new Set());
  const [visibleMarkers, setVisibleMarkers] = useState<Set<string>>(new Set());
  const animationRef = useRef<NodeJS.Timeout | null>(null);
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

    // If not animating, show all lines and markers
    if (!isAnimating) {
      setVisibleLines(new Set(lines.map((line) => line.connection.id)));
      setVisibleMarkers(new Set(validMarkers.map((m) => m.id)));
    }

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
  }, [nodes, connections, isAnimating]);

  // Build journey steps for animation
  const journeySteps = useMemo(() => {
    if (markers.length === 0 || routeLines.length === 0) {
      return [];
    }

    // Create a map of nodes
    const nodeMap = new Map(markers.map((m) => [m.id, m]));

    // Find the starting point (node with no incoming connections or first node)
    const hasIncoming = new Set(routeLines.map((line) => line.connection.to));
    const startNode = markers.find((m) => !hasIncoming.has(m.id)) || markers[0];

    const steps: Array<{
      visibleMarkers: string[];
      visibleLines: string[];
      center: { lat: number; lng: number };
      zoom?: number;
    }> = [];

    // Follow the journey step by step
    let currentNode = startNode;
    const visited = new Set<string>();
    const completedLines = new Set<string>();

    // First step: show starting point
    steps.push({
      visibleMarkers: [startNode.id],
      visibleLines: [],
      center: startNode.coordinates,
      zoom: 10,
    });

    visited.add(startNode.id);

    // Iteratively find and add next connections
    while (true) {
      const nextLine = routeLines.find(
        (line) =>
          line.connection.from === currentNode.id &&
          !completedLines.has(line.connection.id)
      );

      if (!nextLine) {
        break;
      }

      const toNode = nodeMap.get(nextLine.connection.to);
      if (!toNode) {
        break;
      }

      completedLines.add(nextLine.connection.id);

      // Add step for this connection
      visited.add(toNode.id);
      steps.push({
        visibleMarkers: Array.from(visited),
        visibleLines: Array.from(completedLines),
        center: toNode.coordinates,
        zoom: 8,
      });

      currentNode = toNode;
    }

    return steps;
  }, [markers, routeLines]);

  // Handle animation
  useEffect(() => {
    if (isAnimating && journeySteps.length > 0) {
      if (currentStep >= journeySteps.length) {
        // Animation complete
        setIsAnimating(false);
        setCurrentStep(0);
        // Show all at the end
        setVisibleLines(new Set(routeLines.map((line) => line.connection.id)));
        setVisibleMarkers(new Set(markers.map((m) => m.id)));
      }
      if (currentStep < journeySteps.length) {
        const step = journeySteps[currentStep];
        setVisibleLines(new Set(step.visibleLines));
        setVisibleMarkers(new Set(step.visibleMarkers));
        setMapCenter(step.center);

        // Move to next step after delay
        animationRef.current = setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
        }, animationSpeed);
      }
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isAnimating, currentStep, journeySteps, markers, routeLines]);

  const handleStartAnimation = () => {
    setIsAnimating(true);
    setCurrentStep(0);
  };

  const handleStopAnimation = () => {
    setIsAnimating(false);
    setCurrentStep(0);
    setVisibleLines(new Set(routeLines.map((line) => line.connection.id)));
    setVisibleMarkers(new Set(markers.map((m) => m.id)));
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  };

  // Close modal when clicking on the map
  const handleMapClick = () => {
    setSelectedMarker(null);
    setSelectedConnection(null);
  };

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
        {isAnimating && (
          <Button onClick={handleStopAnimation} size="sm" variant="destructive">
            Stop Animation ({currentStep}/{journeySteps.length})
          </Button>
        )}
        {!isAnimating && (
          <Button
            disabled={journeySteps.length === 0}
            onClick={handleStartAnimation}
            size="sm"
            variant="outline"
          >
            🎬 Animate Journey
          </Button>
        )}
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
          onClick={handleMapClick}
          options={mapOptions}
          zoom={markers.length > 1 ? 4 : 10}
        >
          {/* Render route lines */}
          {routeLines.map(
            (line) =>
              visibleLines.has(line.connection.id) && (
                <Polyline
                  key={line.connection.id}
                  onClick={() => {
                    setSelectedConnection(line);
                    setSelectedMarker(null);
                  }}
                  options={{
                    strokeColor:
                      isAnimating && visibleLines.has(line.connection.id)
                        ? "#10b981"
                        : "#3b82f6",
                    strokeWeight:
                      isAnimating && visibleLines.has(line.connection.id)
                        ? 4
                        : 3,
                    strokeOpacity: 0.7,
                    icons: [
                      {
                        icon: {
                          path: "M 0,-2 0,2 M -1.5,0.5 0,-2 1.5,0.5",
                          strokeColor:
                            isAnimating && visibleLines.has(line.connection.id)
                              ? "#10b981"
                              : "#3b82f6",
                          strokeWeight: 3,
                          scale: 5,
                        },
                        offset: "100",
                        repeat: "30px",
                      },
                    ],
                  }}
                  path={[line.from, line.to]}
                />
              )
          )}

          {/* Render user location marker */}
          {userLocation && (
            // @ts-expect-error - Google Maps API requires specific types
            <Marker
              icon={{
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                  `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="8" fill="#4285F4" stroke="#ffffff" stroke-width="3"/>
                    <circle cx="16" cy="16" r="3" fill="#ffffff"/>
                  </svg>`
                )}`,
                scaledSize: { width: 32, height: 32 },
                anchor: { x: 16, y: 16 },
              }}
              key="user-location"
              onClick={() => {
                alert("This is your current location");
              }}
              position={userLocation}
            />
          )}

          {/* Render travel markers */}
          {markers.map(
            (marker) =>
              visibleMarkers.has(marker.id) && (
                <Marker
                  key={marker.id}
                  label={getMarkerIcon(marker.type)}
                  onClick={() => setSelectedMarker(marker)}
                  position={marker.coordinates}
                />
              )
          )}

          {/* Connection info modal */}
          {selectedConnection && (
            <InfoWindow
              onCloseClick={() => setSelectedConnection(null)}
              position={{
                lat:
                  (selectedConnection.from.lat + selectedConnection.to.lat) / 2,
                lng:
                  (selectedConnection.from.lng + selectedConnection.to.lng) / 2,
              }}
            >
              <div className="p-2">
                <h3 className="font-semibold text-gray-900">
                  {selectedConnection.connection.type.toUpperCase()} Connection
                </h3>
                {selectedConnection.connection.departureTime && (
                  <p className="text-gray-700 text-xs">
                    <span className="font-semibold">Departure:</span> {(() => {
                      const date = new Date(
                        selectedConnection.connection.departureTime
                      );
                      return Number.isNaN(date.getTime())
                        ? selectedConnection.connection.departureTime
                        : date.toLocaleString();
                    })()}
                  </p>
                )}
                {selectedConnection.connection.arrivalTime && (
                  <p className="text-gray-700 text-xs">
                    <span className="font-semibold">Arrival:</span> {(() => {
                      const date = new Date(
                        selectedConnection.connection.arrivalTime
                      );
                      return Number.isNaN(date.getTime())
                        ? selectedConnection.connection.arrivalTime
                        : date.toLocaleString();
                    })()}
                  </p>
                )}
                {selectedConnection.connection.carrier && (
                  <p className="text-gray-700 text-xs">
                    <span className="font-semibold">Carrier:</span>{" "}
                    {selectedConnection.connection.carrier}
                  </p>
                )}
                {selectedConnection.connection.bookingReference && (
                  <p className="text-gray-700 text-xs">
                    <span className="font-semibold">Booking:</span>{" "}
                    {selectedConnection.connection.bookingReference}
                  </p>
                )}
              </div>
            </InfoWindow>
          )}

          {/* Location info modal */}
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
                <div className="mt-2 space-y-1">
                  {selectedMarker.address && (
                    <p className="text-gray-700 text-xs">
                      <span className="font-semibold">Address:</span>{" "}
                      {selectedMarker.address}
                    </p>
                  )}
                  {selectedMarker.checkIn && selectedMarker.checkOut && (
                    <>
                      <p className="text-gray-700 text-xs">
                        <span className="font-semibold">Check-in:</span>{" "}
                        {(() => {
                          const date = new Date(selectedMarker.checkIn);
                          return Number.isNaN(date.getTime())
                            ? selectedMarker.checkIn
                            : date.toLocaleString();
                        })()}
                      </p>
                      <p className="text-gray-700 text-xs">
                        <span className="font-semibold">Check-out:</span>{" "}
                        {(() => {
                          const date = new Date(selectedMarker.checkOut);
                          return Number.isNaN(date.getTime())
                            ? selectedMarker.checkOut
                            : date.toLocaleString();
                        })()}
                      </p>
                      <p className="text-gray-600 text-xs">
                        Duration: {(() => {
                          const checkInDate = new Date(selectedMarker.checkIn);
                          const checkOutDate = new Date(
                            selectedMarker.checkOut
                          );
                          const isValid =
                            !Number.isNaN(checkInDate.getTime()) &&
                            !Number.isNaN(checkOutDate.getTime());
                          return isValid
                            ? Math.ceil(
                                (checkOutDate.getTime() -
                                  checkInDate.getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : "N/A";
                        })()} nights
                      </p>
                    </>
                  )}
                  {selectedMarker.departureTime && (
                    <p className="text-gray-700 text-xs">
                      <span className="font-semibold">Departure:</span>{" "}
                      {(() => {
                        const date = new Date(selectedMarker.departureTime);
                        return Number.isNaN(date.getTime())
                          ? selectedMarker.departureTime
                          : date.toLocaleString();
                      })()}
                    </p>
                  )}
                  {selectedMarker.arrivalTime && (
                    <p className="text-gray-700 text-xs">
                      <span className="font-semibold">Arrival:</span> {(() => {
                        const date = new Date(selectedMarker.arrivalTime);
                        return Number.isNaN(date.getTime())
                          ? selectedMarker.arrivalTime
                          : date.toLocaleString();
                      })()}
                    </p>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
