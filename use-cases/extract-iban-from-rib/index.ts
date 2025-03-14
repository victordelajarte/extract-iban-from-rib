import type { ExtractionResult } from "./extractors/base-extractor";
import { ImageEnhanceExtractor, ImageExtractor } from "./extractors/image-extractor";
import { PDFExtractor } from "./extractors/pdf-extractor";
import { TextExtractor } from "./extractors/text-extractor";

const extractIbanFromText = (text: string) => {
  if (!text) return null;
  // cf https://stackoverflow.com/a/57080936 ordered by relevance (France first)
  const regexes = [
    /FR\s?[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){2}([0-9]{2})([a-zA-Z0-9]{2}\s?)([a-zA-Z0-9]{4}\s?){2}([a-zA-Z0-9]{1})([0-9]{2})\s?/,
    /FR\s?[a-zA-Z0-9]{2}\s?([0-9]{5}\s?){2}([a-zA-Z0-9]{11})\s?[a-zA-Z0-9]{2}\s?/, // format "FR79 10011 00000 0000000000P 00" for La Banque Postale for instance

    /BE[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){3}\s?/,
    /DE[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){4}([0-9]{2})\s?/,

    /AL[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){2}([a-zA-Z0-9]{4}\s?){4}\s?/,
    /AD[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){2}([a-zA-Z0-9]{4}\s?){3}\s?/,
    /AT[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){4}\s?/,
    /AZ[a-zA-Z0-9]{2}\s?([a-zA-Z0-9]{4}\s?){1}([0-9]{4}\s?){5}\s?/,
    /BH[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([a-zA-Z0-9]{4}\s?){3}([a-zA-Z0-9]{2})\s?/,
    /BY[a-zA-Z0-9]{2}\s?([a-zA-Z0-9]{4}\s?){1}([0-9]{4}\s?){5}\s?/,
    /BA[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){4}\s?/,
    /BR[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){5}([0-9]{3})([a-zA-Z]{1}\s?)([a-zA-Z0-9]{1})\s?/,
    /BG[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([0-9]{4}\s?){1}([0-9]{2})([a-zA-Z0-9]{2}\s?)([a-zA-Z0-9]{4}\s?){1}([a-zA-Z0-9]{2})\s?/,
    /CR[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){4}([0-9]{2})\s?/,
    /HR[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){4}([0-9]{1})\s?/,
    /CY[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){2}([a-zA-Z0-9]{4}\s?){4}\s?/,
    /CZ[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){5}\s?/,
    /DK[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){3}([0-9]{2})\s?/,
    /DO[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([0-9]{4}\s?){5}\s?/,
    /TL[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){4}([0-9]{3})\s?/,
    /EE[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){4}\s?/,
    /FO[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){3}([0-9]{2})\s?/,
    /FI[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){3}([0-9]{2})\s?/,
    /GE[a-zA-Z0-9]{2}\s?([a-zA-Z0-9]{2})([0-9]{2}\s?)([0-9]{4}\s?){3}([0-9]{2})\s?/,
    /GI[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([a-zA-Z0-9]{4}\s?){3}([a-zA-Z0-9]{3})\s?/,
    /GR[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){1}([0-9]{3})([a-zA-Z0-9]{1}\s?)([a-zA-Z0-9]{4}\s?){3}([a-zA-Z0-9]{3})\s?/,
    /GL[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){3}([0-9]{2})\s?/,
    /GT[a-zA-Z0-9]{2}\s?([a-zA-Z0-9]{4}\s?){1}([a-zA-Z0-9]{4}\s?){5}\s?/,
    /HU[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){6}\s?/,
    /IS[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){5}([0-9]{2})\s?/,
    /IE[a-zA-Z0-9]{2}\s?([a-zA-Z0-9]{4}\s?){1}([0-9]{4}\s?){3}([0-9]{2})\s?/,
    /IL[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){4}([0-9]{3})\s?/,
    /IT[a-zA-Z0-9]{2}\s?([a-zA-Z]{1})([0-9]{3}\s?)([0-9]{4}\s?){1}([0-9]{3})([a-zA-Z0-9]{1}\s?)([a-zA-Z0-9]{4}\s?){2}([a-zA-Z0-9]{3})\s?/,
    /JO[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([0-9]{4}\s?){5}([0-9]{2})\s?/,
    /KZ[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){3}([0-9]{1})([a-zA-Z0-9]{3}\s?)([a-zA-Z0-9]{4}\s?){2}([a-zA-Z0-9]{2})\s?/,
    /XK[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){1}([0-9]{4}\s?){2}([0-9]{2})([0-9]{2}\s?)\s?/,
    /KW[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([a-zA-Z0-9]{4}\s?){5}([a-zA-Z0-9]{2})\s?/,
    /LV[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([a-zA-Z0-9]{4}\s?){3}([a-zA-Z0-9]{1})\s?/,
    /LB[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){1}([a-zA-Z0-9]{4}\s?){5}\s?/,
    /LI[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){1}([0-9]{1})([a-zA-Z0-9]{3}\s?)([a-zA-Z0-9]{4}\s?){2}([a-zA-Z0-9]{1})\s?/,
    /LT[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){4}\s?/,
    /LU[a-zA-Z0-9]{2}\s?([0-9]{3})([a-zA-Z0-9]{1}\s?)([a-zA-Z0-9]{4}\s?){3}\s?/,
    /MK[a-zA-Z0-9]{2}\s?([0-9]{3})([a-zA-Z0-9]{1}\s?)([a-zA-Z0-9]{4}\s?){2}([a-zA-Z0-9]{1})([0-9]{2})\s?/,
    /MT[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([0-9]{4}\s?){1}([0-9]{1})([a-zA-Z0-9]{3}\s?)([a-zA-Z0-9]{4}\s?){3}([a-zA-Z0-9]{3})\s?/,
    /MR[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){5}([0-9]{3})\s?/,
    /MU[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([0-9]{4}\s?){4}([0-9]{3})([a-zA-Z]{1}\s?)([a-zA-Z]{2})\s?/,
    /MC[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){2}([0-9]{2})([a-zA-Z0-9]{2}\s?)([a-zA-Z0-9]{4}\s?){2}([a-zA-Z0-9]{1})([0-9]{2})\s?/,
    /MD[a-zA-Z0-9]{2}\s?([a-zA-Z0-9]{2})([a-zA-Z0-9]{2}\s?)([a-zA-Z0-9]{4}\s?){4}\s?/,
    /ME[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){4}([0-9]{2})\s?/,
    /NL[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([0-9]{4}\s?){2}([0-9]{2})\s?/,
    /NO[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){2}([0-9]{3})\s?/,
    /PK[a-zA-Z0-9]{2}\s?([a-zA-Z0-9]{4}\s?){1}([0-9]{4}\s?){4}\s?/,
    /PS[a-zA-Z0-9]{2}\s?([a-zA-Z0-9]{4}\s?){1}([0-9]{4}\s?){5}([0-9]{1})\s?/,
    /PL[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){6}\s?/,
    /PT[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){5}([0-9]{1})\s?/,
    /QA[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([a-zA-Z0-9]{4}\s?){5}([a-zA-Z0-9]{1})\s?/,
    /RO[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([a-zA-Z0-9]{4}\s?){4}\s?/,
    /SM[a-zA-Z0-9]{2}\s?([a-zA-Z]{1})([0-9]{3}\s?)([0-9]{4}\s?){1}([0-9]{3})([a-zA-Z0-9]{1}\s?)([a-zA-Z0-9]{4}\s?){2}([a-zA-Z0-9]{3})\s?/,
    /SA[a-zA-Z0-9]{2}\s?([0-9]{2})([a-zA-Z0-9]{2}\s?)([a-zA-Z0-9]{4}\s?){4}\s?/,
    /RS[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){4}([0-9]{2})\s?/,
    /SK[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){5}\s?/,
    /SI[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){3}([0-9]{3})\s?/,
    /ES[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){5}\s?/,
    /SE[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){5}\s?/,
    /CH[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){1}([0-9]{1})([a-zA-Z0-9]{3}\s?)([a-zA-Z0-9]{4}\s?){2}([a-zA-Z0-9]{1})\s?/,
    /TN[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){5}\s?/,
    /TR[a-zA-Z0-9]{2}\s?([0-9]{4}\s?){1}([0-9]{1})([a-zA-Z0-9]{3}\s?)([a-zA-Z0-9]{4}\s?){3}([a-zA-Z0-9]{2})\s?/,
    /AE[a-zA-Z0-9]{2}\s?([0-9]{3})([0-9]{1}\s?)([0-9]{4}\s?){3}([0-9]{3})\s?/,
    /GB[a-zA-Z0-9]{2}\s?([a-zA-Z]{4}\s?){1}([0-9]{4}\s?){3}([0-9]{2})\s?/,
    /VA[a-zA-Z0-9]{2}\s?([0-9]{3})([0-9]{1}\s?)([0-9]{4}\s?){3}([0-9]{2})\s?/,
    /VG[a-zA-Z0-9]{2}\s?([a-zA-Z0-9]{4}\s?){1}([0-9]{4}\s?){4}\s?/,
  ];

  for (const regex of regexes) {
    const match = text.match(regex);
    if (match) {
      return match[0].trim();
    }
  }
};

const cleanIban = (iban: string) => iban.toUpperCase().replaceAll(/[^A-Z0-9]/g, "");

// Inspiré de 20241025110353_validate_iban.sql
const isValidIban = (iban: string) => {
  const fixedIban = cleanIban(iban);

  if (fixedIban.length < 15 || fixedIban.length > 34) {
    return false;
  }

  const ibanWithStartMoved = fixedIban.substring(4) + fixedIban.substring(0, 4);

  const ibanWithLettersReplaced = ibanWithStartMoved.split("").reduce((acc, curr) => {
    if (curr.match(/[A-Z]/)) {
      return acc + (curr.charCodeAt(0) - 55);
    }
    return acc + curr;
  }, "");

  const ibanAsInt = BigInt(ibanWithLettersReplaced);
  return ibanAsInt % BigInt(97) === BigInt(1);
};

const getValidIbanVariant = (iban: string) => {
  if (!iban) return { iban: "", isValid: false };

  if (isValidIban(iban)) return { iban, isValid: true };

  const commonVariants: Record<string, string[]> = {
    "0": ["O"],
    "1": ["I", "L", "7"],
    "2": ["Z"],
    "4": ["1"],
    "5": ["S"],
    "6": ["G"],
    "7": ["I", "L", "1"],
    "8": ["B"],
    O: ["0"],
    I: ["1", "L", "7"],
    L: ["1", "I", "7"],
    Z: ["2"],
    S: ["5"],
    G: ["6"],
    B: ["8"],
  };

  const variants = [];

  for (let i = iban.length - 1; i >= 0; i--) {
    const char = iban[i];
    if (commonVariants[char]) {
      for (const variant of commonVariants[char]) {
        const newIban = iban.substring(0, i) + variant + iban.substring(i + 1);
        variants.push({
          iban: newIban,
          isValid: isValidIban(newIban),
        });
      }
    }
  }

  const validIbans = variants.filter((v) => v.isValid);
  if (validIbans.length === 1) return validIbans[0];

  // Here we should have human validation as the system can't decide
  if (validIbans.length > 1) {
    console.log("Multiple valid variants found for iban: ", iban, validIbans);
  }

  return { iban: "", isValid: false };
};

function extractIban(text: string): ExtractionResult {
  // Removes all special characters and multiple spaces to help the IBAN extraction by regex
  const cleanText = text.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, " ");
  // console.log({
  //   text,
  //   cleanText
  // })
  const iban = extractIbanFromText(cleanText);
  // console.log({ iban });
  if (!iban) {
    return { extractedText: "", isValid: false };
  }

  const variantResult = getValidIbanVariant(iban);
  return {
    extractedText: variantResult.iban,
    isValid: variantResult.isValid,
  };
}

/**
 * We use the "chain of responsibility" pattern to try different strategies to extract the IBAN from the RIB.
 * https://refactoring.guru/design-patterns/chain-of-responsibility
 */
export const extractIbanFromFile = async ({ buffer, mimetype }: { buffer: Buffer; mimetype: string }) => {
  const textExtractor = new TextExtractor(extractIban);
  const pdfExtractor = new PDFExtractor(extractIban);
  const imageExtractor = new ImageExtractor(extractIban);
  const imageEnhanceExtractor = new ImageEnhanceExtractor(new ImageExtractor(extractIban));

  textExtractor.setNext(pdfExtractor).setNext(imageExtractor).setNext(imageEnhanceExtractor);

  const result = await textExtractor.handle({ buffer, mimetype });
  return result;
};
