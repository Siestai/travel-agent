import { z } from "zod";

// Common fields
const baseDocumentSchema = z.object({
  documentDate: z.string().optional(),
  currency: z.string().optional(),
  totalAmount: z.number().optional(),
  vendorName: z.string().optional(),
  vendorAddress: z.string().optional(),
  confirmationNumber: z.string().optional(),
});

// Housing schema
export const housingDocumentSchema = baseDocumentSchema.extend({
  propertyName: z.string().optional(),
  propertyAddress: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  numberOfNights: z.number().optional(),
  numberOfGuests: z.number().optional(),
  roomType: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  cancellationPolicy: z.string().optional(),
  taxesAndFees: z.number().optional(),
  guestNames: z.array(z.string()).optional(),
});

// Transportation schema
export const transportationDocumentSchema = baseDocumentSchema.extend({
  transportationType: z
    .enum(["flight", "train", "bus", "car_rental", "taxi", "other"])
    .optional(),
  departureLocation: z.string().optional(),
  arrivalLocation: z.string().optional(),
  departureDateTime: z.string().optional(),
  arrivalDateTime: z.string().optional(),
  carrierName: z.string().optional(),
  flightNumber: z.string().optional(),
  seatNumber: z.string().optional(),
  passengerNames: z.array(z.string()).optional(),
  baggageAllowance: z.string().optional(),
  ticketClass: z.string().optional(),
});

export type HousingDocument = z.infer<typeof housingDocumentSchema>;
export type TransportationDocument = z.infer<
  typeof transportationDocumentSchema
>;

// Parser state type
export type ParserState = {
  rawText: string;
  documentType: "housing" | "transportation" | "unknown";
  extractedData: Record<string, unknown>;
  validatedData: Record<string, unknown>;
  confidence: number;
  errors: string[];
  currentAgent: string;
};
