import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { db, getParsedDocumentsByUserId } from "@/lib/db/queries";
import type { ParsedDocument } from "@/lib/db/schema";
import { driveFile } from "@/lib/db/schema";
import { geocodeAddress } from "@/lib/google/geocoding-service";
import type { TravelConnection } from "@/lib/types/travel";

type EnrichedLocation = {
  id: string;
  name: string;
  type: "airport" | "station" | "accommodation" | "destination";
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

/**
 * Convert parsed document to travel nodes and connections
 */
function enrichParsedData(
  parsedDoc: ParsedDocument,
  fileName: string
): {
  nodes: EnrichedLocation[];
  connections: TravelConnection[];
} {
  const nodes: EnrichedLocation[] = [];
  const connections: TravelConnection[] = [];
  const parsedData = parsedDoc.parsedData as Record<string, unknown>;

  if (parsedDoc.documentType === "housing") {
    // Extract accommodation information
    const propertyName = parsedData.propertyName as string | undefined;
    const propertyAddress = parsedData.propertyAddress as string | undefined;
    const checkInDate = parsedData.checkInDate as string | undefined;
    const checkOutDate = parsedData.checkOutDate as string | undefined;

    if (propertyAddress) {
      nodes.push({
        id: `node_${parsedDoc.id}`,
        name: propertyName || propertyAddress,
        type: "accommodation",
        address: propertyAddress,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        documentId: parsedDoc.id,
        documentTitle: fileName,
        driveFileId: parsedDoc.driveFileId,
      });
    }
  } else if (parsedDoc.documentType === "transportation") {
    // Extract transportation information
    const departureLocation = parsedData.departureLocation as
      | string
      | undefined;
    const arrivalLocation = parsedData.arrivalLocation as string | undefined;
    const departureDateTime = parsedData.departureDateTime as
      | string
      | undefined;
    const arrivalDateTime = parsedData.arrivalDateTime as string | undefined;
    const transportationType = parsedData.transportationType as
      | string
      | undefined;

    let fromNodeId: string | undefined;
    let toNodeId: string | undefined;

    // Create departure node
    if (departureLocation) {
      const nodeType =
        transportationType === "flight"
          ? "airport"
          : transportationType === "train" || transportationType === "bus"
            ? "station"
            : "destination";

      nodes.push({
        id: `node_${parsedDoc.id}_departure`,
        name: departureLocation,
        type: nodeType,
        address: departureLocation,
        departureTime: departureDateTime,
        documentId: parsedDoc.id,
        documentTitle: fileName,
        driveFileId: parsedDoc.driveFileId,
      });
      fromNodeId = `node_${parsedDoc.id}_departure`;
    }

    // Create arrival node
    if (arrivalLocation) {
      const nodeType =
        transportationType === "flight"
          ? "airport"
          : transportationType === "train" || transportationType === "bus"
            ? "station"
            : "destination";

      nodes.push({
        id: `node_${parsedDoc.id}_arrival`,
        name: arrivalLocation,
        type: nodeType,
        address: arrivalLocation,
        arrivalTime: arrivalDateTime,
        documentId: parsedDoc.id,
        documentTitle: fileName,
        driveFileId: parsedDoc.driveFileId,
      });
      toNodeId = `node_${parsedDoc.id}_arrival`;
    }

    // Create connection between departure and arrival
    if (fromNodeId && toNodeId && transportationType) {
      connections.push({
        id: `conn_${parsedDoc.id}`,
        type: getConnectionType(transportationType),
        from: fromNodeId,
        to: toNodeId,
        departureTime: departureDateTime,
        arrivalTime: arrivalDateTime,
        carrier: parsedData.carrierName as string | undefined,
        bookingReference: parsedData.confirmationNumber as string | undefined,
      });
    }
  }

  return { nodes, connections };
}

function getConnectionType(
  transportationType: string
): TravelConnection["type"] {
  const typeMap: Record<string, TravelConnection["type"]> = {
    flight: "flight",
    train: "train",
    bus: "bus",
    car_rental: "car",
    taxi: "car",
    ferry: "ferry",
  };

  return typeMap[transportationType] || "flight";
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsedDocs = await getParsedDocumentsByUserId({
      userId: session.user.id,
    });

    // Get all drive files to get file names
    const driveFiles = await db.select().from(driveFile);

    const allNodes: EnrichedLocation[] = [];
    const allConnections: TravelConnection[] = [];

    // Process each parsed document
    for (const parsedDoc of parsedDocs) {
      const file = driveFiles.find((f) => f.id === parsedDoc.driveFileId);
      const fileName = file?.name || "Unknown";

      const { nodes, connections } = enrichParsedData(parsedDoc, fileName);
      allNodes.push(...nodes);
      allConnections.push(...connections);
    }

    // Geocode addresses that don't have coordinates
    const addressesToGeocode = allNodes
      .filter(
        (node): node is EnrichedLocation & { address: string } =>
          node.address !== undefined && !node.coordinates
      )
      .map((node) => node.address);

    const geocodeResults = new Map<string, { lat: number; lng: number }>();

    for (const address of addressesToGeocode) {
      const result = await geocodeAddress(address);
      if (result) {
        geocodeResults.set(address, { lat: result.lat, lng: result.lng });
      }
    }

    // Add coordinates to nodes
    const enrichedNodes = allNodes.map((node) => {
      if (node.address && !node.coordinates) {
        const coords = geocodeResults.get(node.address);
        if (coords) {
          return { ...node, coordinates: coords };
        }
      }
      return node;
    });

    return NextResponse.json({
      nodes: enrichedNodes,
      connections: allConnections,
    });
  } catch (error) {
    console.error("Error fetching parsed travel data:", error);
    return NextResponse.json(
      { error: "Failed to fetch travel data" },
      { status: 500 }
    );
  }
}
