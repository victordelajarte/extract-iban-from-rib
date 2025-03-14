import { renderPageAsImage } from "unpdf";


export const convertPdfToPng = async (pdfBuffer: Buffer) => {
  const image = await renderPageAsImage(new Uint8Array(pdfBuffer), 1, {
    canvas: () => import("canvas"),
    width: 2480, // Width of an A4 paper in pixels, we get better quality with higher resolution
  });
  const imageBuffer = Buffer.from(image);
  return imageBuffer;
};
