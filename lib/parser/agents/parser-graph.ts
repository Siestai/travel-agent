import type { ParserState } from "../schemas";
import { classifyDocument } from "./classifier";
import { extractData } from "./extractor";
import { validateData } from "./validator";

// Agent nodes
async function classifierAgent(
  state: ParserState,
  modelId?: string
): Promise<ParserState> {
  console.log("[Classifier] Starting classification");
  const newState = await classifyDocument(
    {
      ...state,
      currentAgent: "classifier",
    },
    modelId
  );
  return {
    ...newState,
    currentAgent: "extractor",
  };
}

async function extractorAgent(
  state: ParserState,
  modelId?: string
): Promise<ParserState> {
  console.log("[Extractor] Starting extraction");
  const newState = await extractData(
    {
      ...state,
      currentAgent: "extractor",
    },
    modelId
  );
  return {
    ...newState,
    currentAgent: "validator",
  };
}

async function validatorAgent(
  state: ParserState,
  modelId?: string
): Promise<ParserState> {
  console.log("[Validator] Starting validation");
  const newState = await validateData(
    {
      ...state,
      currentAgent: "validator",
    },
    modelId
  );
  return {
    ...newState,
    currentAgent: "complete",
  };
}

// Create the workflow graph
export function createParserGraph(modelId?: string) {
  return {
    invoke: async (initialState: ParserState): Promise<ParserState> => {
      // Sequential execution of agents
      let state = await classifierAgent(initialState, modelId);
      state = await extractorAgent(state, modelId);
      state = await validatorAgent(state, modelId);

      return state;
    },
  };
}

// Main entry point
export async function parseDocument(
  rawText: string,
  modelId?: string
): Promise<ParserState> {
  const initialState: ParserState = {
    rawText,
    documentType: "unknown",
    extractedData: {},
    validatedData: {},
    confidence: 0,
    errors: [],
    currentAgent: "classifier",
  };

  console.log(
    "[Parser] Starting document parsing with model:",
    modelId || "ollama-qwen3-32b"
  );
  const graph = createParserGraph(modelId);
  const result = await graph.invoke(initialState);

  console.log(
    `[Parser] Completed with confidence: ${result.confidence}, errors: ${result.errors.length}`
  );

  return result;
}
