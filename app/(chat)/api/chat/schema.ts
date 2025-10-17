import { z } from "zod";

const textPartSchema = z.object({
  type: z.enum(["text"]),
  text: z.string().min(1).max(2000),
});

const filePartSchema = z.object({
  type: z.enum(["file"]),
  mediaType: z.enum(["image/jpeg", "image/png"]),
  name: z.string().min(1).max(100),
  url: z.string().url(),
});

const partSchema = z.union([textPartSchema, filePartSchema]);

export const postRequestBodySchema = z.object({
  id: z.string().uuid(),
  message: z.object({
    id: z.string().uuid(),
    role: z.enum(["user"]),
    parts: z.array(partSchema),
  }),
  selectedChatModel: z.enum([
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
  ]),
  selectedVisibilityType: z.enum(["public", "private"]),
});

export type PostRequestBody = z.infer<typeof postRequestBodySchema>;
