"use client";

import { FolderPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateTravelModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTravel: (name: string) => Promise<void>;
};

export function CreateTravelModal({
  open,
  onOpenChange,
  onCreateTravel,
}: CreateTravelModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"info" | "form">("info");

  const handleNext = () => {
    setStep("form");
  };

  const handleBack = () => {
    setStep("info");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onCreateTravel(name.trim());
      onOpenChange(false);
      setName("");
      setStep("info");
    } catch (error) {
      console.error("Error creating travel:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[500px]">
        {step === "info" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                Create Your First Travel
              </DialogTitle>
              <DialogDescription>
                Let's set up your travel management system
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="mb-2 font-medium">How it works:</p>
                <ul className="space-y-2 text-muted-foreground text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">1.</span>
                    <span>
                      Each travel gets its own folder in your Google Drive
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">2.</span>
                    <span>
                      We'll create a root folder named "Siestai Travel Agent"
                      (if it doesn't exist)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">3.</span>
                    <span>
                      Your travel folder will be created inside the root folder
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold">4.</span>
                    <span>
                      You can sync documents and files from this travel to your
                      Drive
                    </span>
                  </li>
                </ul>
              </div>

              <p className="text-muted-foreground text-sm">
                Ready to create your first travel?
              </p>
            </div>

            <DialogFooter>
              <Button
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button onClick={handleNext} type="button">
                Continue
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                Name Your Travel
              </DialogTitle>
              <DialogDescription>
                Choose a name for your travel that will be used as the folder
                name in Google Drive
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="travel-name">Travel Name</Label>
                <Input
                  autoFocus
                  id="travel-name"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Summer Europe Trip"
                  required
                  value={name}
                />
                <p className="text-muted-foreground text-xs">
                  This name will be used to create a folder in your Google Drive
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                disabled={isLoading}
                onClick={handleBack}
                type="button"
                variant="outline"
              >
                Back
              </Button>
              <Button disabled={isLoading || !name.trim()} type="submit">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Travel"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
