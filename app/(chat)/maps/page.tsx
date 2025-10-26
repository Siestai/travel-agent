"use client";

import { TravelMap } from "@/components/travel-map";
import { mockTravelDocuments } from "@/lib/mock-data/travel-documents";

export default function MapsPage() {
  // TODO: Replace with actual data fetch when database is integrated
  // const { documents, isLoading } = useTravelDocuments();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="font-semibold text-2xl">Travel Map</h1>
        <p className="text-muted-foreground text-sm">
          View all your travel locations on an interactive map
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        {mockTravelDocuments.length === 0 ? (
          <div className="flex h-full items-center justify-center bg-muted">
            <div className="text-center">
              <p className="font-medium text-lg">No locations to display</p>
              <p className="text-muted-foreground text-sm">
                Upload travel documents to see them on the map
              </p>
            </div>
          </div>
        ) : (
          <TravelMap documents={mockTravelDocuments} />
        )}
      </div>
    </div>
  );
}
