export type ExtractionResult = {
  extractedText: string;
  isValid: boolean;
};

export type ResultExtractor = (text: string) => ExtractionResult;

export abstract class Extractor {
  protected next: Extractor | null = null;

  setNext(next: Extractor) {
    this.next = next;
    return next;
  }

  abstract handle(params: { buffer: Buffer; mimetype: string }): Promise<ExtractionResult>;
}
