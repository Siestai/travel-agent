import { anthropic } from "@ai-sdk/anthropic";
import { gateway } from "@ai-sdk/gateway";
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
} from "ai";
import { createOllama } from "ollama-ai-provider-v2";
import { isTestEnvironment } from "../constants";

// Create custom Ollama provider with configurable base URL
const ollamaBaseURL =
  process.env.OLLAMA_BASE_URL || "http://100.101.91.65:11434/api";
console.log("🔧 Ollama Base URL:", ollamaBaseURL);

const customOllama = createOllama({
  baseURL: ollamaBaseURL,
});

export const myProvider = isTestEnvironment
  ? (() => {
      const {
        artifactModel,
        chatModel,
        reasoningModel,
        titleModel,
      } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "chat-model-reasoning": reasoningModel,
          "title-model": titleModel,
          "artifact-model": artifactModel,
        },
      });
    })()
  : customProvider({
      languageModels: {
        // xAI Models (existing)
        "chat-model": gateway.languageModel("xai/grok-2-vision-1212"),
        "chat-model-reasoning": wrapLanguageModel({
          model: gateway.languageModel("xai/grok-3-mini"),
          middleware: extractReasoningMiddleware({ tagName: "think" }),
        }),
        "title-model": customOllama("gpt-oss:20b"),
        "artifact-model": customOllama("gpt-oss:20b"),

        // Ollama Models
        "ollama-gpt-oss-20b": customOllama("gpt-oss:20b"),
        "ollama-gpt-oss-120b": customOllama("gpt-oss:120b"),
        "ollama-qwen3-32b": customOllama("qwen3:32b"),
        "ollama-deepcoder-14b": customOllama("deepcoder:14b"),
        "ollama-phi4-14b": customOllama("phi4:14b"),

        // Anthropic Models
        "anthropic-claude-3-5-sonnet": anthropic("claude-3-5-sonnet-20241022"),
        "anthropic-claude-3-5-haiku": anthropic("claude-3-5-haiku-20241022"),
        "anthropic-claude-3-opus": anthropic("claude-3-opus-20240229"),
      },
    });
