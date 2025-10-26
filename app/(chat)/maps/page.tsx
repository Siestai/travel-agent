export default function MapsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="font-semibold text-2xl">Travel Map</h1>
        <p className="text-muted-foreground text-sm">
          View all your travel locations on an interactive map
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* TODO: Implement Google Maps */}
        <div className="flex h-full items-center justify-center bg-muted">
          <div className="text-center">
            <p className="font-medium text-lg">Map View</p>
            <p className="text-muted-foreground text-sm">
              Google Maps integration coming soon
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
