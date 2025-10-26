import type {
  TravelDocument,
  TravelDocumentListItem,
} from "@/lib/types/travel";

export const mockTravelDocuments: TravelDocument[] = [
  {
    id: "1",
    createdAt: new Date("2024-01-15"),
    title: "Istanbul to Rome Flight",
    documentType: "transportation",
    sourceFileUrl: "/documents/flight1.pdf",
    userId: "user1",
    parsedData: {
      nodes: [
        {
          id: "node-1",
          name: "Istanbul Airport (IST)",
          type: "airport",
          coordinates: { lat: 41.2753, lng: 28.7519 },
          address: "Istanbul, Turkey",
        },
        {
          id: "node-2",
          name: "Rome Fiumicino Airport (FCO)",
          type: "airport",
          coordinates: { lat: 41.8003, lng: 12.2389 },
          address: "Rome, Italy",
        },
      ],
      connections: [
        {
          id: "conn-1",
          type: "flight",
          from: "node-1",
          to: "node-2",
          departureTime: "2024-03-15T14:30:00Z",
          arrivalTime: "2024-03-15T16:45:00Z",
          carrier: "Turkish Airlines",
          bookingReference: "TK1864",
        },
      ],
      metadata: {
        documentType: "transportation",
        processedAt: "2024-01-15T10:00:00Z",
        confidence: 0.95,
        sourceFile: "flight1.pdf",
      },
      rawText: "Flight ticket from Istanbul to Rome",
    },
  },
  {
    id: "2",
    createdAt: new Date("2024-01-20"),
    title: "Rome Airbnb Booking",
    documentType: "housing",
    sourceFileUrl: "/documents/hotel1.pdf",
    userId: "user1",
    parsedData: {
      nodes: [
        {
          id: "node-3",
          name: "Cozy Apartment near Colosseum",
          type: "accommodation",
          coordinates: { lat: 41.8902, lng: 12.4922 },
          address: "Via del Colosseo, Rome, Italy",
          checkIn: "2024-03-15T15:00:00Z",
          checkOut: "2024-03-18T11:00:00Z",
        },
      ],
      connections: [],
      metadata: {
        documentType: "housing",
        processedAt: "2024-01-20T14:00:00Z",
        confidence: 0.92,
        sourceFile: "hotel1.pdf",
      },
    },
  },
  {
    id: "3",
    createdAt: new Date("2024-02-01"),
    title: "Rome to Florence Train",
    documentType: "transportation",
    sourceFileUrl: "/documents/train1.pdf",
    userId: "user1",
    parsedData: {
      nodes: [
        {
          id: "node-4",
          name: "Rome Termini Station",
          type: "station",
          coordinates: { lat: 41.901, lng: 12.502 },
          address: "Rome, Italy",
        },
        {
          id: "node-5",
          name: "Florence Santa Maria Novella",
          type: "station",
          coordinates: { lat: 43.7767, lng: 11.2483 },
          address: "Florence, Italy",
        },
      ],
      connections: [
        {
          id: "conn-2",
          type: "train",
          from: "node-4",
          to: "node-5",
          departureTime: "2024-03-16T10:30:00Z",
          arrivalTime: "2024-03-16T12:15:00Z",
          carrier: "Trenitalia",
        },
      ],
      metadata: {
        documentType: "transportation",
        processedAt: "2024-02-01T09:00:00Z",
        confidence: 0.88,
        sourceFile: "train1.pdf",
      },
    },
  },
  {
    id: "4",
    createdAt: new Date("2024-02-05"),
    title: "Florence Hotel Booking",
    documentType: "housing",
    sourceFileUrl: "/documents/hotel2.pdf",
    userId: "user1",
    parsedData: {
      nodes: [
        {
          id: "node-6",
          name: "Hotel Brunelleschi",
          type: "accommodation",
          coordinates: { lat: 43.7731, lng: 11.256 },
          address: "Florence, Italy",
          checkIn: "2024-03-16T14:00:00Z",
          checkOut: "2024-03-18T11:00:00Z",
        },
      ],
      connections: [],
      metadata: {
        documentType: "housing",
        processedAt: "2024-02-05T11:30:00Z",
        confidence: 0.91,
        sourceFile: "hotel2.pdf",
      },
    },
  },
];

export const mockDocumentList: TravelDocumentListItem[] = [
  {
    id: "1",
    title: "Istanbul to Rome Flight",
    documentType: "transportation",
    createdAt: new Date("2024-01-15"),
    status: "completed",
    nodeCount: 2,
    connectionCount: 1,
  },
  {
    id: "2",
    title: "Rome Airbnb Booking",
    documentType: "housing",
    createdAt: new Date("2024-01-20"),
    status: "completed",
    nodeCount: 1,
    connectionCount: 0,
  },
  {
    id: "3",
    title: "Rome to Florence Train",
    documentType: "transportation",
    createdAt: new Date("2024-02-01"),
    status: "completed",
    nodeCount: 2,
    connectionCount: 1,
  },
  {
    id: "4",
    title: "Florence Hotel Booking",
    documentType: "housing",
    createdAt: new Date("2024-02-05"),
    status: "completed",
    nodeCount: 1,
    connectionCount: 0,
  },
];
