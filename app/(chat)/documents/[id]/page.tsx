import { notFound } from "next/navigation";
import { mockTravelDocuments } from "@/lib/mock-data/travel-documents";

export default function DocumentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const document = mockTravelDocuments.find((doc) => doc.id === params.id);

  if (!document) {
    notFound();
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="font-semibold text-2xl">{document.title}</h1>
        <p className="text-muted-foreground text-sm">
          Uploaded on {document.createdAt.toLocaleDateString()}
        </p>
      </div>

      <div className="flex-1 overflow-auto px-6 py-6">
        {/* TODO: Implement List and Timeline views */}
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 font-semibold text-lg">Nodes</h2>
            <div className="space-y-2">
              {document.parsedData.nodes.map((node) => (
                <div className="rounded-lg border p-4" key={node.id}>
                  <div className="font-medium">{node.name}</div>
                  <div className="text-muted-foreground text-sm">
                    {node.type}
                  </div>
                  {node.address && (
                    <div className="text-muted-foreground text-sm">
                      {node.address}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {document.parsedData.connections.length > 0 && (
            <div>
              <h2 className="mb-4 font-semibold text-lg">Connections</h2>
              <div className="space-y-2">
                {document.parsedData.connections.map((conn) => (
                  <div className="rounded-lg border p-4" key={conn.id}>
                    <div className="font-medium">{conn.type}</div>
                    <div className="text-muted-foreground text-sm">
                      From: {conn.from} → To: {conn.to}
                    </div>
                    {conn.carrier && (
                      <div className="text-muted-foreground text-sm">
                        Carrier: {conn.carrier}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
