"use client";

import { ChevronDown, Edit } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { ParsedDocument } from "@/lib/db/schema";
import { HousingDataView } from "./housing-data-view";
import { TransportationDataView } from "./transportation-data-view";

type SerializedParsedDocument = Omit<
  ParsedDocument,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
};

export function ParsedDocumentView({
  parsedDoc,
}: {
  parsedDoc: SerializedParsedDocument;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(parsedDoc.parsedData);

  const confidence = parsedDoc.confidence
    ? Number.parseFloat(parsedDoc.confidence)
    : 0;

  const DocumentView =
    parsedDoc.documentType === "housing"
      ? HousingDataView
      : TransportationDataView;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Parsed Document - {parsedDoc.documentType}</CardTitle>
          <div className="flex gap-2">
            <Badge variant={confidence > 0.8 ? "default" : "secondary"}>
              Confidence: {(confidence * 100).toFixed(0)}%
            </Badge>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              size="sm"
              variant="outline"
            >
              <Edit className="mr-2 h-3 w-3" />
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            <Button size="sm" variant="outline">
              Re-parse
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <DocumentView
          data={editedData}
          isEditing={isEditing}
          onChange={setEditedData}
        />

        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground">
            View Raw Text <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 max-h-96 overflow-auto rounded bg-muted p-4 text-sm">
              {parsedDoc.rawText || "No raw text available"}
            </pre>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground">
            View JSON <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 max-h-96 overflow-auto rounded bg-muted p-4 text-sm">
              {JSON.stringify(parsedDoc.parsedData, null, 2)}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
