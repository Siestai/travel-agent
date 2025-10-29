"use client";

import { Link2, Plus, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CreateTravelModal } from "@/components/create-travel-modal";
import { DriveConnectionStatus } from "@/components/drive/drive-connection-status";
import { DriveFileList } from "@/components/drive/drive-file-list";
import { DriveFileUpload } from "@/components/drive/drive-file-upload";
import { Loader } from "@/components/elements/loader";
import { TravelSelector } from "@/components/travel/travel-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ConnectionStatus = "connected" | "disconnected" | "loading";
type GoogleAccount = {
  connected: boolean;
  email?: string;
  createdAt?: string;
};

export function DriveDashboard() {
  const searchParams = useSearchParams();
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("loading");
  const [account, setAccount] = useState<GoogleAccount | null>(null);
  const [files, setFiles] = useState<unknown[]>([]);
  const [travels, setTravels] = useState<unknown[]>([]);
  const [activeTravel, setActiveTravel] = useState<unknown | null>(null);
  const [isCreateTravelModalOpen, setIsCreateTravelModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isLoadingTravels, setIsLoadingTravels] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const loadFiles = useCallback(async () => {
    try {
      setIsLoadingFiles(true);
      const response = await fetch("/api/drive/files");
      const data = await response.json();
      setFiles(data.files || []);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  const loadTravels = useCallback(async () => {
    try {
      setIsLoadingTravels(true);
      const response = await fetch("/api/travel");
      const data = await response.json();
      setTravels(data.travels || []);
      if (data.travels && data.travels.length > 0) {
        const active =
          data.travels.find((t: { isActive: boolean }) => t.isActive) ||
          data.travels[0];
        setActiveTravel(active);
        if (active.driveFolderId) {
          await loadFiles();
        }
      }
    } catch (error) {
      console.error("Error loading travels:", error);
    } finally {
      setIsLoadingTravels(false);
    }
  }, [loadFiles]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/google/status");
        const data = await response.json();

        // Check for email from URL params (OAuth callback)
        const emailFromUrl = searchParams.get("email");
        if (emailFromUrl && data.connected) {
          setAccount({ ...data, email: emailFromUrl });
        } else {
          setAccount(data);
        }

        setConnectionStatus(data.connected ? "connected" : "disconnected");
        if (data.connected) {
          await loadFiles();
        }
      } catch (error) {
        console.error("Error checking connection:", error);
        setConnectionStatus("disconnected");
      }
    };

    const initialize = async () => {
      try {
        await checkConnection();
        await loadTravels();
      } finally {
        setIsInitializing(false);
      }
    };
    initialize().catch(console.error);
  }, [loadFiles, loadTravels, searchParams]);

  const handleConnect = () => {
    window.location.href = "/api/google/connect";
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/drive/sync", { method: "POST" });
      const data = await response.json();
      if (data.success) {
        await loadFiles();
      }
    } catch (error) {
      console.error("Error syncing files:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch("/api/google/disconnect", { method: "POST" });
      setConnectionStatus("disconnected");
      setAccount(null);
      setFiles([]);
    } catch (error) {
      console.error("Error disconnecting:", error);
    }
  };

  const handleTravelChange = async (travelId: string) => {
    try {
      await fetch("/api/travel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: travelId, isActive: true }),
      });
      loadTravels();
    } catch (error) {
      console.error("Error changing travel:", error);
    }
  };

  const handleCreateTravel = async (name: string) => {
    try {
      const response = await fetch("/api/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (data.travel) {
        await loadTravels();
      }
    } catch (error) {
      console.error("Error creating travel:", error);
      throw error;
    }
  };

  const isLoading =
    connectionStatus === "loading" ||
    isInitializing ||
    (connectionStatus === "connected" && (isLoadingFiles || isLoadingTravels));

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[60vh] w-full items-center justify-center p-6">
        <Loader className="text-muted-foreground" size={24} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="font-semibold text-2xl">Google Drive</h1>
          <p className="text-muted-foreground text-sm">
            Sync your travel documents with Google Drive
          </p>
        </div>
        <div className="flex gap-2">
          {connectionStatus === "connected" && !!activeTravel && (
            <>
              <Button
                onClick={() => setShowUpload(!showUpload)}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Upload File
              </Button>
              <Button
                disabled={isSyncing}
                onClick={handleSync}
                variant="outline"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
                />
                {isSyncing ? "Syncing..." : "Sync Now"}
              </Button>
            </>
          )}
          {connectionStatus === "disconnected" ? (
            <Button onClick={handleConnect}>
              <Link2 className="mr-2 h-4 w-4" />
              Connect Google Drive
            </Button>
          ) : (
            <DriveConnectionStatus
              email={account?.email}
              onDisconnect={handleDisconnect}
            />
          )}
        </div>
      </div>

      {connectionStatus === "connected" &&
        (travels.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>No Travels Yet</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  You haven't created any travels yet. Create your first travel
                  to start syncing documents with Google Drive.
                </p>
                <Button
                  className="w-full"
                  onClick={() => setIsCreateTravelModalOpen(true)}
                >
                  Create Your First Travel
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="px-6">
              <TravelSelector
                activeTravel={activeTravel}
                onCreateTravel={() => setIsCreateTravelModalOpen(true)}
                onTravelChange={handleTravelChange}
                travels={travels}
              />
            </div>

            <div className="flex-1 overflow-auto px-6 py-4">
              {activeTravel ? (
                <>
                  {showUpload && (
                    <div className="mb-6">
                      <DriveFileUpload
                        onUploadComplete={async () => {
                          setShowUpload(false);
                          await loadFiles();
                        }}
                      />
                    </div>
                  )}
                  <DriveFileList files={files} onRefresh={loadFiles} />
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="font-medium text-lg">No active travel</p>
                    <p className="text-muted-foreground text-sm">
                      Select a travel from the dropdown above
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        ))}

      {connectionStatus === "disconnected" && (
        <div className="flex flex-1 items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Connect Google Drive</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Connect your Google Drive account to sync and manage your travel
                documents.
              </p>
              <Button className="w-full" onClick={handleConnect}>
                <Link2 className="mr-2 h-4 w-4" />
                Connect Google Drive
              </Button>
              <div className="text-muted-foreground text-xs">
                <p>• Create folders for each travel</p>
                <p>• Upload and sync documents</p>
                <p>• View files directly in Drive</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <CreateTravelModal
        onCreateTravel={handleCreateTravel}
        onOpenChange={setIsCreateTravelModalOpen}
        open={isCreateTravelModalOpen}
      />
    </div>
  );
}
