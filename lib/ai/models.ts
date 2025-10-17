export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  // xAI Models
  {
    id: "chat-model",
    name: "Grok Vision",
    description: "Advanced multimodal model with vision and text capabilities",
  },
  {
    id: "chat-model-reasoning",
    name: "Grok Reasoning",
    description:
      "Uses advanced chain-of-thought reasoning for complex problems",
  },

  // Ollama Models
  {
    id: "ollama-gpt-oss-20b",
    name: "GPT-OSS 20B",
    description: "Open source GPT model with 20B parameters via Ollama",
  },
  {
    id: "ollama-gpt-oss-120b",
    name: "GPT-OSS 120B",
    description: "Open source GPT model with 120B parameters via Ollama",
  },
  {
    id: "ollama-qwen3-32b",
    name: "Qwen3 32B",
    description: "Qwen3 model with 32B parameters via Ollama",
  },
  {
    id: "ollama-deepcoder-14b",
    name: "DeepCoder 14B",
    description: "Code generation model with 14B parameters via Ollama",
  },
  {
    id: "ollama-phi4-14b",
    name: "Phi-4 14B",
    description: "Microsoft Phi-4 model with 14B parameters via Ollama",
  },

  // Anthropic Models
  {
    id: "anthropic-claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "Anthropic's most capable model for complex reasoning tasks",
  },
  {
    id: "anthropic-claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    description: "Fast and efficient model for quick responses",
  },
  {
    id: "anthropic-claude-3-opus",
    name: "Claude 3 Opus",
    description: "Anthropic's flagship model for complex tasks",
  },
];
