export type NodeType = "airport" | "station" | "accommodation" | "destination";

export type ConnectionType = "flight" | "train" | "bus" | "ferry" | "car";

export type DocumentType = "transportation" | "housing";

export type TravelNode = {
  id: string;
  name: string;
  type: NodeType;
  coordinates?: { lat: number; lng: number };
  address?: string;
  checkIn?: string;
  checkOut?: string;
};

export type TravelConnection = {
  id: string;
  type: ConnectionType;
  from: string; // Node ID
  to: string; // Node ID
  departureTime?: string;
  arrivalTime?: string;
  bookingReference?: string;
  carrier?: string;
};

export type DocumentMetadata = {
  documentType: DocumentType;
  processedAt: string;
  confidence: number;
  sourceFile: string;
};

export type ParsedTravelData = {
  nodes: TravelNode[];
  connections: TravelConnection[];
  metadata: DocumentMetadata;
  rawText?: string;
  warnings?: string[];
};

export type TravelDocument = {
  id: string;
  createdAt: Date;
  title: string;
  documentType: DocumentType;
  parsedData: ParsedTravelData;
  sourceFileUrl: string;
  userId: string;
};

export type DocumentStatus = "uploading" | "parsing" | "completed" | "error";

export type TravelDocumentListItem = {
  id: string;
  title: string;
  documentType: DocumentType;
  createdAt: Date;
  status: DocumentStatus;
  thumbnailUrl?: string;
  nodeCount: number;
  connectionCount: number;
};
