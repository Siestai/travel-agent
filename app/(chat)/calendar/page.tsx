"use client";

import { useEffect, useState } from "react";
import { TravelCalendar } from "@/components/travel-calendar";

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
  driveFileId: string;
  departureTime?: string;
  arrivalTime?: string;
};

export default function CalendarPage() {
  const [nodes, setNodes] = useState<TravelNode[]>([]);
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
          <div className="mb-4 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
          </div>
          <p className="text-muted-foreground">Loading calendar...</p>
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
        <h1 className="font-semibold text-2xl">Travel Calendar</h1>
        <p className="text-muted-foreground text-sm">
          View your travel events in calendar format
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        {nodes.length === 0 ? (
          <div className="flex h-full items-center justify-center bg-muted">
            <div className="text-center">
              <p className="mb-2 text-5xl">📅</p>
              <p className="font-medium text-lg">
                No calendar events to display
              </p>
              <p className="text-muted-foreground text-sm">
                Parse travel documents to see them on the calendar
              </p>
            </div>
          </div>
        ) : (
          <TravelCalendar nodes={nodes} />
        )}
      </div>
    </div>
  );
}
