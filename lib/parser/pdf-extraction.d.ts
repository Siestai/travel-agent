declare module "pdf-extraction" {
  export interface ExtractResult {
    text: string;
    info?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }

  function pdfExtraction(buffer: Buffer): Promise<ExtractResult>;
  export default pdfExtraction;
}
