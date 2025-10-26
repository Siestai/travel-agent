# Parser Agent Setup Guide

## Quick Start

The Parser Agent is now implemented in your codebase. To use it, you need to set up Inngest.

## Option 1: Use Inngest (Recommended for Production)

### 1. Create Inngest Account

1. Go to [https://www.inngest.com](https://www.inngest.com)
2. Sign up for a free account
3. Create a new application

### 2. Get Your Event Key

1. In the Inngest dashboard, go to your app settings
2. Copy the Event Key
3. Add it to your environment variables

### 3. Add Environment Variable

Create or update `.env.local`:

```bash
INNGEST_EVENT_KEY=your-inngest-event-key-here
```

### 4. Deploy to Production

The Inngest functions will automatically be discovered when you deploy to Vercel. Make sure to:

1. Add the `INNGEST_EVENT_KEY` to your Vercel environment variables
2. Deploy your application
3. Inngest will automatically connect to your app

## Option 2: Local Development Without Inngest

For local development without setting up Inngest:

1. The system will work without `INNGEST_EVENT_KEY` set
2. You'll see a warning in the console when triggering parsing
3. **The document will process synchronously** - parsing happens immediately in the same request
4. This is slower than async processing but works without Inngest setup
5. Jobs will still be tracked in the database with status updates

## Testing the Parser

### 1. Start Your Development Server

```bash
pnpm dev
```

### 2. Upload a PDF Document

1. Navigate to the Google Drive section
2. Upload a PDF file (housing or transportation document)
3. Click the "Parse" button on the file

### 3. Monitor the Job

- The job will be created with status "pending"
- Check the browser console for any errors
- Status will update to "running" when processing starts
- When complete, status will be "completed"

### 4. View Parsed Results

Navigate to `/parsed/[driveFileId]` to see the parsed document

## Troubleshooting

### Error: "Event key not found"

**Solution**: Set up Inngest and add the `INNGEST_EVENT_KEY` to your environment variables, or the system will run without it locally.

### Job Stays in "Pending" Status

**Solution**: Without Inngest configured, jobs won't process automatically. You'll need to either:

1. Set up Inngest (see Option 1 above)
2. Or implement a manual trigger for local development

### PDF Parsing Fails

**Check**:

1. Ensure the file is a valid PDF
2. Check that Google Drive integration is working
3. Verify Anthropic API key is configured for Claude models

## Production Deployment Checklist

- [ ] Create Inngest account
- [ ] Get Event Key
- [ ] Add `INNGEST_EVENT_KEY` to environment variables
- [ ] Add Anthropic API key (for Claude models)
- [ ] Deploy application
- [ ] Verify Inngest connects to your app
- [ ] Test document parsing with real documents

## Next Steps

Once the parser is working:

1. **Enhance the schemas**: Add more fields to housing and transportation documents
2. **Improve accuracy**: Fine-tune the prompts in the classifier, extractor, and validator agents
3. **Add more document types**: Extend beyond housing and transportation
4. **Implement batch processing**: Parse multiple documents at once
5. **Add export functionality**: Export parsed data to CSV, JSON, or other formats
