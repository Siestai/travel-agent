import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <SettingsIcon className="h-6 w-6" />
          <div>
            <h1 className="font-semibold text-2xl">Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage your preferences and integrations
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 font-semibold text-lg">
              Google Drive Integration
            </h2>
            <p className="mb-4 text-muted-foreground text-sm">
              Connect your Google Drive to import travel documents automatically
            </p>
            <button
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm"
              type="button"
            >
              Connect Google Drive
            </button>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="mb-4 font-semibold text-lg">Google Maps API Key</h2>
            <p className="mb-4 text-muted-foreground text-sm">
              Enter your Google Maps API key to enable map features
            </p>
            <div className="space-y-2">
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Enter API key"
                type="password"
              />
              <button
                className="text-primary text-sm hover:underline"
                type="button"
              >
                Get API Key
              </button>
            </div>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="mb-4 font-semibold text-lg">Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email notifications</span>
                <input type="checkbox" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Auto-parse documents</span>
                <input type="checkbox" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
