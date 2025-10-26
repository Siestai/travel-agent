import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockDocumentList } from "@/lib/mock-data/travel-documents";

export default function DocumentsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="font-semibold text-2xl">Documents</h1>
          <p className="text-muted-foreground text-sm">
            Manage your travel documents
          </p>
        </div>
        <Button asChild>
          <a href="/documents/upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </a>
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-6">
        {mockDocumentList.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="font-medium text-lg">No documents yet</p>
              <p className="text-muted-foreground text-sm">
                Upload your first travel document to get started
              </p>
              <Button asChild className="mt-4">
                <a href="/documents/upload">Upload Document</a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockDocumentList.map((doc) => (
              <Card className="transition-shadow hover:shadow-md" key={doc.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="line-clamp-1">
                        {doc.title}
                      </CardTitle>
                      <CardDescription>
                        {doc.documentType === "housing"
                          ? "Housing"
                          : "Transportation"}
                      </CardDescription>
                    </div>
                    <span className="text-muted-foreground text-xs">
                      {doc.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Locations:</span>
                      <span className="ml-2 font-medium">{doc.nodeCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Connections:
                      </span>
                      <span className="ml-2 font-medium">
                        {doc.connectionCount}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
