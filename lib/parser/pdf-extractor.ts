import pdfExtraction from "pdf-extraction";

const PDF_PARSE_ERROR = "Failed to extract text from PDF";

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Extract text from PDF - pdf-extraction is a function that takes a buffer
    const result = await pdfExtraction(buffer);
    return result.text || "";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(PDF_PARSE_ERROR);
  }
}
