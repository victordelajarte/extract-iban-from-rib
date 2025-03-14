import { extractText, getDocumentProxy } from "unpdf";
import type { ExtractionResult, ResultExtractor } from "./base-extractor";
import { Extractor } from "./base-extractor";

export class PDFExtractor extends Extractor {
  constructor(private readonly resultExtractor: ResultExtractor) {
    super();
  }

  async handle({ buffer, mimetype }: { buffer: Buffer; mimetype: string }): Promise<ExtractionResult> {
    console.log("Trying to extract IBAN from PDF...", { mimetype });
    if (mimetype !== "application/pdf") {
      console.log("❌ This is not a PDF file, skipping...");
      return this.next?.handle({ buffer, mimetype }) ?? { extractedText: "", isValid: false };
    }

    console.log("✅ Processing PDF...", { mimetype });
    const text = await this.extractText(buffer);
    const result = this.resultExtractor(text);

    if (result.isValid) {
      return result;
    }

    return this.next?.handle({ buffer, mimetype }) ?? { extractedText: "", isValid: false };
  }

  // from supabase/functions/shared/extractPDFText.ts
  private async extractText(buffer: Buffer) {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return Array.isArray(text) ? text.join(" ") : text;
  }
}
