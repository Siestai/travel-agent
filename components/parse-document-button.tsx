"use client";

import { CpuIcon, FileText, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chatModels } from "@/lib/ai/models";

type ParseStatus = "idle" | "parsing" | "completed" | "failed";

export function ParseDocumentButton({ driveFileId }: { driveFileId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<ParseStatus>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("ollama-qwen3-32b");

  useEffect(() => {
    if (!jobId || status === "completed" || status === "failed") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/parser/status?jobId=${jobId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === "completed") {
            setStatus("completed");
            toast({
              type: "success",
              description: "Document has been successfully parsed.",
            });
            clearInterval(interval);

            // Navigate to parsed document page
            router.push(`/parsed/${driveFileId}`);
          } else if (data.status === "failed") {
            setStatus("failed");
            toast({
              type: "error",
              description: data.error || "Failed to parse document",
            });
            clearInterval(interval);
          }
        }
      } catch (error) {
        console.error("Error checking parser status:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobId, status, driveFileId, router]);

  const handleParse = async () => {
    setStatus("parsing");

    try {
      const response = await fetch("/api/parser/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ driveFileId, modelId: selectedModel }),
      });

      if (!response.ok) {
        throw new Error("Failed to trigger parser");
      }

      const data = await response.json();
      setJobId(data.jobId);
      toast({
        type: "success",
        description: "Your document is being parsed...",
      });
    } catch (error) {
      console.error("Error triggering parser:", error);
      setStatus("failed");
      toast({
        type: "error",
        description: "Failed to start parsing",
      });
    }
  };

  const isDisabled = status === "parsing" || status === "completed";

  return (
    <div className="flex items-center gap-2">
      {status === "idle" && (
        <Select onValueChange={setSelectedModel} value={selectedModel}>
          <SelectTrigger className="h-8 w-32">
            <div className="flex items-center gap-1">
              <CpuIcon className="h-3 w-3" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {chatModels
              .filter(
                (model) =>
                  model.id.startsWith("ollama-") ||
                  model.id.startsWith("anthropic-")
              )
              .map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )}
      <Button
        disabled={isDisabled}
        onClick={handleParse}
        size="sm"
        variant="secondary"
      >
        {status === "parsing" ? (
          <>
            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            Parsing...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-3 w-3" />
            Parse
          </>
        )}
      </Button>
    </div>
  );
}
