"use client";

import {
  GoogleMap,
  InfoWindow,
  LoadScript,
  Marker,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import type { TravelDocument } from "@/lib/types/travel";

type TravelMapProps = {
  documents: TravelDocument[];
};

type MapMarker = {
  id: string;
  name: string;
  type: string;
  coordinates: { lat: number; lng: number };
  documentId: string;
  documentTitle: string;
  checkIn?: string;
  checkOut?: string;
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

export function TravelMap({ documents }: TravelMapProps) {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 41.2753, lng: 28.7519 });

  useEffect(() => {
    // Extract all markers from documents
    const allMarkers: MapMarker[] = [];

    for (const doc of documents) {
      for (const node of doc.parsedData.nodes) {
        if (node.coordinates) {
          allMarkers.push({
            id: node.id,
            name: node.name,
            type: node.type,
            coordinates: node.coordinates,
            documentId: doc.id,
            documentTitle: doc.title,
            checkIn: node.checkIn,
            checkOut: node.checkOut,
          });
        }
      }
    }

    setMarkers(allMarkers);

    // Calculate center from all markers
    if (allMarkers.length > 0) {
      const avgLat =
        allMarkers.reduce((sum, m) => sum + m.coordinates.lat, 0) /
        allMarkers.length;
      const avgLng =
        allMarkers.reduce((sum, m) => sum + m.coordinates.lng, 0) /
        allMarkers.length;
      setMapCenter({ lat: avgLat, lng: avgLng });
    }
  }, [documents]);

  return (
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
        {markers.map((marker) => (
          <Marker
            key={marker.id}
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
              <h3 className="font-semibold">{selectedMarker.name}</h3>
              <p className="text-muted-foreground text-sm">
                {selectedMarker.documentTitle}
              </p>
              {selectedMarker.checkIn && selectedMarker.checkOut && (
                <p className="text-muted-foreground text-xs">
                  {new Date(selectedMarker.checkIn).toLocaleDateString()} -{" "}
                  {new Date(selectedMarker.checkOut).toLocaleDateString()}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
