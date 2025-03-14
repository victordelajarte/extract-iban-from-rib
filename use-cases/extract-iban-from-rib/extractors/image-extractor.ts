import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { convertPdfToPng } from "../../convert-pdf-to-png";
import {
  Extractor,
  type ExtractionResult,
  type ResultExtractor,
} from "./base-extractor";

const extractTextFromImage = async (buffer: Buffer) => {
  const worker = await createWorker("fra", undefined);

  const result = await worker.recognize(buffer);

  await worker.terminate();
  return result.data.text;
};

const imageMimetypes = ["image/jpeg", "image/jpg", "image/png"];

export class ImageExtractor extends Extractor {
  constructor(private readonly resultExtractor: ResultExtractor) {
    super();
  }

  async handle({
    buffer,
    mimetype,
  }: {
    buffer: Buffer;
    mimetype: string;
  }): Promise<ExtractionResult> {
    console.log("Trying to extract IBAN from image...", { mimetype });
    if (!imageMimetypes.includes(mimetype) && mimetype !== "application/pdf") {
      console.log("❌ This is not an image file, skipping...");
      return (
        this.next?.handle({ buffer, mimetype }) ?? {
          extractedText: "",
          isValid: false,
        }
      );
    }

    const initialImageBuffer =
      mimetype === "application/pdf" ? await convertPdfToPng(buffer) : buffer;
    const dimensions = await sharp(initialImageBuffer).metadata();

    // Convert to jpg and resize to 300DPI to improve performance
    const grayResizedImageBuffer = await sharp(initialImageBuffer)
      .resize(
        Math.min(2480, dimensions.width ?? Number.POSITIVE_INFINITY),
        undefined,
        { fit: "inside" }
      )
      .grayscale()
      .jpeg()
      .toBuffer();

    const angles = [0, 90, 180, 270];
    for (const angle of angles) {
      const rotated = await sharp(grayResizedImageBuffer)
        .rotate(angle)
        .toBuffer();
      const dimensions = await sharp(rotated).metadata();
      if (!dimensions.height || !dimensions.width) {
        throw new Error("❌ Could not get dimensions of image, skipping...");
      }

      const numberOfParts = 2;
      const arrayOfParts = Array.from({ length: numberOfParts }, (_, i) => i);
      const partHeight = Math.floor(dimensions.height! / numberOfParts);
      const partTops = arrayOfParts.map((i) => i * partHeight);

      const parts = await Promise.all(
        partTops.map((top) =>
          sharp(rotated)
            .extract({
              left: 0,
              top,
              width: dimensions.width!,
              height: partHeight,
            })
            .toBuffer()
        )
      );

      const texts = await Promise.all(parts.map(extractTextFromImage));

      // console.log({ texts });
      const result = this.resultExtractor(texts.join("\n"));

      if (result.isValid) {
        return result;
      }
    }

    return (
      this.next?.handle({
        buffer: initialImageBuffer,
        mimetype: mimetype === "application/pdf" ? "image/png" : mimetype,
      }) ?? { extractedText: "", isValid: false }
    );
  }
}

export class ImageEnhanceExtractor extends Extractor {
  constructor(private readonly imageExtractor: ImageExtractor) {
    super();
  }

  async handle({
    buffer,
    mimetype,
  }: {
    buffer: Buffer;
    mimetype: string;
  }): Promise<ExtractionResult> {
    if (!imageMimetypes.includes(mimetype)) {
      console.log("❌ This is not an image file, skipping...");
      return (
        this.next?.handle({ buffer, mimetype }) ?? {
          extractedText: "",
          isValid: false,
        }
      );
    }

    console.log("Trying to enhance image and extract IBAN...", { mimetype });
    // Improve contrast
    const enhancedBuffer = await sharp(buffer).normalize().toBuffer();
    return this.imageExtractor.handle({ buffer: enhancedBuffer, mimetype });
  }
}
