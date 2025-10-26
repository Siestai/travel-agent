import { generateText } from "ai";
import { myProvider } from "@/lib/ai/providers";
import type { ParserState } from "../schemas";

// Get model from provider, defaulting to qwen3:32b
function getModel(modelId = "ollama-qwen3-32b") {
  return myProvider.languageModel(modelId);
}

const JSON_REGEX = /\{[\s\S]*\}/;

export async function classifyDocument(
  state: ParserState,
  modelId?: string
): Promise<ParserState> {
  const model = getModel(modelId);
  const systemMessage = `You are a document classification agent. Your job is to analyze the given text and determine if it's a HOUSING document (hotel bookings, accommodation, Airbnb) or TRANSPORTATION document (flights, trains, buses, car rentals).

Return your response in JSON format:
{
  "documentType": "housing" | "transportation" | "unknown",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;

  const userMessage = `Classify this document:\n\n${state.rawText.substring(0, 2000)}`;

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
        documentType: "unknown",
        confidence: 0,
        errors: [...state.errors, "Failed to parse classification response"],
      };
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      ...state,
      documentType: parsed.documentType || "unknown",
      confidence: parsed.confidence || 0,
      errors: parsed.reasoning
        ? [...state.errors, parsed.reasoning]
        : state.errors,
    };
  } catch (error) {
    console.error("Classification error:", error);
    return {
      ...state,
      documentType: "unknown",
      confidence: 0,
      errors: [
        ...state.errors,
        `Classification error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ],
    };
  }
}
