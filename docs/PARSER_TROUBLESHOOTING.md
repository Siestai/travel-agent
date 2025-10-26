# Parser Agent Troubleshooting

## Common Issues and Solutions

### Issue: Google Drive Authentication Failed

**Error:** `invalid_grant` when refreshing access token

**Solution:**

1. Navigate to your Settings > Google Drive Integration
2. Click "Disconnect"
3. Click "Connect Google Drive" again to re-authenticate
4. Try parsing again

The refresh token has expired or been revoked. Re-authentication will generate new tokens.

### Issue: Model Not Responding

**Error:** Timeout or connection error when calling the selected model

**Solutions:**

1. Check if your Ollama server is running: `curl http://100.101.91.65:11434/api/tags`
2. Verify the model is available: The model must be pulled in Ollama
3. Try a different model from the selector
4. For Anthropic models, ensure you have valid API keys set

### Issue: PDF Extraction Fails

**Error:** Various PDF-related errors

**Solutions:**

1. Ensure the file is a valid PDF (not corrupted)
2. Try with a different PDF file
3. Check server logs for specific error details
4. For large PDFs, consider uploading smaller versions

### Issue: Inngest Discovery Requests Spam

**Observation:** Multiple requests to `/api/inngest` with auth redirects

**Solution:** This is harmless and expected when INNGEST_EVENT_KEY is not set. The system will process synchronously without Inngest.

To eliminate these requests:

1. Set up Inngest account at https://www.inngest.com
2. Get your Event Key
3. Add `INNGEST_EVENT_KEY=your-key` to `.env.local`
4. Restart the dev server

### Issue: Parsing Always Returns "unknown" Document Type

**Observation:** Classifier always returns documentType: "unknown"

**Solutions:**

1. Check the PDF text extraction is working (view raw text in the UI)
2. Try a different model - some models are better at classification
3. Ensure the document is actually a housing or transportation document
4. The classifier looks for specific keywords - your document might not match expected patterns

### Issue: Low Confidence Scores

**Observation:** Parsed documents have low confidence (< 0.5)

**Solutions:**

1. Try a more capable model (e.g., Claude instead of qwen3:32b)
2. Ensure your PDF has clear, structured information
3. Check the raw extracted text for quality
4. Some documents may inherently have lower confidence due to format

### Issue: Job Stays in "Pending" Status

**Observation:** Status never changes from pending

**Solutions:**

1. Check browser console for JavaScript errors
2. Check server logs for processing errors
3. Verify model API keys are valid
4. Without Inngest, processing happens synchronously - check for timeout errors

## Testing the Parser

### Quick Test

1. Upload a simple PDF to Google Drive
2. Click "Parse" with default model (qwen3:32b)
3. Wait for status to update to "completed"
4. View results at `/parsed/[driveFileId]`

### Testing Different Models

1. Select a model from the dropdown before clicking "Parse"
2. Try qwen3:32b, anthropic-claude-3-5-sonnet, etc.
3. Compare results between different models
4. Check confidence scores for accuracy

### Viewing Results

Navigate to `/parsed/[driveFileId]` to see:

- Parsed structured data
- Confidence score
- Raw extracted text
- JSON view of all data

## Getting Help

If issues persist:

1. Check the server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure your Ollama server is accessible and models are pulled
4. Try with a known-good PDF file
