import type { UserType } from "@/app/(auth)/auth";
import type { ChatModel } from "./models";

type Entitlements = {
  maxMessagesPerDay: number;
  availableChatModelIds: ChatModel["id"][];
};

export const entitlementsByUserType: Record<UserType, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: [
      "chat-model",
      "chat-model-reasoning",
      "ollama-gpt-oss-20b",
      "ollama-qwen3-32b",
      "ollama-deepcoder-14b",
      "ollama-phi4-14b",
      "anthropic-claude-3-5-haiku",
    ],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: [
      "chat-model",
      "chat-model-reasoning",
      "ollama-gpt-oss-20b",
      "ollama-gpt-oss-120b",
      "ollama-qwen3-32b",
      "ollama-deepcoder-14b",
      "ollama-phi4-14b",
      "anthropic-claude-3-5-sonnet",
      "anthropic-claude-3-5-haiku",
      "anthropic-claude-3-opus",
    ],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
