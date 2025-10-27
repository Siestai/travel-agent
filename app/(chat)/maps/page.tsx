"use client";

import { useEffect, useState } from "react";
import { TravelMap } from "@/components/travel/travel-map";
import type { TravelConnection } from "@/lib/types/travel";

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

export default function MapsPage() {
  const [nodes, setNodes] = useState<TravelNode[]>([]);
  const [connections, setConnections] = useState<TravelConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTravelData() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/travel/parsed-data");

        if (!response.ok) {
          throw new Error("Failed to fetch travel data");
        }

        const data = await response.json();
        setNodes(data.nodes || []);
        setConnections(data.connections || []);
      } catch (err) {
        console.error("Error fetching travel data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load travel data"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchTravelData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Loading your travel locations...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="font-medium text-destructive text-lg">Error</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="font-semibold text-2xl">Travel Map</h1>
        <p className="text-muted-foreground text-sm">
          View all your travel locations on an interactive map
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        {nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center bg-muted">
            <div className="text-center">
              <p className="font-medium text-lg">No locations to display</p>
              <p className="text-muted-foreground text-sm">
                Parse travel documents to see them on the map
              </p>
            </div>
          </div>
        ) : (
          <TravelMap connections={connections} nodes={nodes} />
        )}
      </div>
    </div>
  );
}
