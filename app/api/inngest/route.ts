import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { parseDocumentFunction } from "@/lib/inngest/functions/parse-document";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [parseDocumentFunction],
});
