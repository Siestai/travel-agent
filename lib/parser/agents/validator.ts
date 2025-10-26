import { generateText } from "ai";
import { myProvider } from "@/lib/ai/providers";
import type { ParserState } from "../schemas";

// Get model from provider, defaulting to qwen3:32b
function getModel(modelId = "ollama-qwen3-32b") {
  return myProvider.languageModel(modelId);
}

const JSON_REGEX = /\{[\s\S]*\}/;

export async function validateData(
  state: ParserState,
  modelId?: string
): Promise<ParserState> {
  const model = getModel(modelId);

  if (Object.keys(state.extractedData).length === 0) {
    return {
      ...state,
      errors: [...state.errors, "No data extracted to validate"],
    };
  }

  const systemMessage = `You are a data validation agent. Review the extracted data and verify its accuracy against the original document.

Check for:
1. Data consistency and correctness
2. Missing critical fields
3. Data format issues
4. Logical inconsistencies

Return a JSON response:
{
  "isValid": boolean,
  "confidence": 0.0-1.0,
  "validatedData": { refined data object },
  "issues": ["list of any issues found"],
  "refinements": { any data corrections made }
}`;

  const userMessage = `Original document:\n${state.rawText.substring(0, 1000)}\n\nExtracted data:\n${JSON.stringify(state.extractedData, null, 2)}\n\nValidate and refine this data.`;

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
        validatedData: state.extractedData,
        errors: [...state.errors, "Failed to parse validation response"],
      };
    }

    const validation = JSON.parse(jsonMatch[0]);

    return {
      ...state,
      validatedData: validation.validatedData || state.extractedData,
      confidence: validation.confidence || state.confidence,
      errors: validation.issues
        ? [...state.errors, ...validation.issues]
        : state.errors,
    };
  } catch (error) {
    console.error("Validation error:", error);
    return {
      ...state,
      validatedData: state.extractedData,
      errors: [
        ...state.errors,
        `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
      ],
    };
  }
}
