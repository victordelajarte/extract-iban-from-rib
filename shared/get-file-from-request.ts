import type { FastifyRequest } from "fastify";

export const getFileFromRequest = async (request: FastifyRequest) => {
  const parts = await request.file();
  if (!parts) {
    console.log("No parts found");
    throw new Error("No parts found");
  }

  const chunks = [];
  for await (const chunk of parts.file) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  const mimetype = parts.mimetype;

  return { buffer, mimetype };
};
