import type { ExtractionResult, ResultExtractor } from "./base-extractor";
import { Extractor } from "./base-extractor";
export class TextExtractor extends Extractor {
  constructor(private readonly resultExtractor: ResultExtractor) {
    super();
  }

  async handle({ buffer, mimetype }: { buffer: Buffer; mimetype: string }): Promise<ExtractionResult> {
    console.log("Trying to extract IBAN from text file...", { mimetype });
    if (mimetype !== "text/plain") {
      console.log("❌ This is not a text file, skipping...");
      return this.next?.handle({ buffer, mimetype }) ?? { extractedText: "", isValid: false };
    }

    console.log("✅ Processing text file...", { mimetype });
    const text = buffer.toString("utf-8");
    const result = this.resultExtractor(text);

    if (result.isValid) {
      return result;
    }

    return this.next?.handle({ buffer, mimetype }) ?? { extractedText: "", isValid: false };
  }
}
