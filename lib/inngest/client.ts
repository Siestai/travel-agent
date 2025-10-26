import { Inngest } from "inngest";

// For local development, if INNGEST_EVENT_KEY is not set, use a mock
const eventKey = process.env.INNGEST_EVENT_KEY || "dev-key-not-set";

export const inngest = new Inngest({
  id: "siestai-travel-agent",
  eventKey,
});
