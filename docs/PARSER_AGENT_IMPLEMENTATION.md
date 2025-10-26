# Parser Agent Implementation Summary

## Overview

This document summarizes the implementation of a sophisticated Parser Agent using LangGraph TypeScript and Inngest for document parsing in the SiestaAI Travel Agent application.

## Architecture

### Multi-Agent System

The parser uses a cognitive multi-agent pattern with three specialized agents:

1. **Classifier Agent** (`lib/parser/agents/classifier.ts`)

   - Determines document type: housing or transportation
   - Uses Claude Sonnet for intelligent classification
   - Returns confidence score and reasoning

2. **Extractor Agent** (`lib/parser/agents/extractor.ts`)

   - Extracts structured data based on document type
   - Uses Zod schemas for validation
   - Domain-specific extraction (housing vs transportation)

3. **Validator Agent** (`lib/parser/agents/validator.ts`)
   - Validates and refines extracted data
   - Checks for consistency and completeness
   - Corrects logical inconsistencies

### Workflow

```
PDF Document → PDF Extractor → Classifier Agent → Extractor Agent → Validator Agent → Structured Data
```

## Database Schema

### InngestStatus Table

Tracks job execution status and metadata:

- `jobId`: Unique job identifier
- `jobType`: Type of job (e.g., "parse_document")
- `status`: pending | running | completed | failed
- `userId`: Associated user
- `metadata`: Job-specific data (JSON)
- `error`: Error message if failed

### ParsedDocument Table

Stores extracted structured data:

- `driveFileId`: References DriveFile table
- `userId`: Owner of the document
- `documentType`: housing | transportation
- `parsedData`: JSON with extracted fields
- `confidence`: 0.00-1.00 confidence score
- `rawText`: Original PDF text
- `inngestJobId`: Links to Inngest job

## API Endpoints

### 1. `/api/parser/trigger` (POST)

Triggers parsing job:

- Downloads file from Google Drive
- Creates Inngest status record
- Sends Inngest event
- Returns job ID

### 2. `/api/parser/status` (GET)

Checks job status:

- Parameters: `jobId`
- Returns current status and metadata

### 3. `/api/parser/results` (GET)

Fetches parsed results:

- Parameters: `driveFileId`
- Returns structured parsed data

## Inngest Configuration

### Client Setup (`lib/inngest/client.ts`)

```typescript
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "siestai-travel-agent",
  eventKey: process.env.INNGEST_EVENT_KEY,
});
```

### Function Definition (`lib/inngest/functions/parse-document.ts`)

Multi-step job orchestration:

1. Update status to "running"
2. Get database driveFile record
3. Extract text from PDF
4. Run LangGraph parser
5. Save results to database
6. Update status to "completed"

**Retry Logic**: 3 automatic retries with exponential backoff
**Error Handling**: Updates status to "failed" with error message

### API Route (`app/api/inngest/route.ts`)

Handles Inngest HTTP requests (sync).

## Document Schemas

### Housing Documents

Extracted fields:

- Basic: documentDate, currency, totalAmount, vendorName, vendorAddress
- Property: propertyName, propertyAddress, roomType
- Dates: checkInDate, checkOutDate, numberOfNights
- Guests: numberOfGuests, guestNames
- Details: amenities, cancellationPolicy, taxesAndFees

### Transportation Documents

Extracted fields:

- Basic: documentDate, currency, totalAmount, vendorName, carrierName
- Type: transportationType (flight/train/bus/car_rental/taxi/other)
- Locations: departureLocation, arrivalLocation
- Times: departureDateTime, arrivalDateTime
- Booking: flightNumber, seatNumber, ticketClass
- Passengers: passengerNames, baggageAllowance

## UI Components

### ParseDocumentButton (`components/parse-document-button.tsx`)

- Shows loading state during parsing
- Polls job status every 2 seconds
- Displays success/error toasts
- Disabled when parsing is active

### ParsedDocumentView (`components/parsed-document-view.tsx`)

Rich formatted view:

- Document type and confidence badge
- Edit mode for manual corrections
- Re-parse button (placeholder for functionality)
- Collapsible raw text viewer
- Collapsible JSON viewer

### HousingDataView (`components/housing-data-view.tsx`)

Specialized view for housing documents:

- Display mode: Card grid with key information
- Edit mode: Form inputs for all fields
- Responsive grid layout

### TransportationDataView (`components/transportation-data-view.tsx`)

Specialized view for transportation documents:

- Display mode: Card grid with travel details
- Edit mode: Form inputs including transportation type selector
- Responsive grid layout

### Page Route (`app/(chat)/parsed/[driveFileId]/page.tsx`)

Server-side rendered page:

- Authentication required
- Fetches parsed document from database
- Error handling and redirects
- Displays ParsedDocumentView component

## File Changes Summary

### New Files

1. **Database Queries** (`lib/db/queries.ts` - added functions):

   - `saveInngestStatus`
   - `updateInngestStatus`
   - `getInngestStatusByJobId`
   - `saveParsedDocument`
   - `getParsedDocumentByDriveFileId`
   - `getParsedDocumentsByUserId`

2. **Parser Core**:

   - `lib/parser/schemas.ts` - Zod schemas
   - `lib/parser/pdf-extractor.ts` - PDF text extraction
   - `lib/parser/agents/classifier.ts`
   - `lib/parser/agents/extractor.ts`
   - `lib/parser/agents/validator.ts`
   - `lib/parser/agents/parser-graph.ts`

3. **Inngest**:

   - `lib/inngest/client.ts`
   - `lib/inngest/functions/parse-document.ts`
   - `app/api/inngest/route.ts`

4. **API Routes**:

   - `app/(chat)/api/parser/trigger/route.ts`
   - `app/(chat)/api/parser/status/route.ts`
   - `app/(chat)/api/parser/results/route.ts`

5. **UI Components**:

   - `components/parse-document-button.tsx`
   - `components/parsed-document-view.tsx`
   - `components/housing-data-view.tsx`
   - `components/transportation-data-view.tsx`

6. **Pages**:
   - `app/(chat)/parsed/[driveFileId]/page.tsx`

### Modified Files

1. `lib/db/schema.ts` - Added inngestStatus and parsedDocument tables
2. `lib/db/queries.ts` - Added parser-related queries
3. `lib/google/drive-service.ts` - Added downloadFile function
4. `components/drive-file-list.tsx` - Added parse button

## Environment Variables

Add to `.env.local`:

```bash
INNGEST_EVENT_KEY=your-inngest-event-key
```

## Dependencies Added

- `inngest` - Job orchestration
- `@langchain/langgraph` - Multi-agent workflows
- `@langchain/core` - Core LangChain
- `@langchain/anthropic` - Claude integration
- `pdf-parse` - PDF text extraction

## Usage

### Triggering Parsing

1. User uploads PDF to Google Drive
2. User clicks "Parse" button on file
3. System creates Inngest job
4. Job downloads file, extracts text, and runs agents
5. Results saved to database
6. User can view parsed results

### Viewing Results

Navigate to `/parsed/[driveFileId]` to view parsed document with:

- Structured data display
- Edit capabilities
- Raw text viewer
- JSON viewer

## Error Handling

- **Retries**: 3 automatic retries with exponential backoff
- **Status Tracking**: Real-time status updates in database
- **User Feedback**: Toast notifications for success/failure
- **Manual Recovery**: Failed jobs can be re-triggered via UI

## Future Enhancements

1. Implement "Re-parse" functionality
2. Add document comparison views
3. Support more document types
4. Add export functionality (CSV, JSON)
5. Implement confidence thresholds and warnings
6. Add batch processing for multiple documents
