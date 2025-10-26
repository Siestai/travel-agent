import { generateText } from "ai";
import { myProvider } from "@/lib/ai/providers";
import type { ParserState } from "../schemas";
import {
  housingDocumentSchema,
  transportationDocumentSchema,
} from "../schemas";

// Get model from provider, defaulting to qwen3:32b
function getModel(modelId = "ollama-qwen3-32b") {
  return myProvider.languageModel(modelId);
}

const JSON_REGEX = /\{[\s\S]*\}/;

export async function extractData(
  state: ParserState,
  modelId?: string
): Promise<ParserState> {
  const model = getModel(modelId);

  if (state.documentType === "unknown") {
    return {
      ...state,
      errors: [...state.errors, "Cannot extract from unknown document type"],
    };
  }

  const schema =
    state.documentType === "housing"
      ? housingDocumentSchema
      : transportationDocumentSchema;

  const schemaDescription = JSON.stringify(schema.shape, null, 2);

  const systemMessage = `You are a data extraction agent. Extract structured data from the document text.

Target document type: ${state.documentType}

Expected schema fields:
${schemaDescription}

Return your response in JSON format with the extracted fields. Only include fields that you can confidently extract from the text. Use null for missing fields.`;

  const userMessage = `Extract data from this ${state.documentType} document:\n\n${state.rawText.substring(0, 4000)}`;

  try {
    const response = await generateText({
      model,
      system: systemMessage,
      prompt: userMessage,
    });
    const content = response.text;

    // Parse JSON response
    const jsonMatch = content.match(JSON_REGEX);
    if (!jsonMatch) {
      return {
        ...state,
        errors: [...state.errors, "Failed to parse extraction response"],
      };
    }

    const extractedData = JSON.parse(jsonMatch[0]);

    // Validate against schema
    const validationResult = schema.safeParse(extractedData);
    if (!validationResult.success) {
      return {
        ...state,
        extractedData,
        errors: [
          ...state.errors,
          `Validation error: ${validationResult.error.message}`,
        ],
      };
    }

    return {
      ...state,
      extractedData: validationResult.data,
      errors: [...state.errors],
    };
  } catch (error) {
    console.error("Extraction error:", error);
    return {
      ...state,
      errors: [
        ...state.errors,
        `Extraction error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ],
    };
  }
}
