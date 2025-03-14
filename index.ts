import multipart from "@fastify/multipart";
import fastify from "fastify";
import { getFileFromRequest } from "./shared/get-file-from-request";
import { extractIbanFromFile } from "./use-cases/extract-iban-from-rib";

const server = fastify().register(multipart);

server.post("/extract-iban-from-rib", async (request, response) => {
  try {
    const { buffer, mimetype } = await getFileFromRequest(request);
    if (buffer.length === 0) throw new Error("Empty file");

    const result = await extractIbanFromFile({ buffer, mimetype });

    response.send(result);
  } catch (error) {
    console.error({ error });
    response.status(500).send(error);
  }
});

server.get("/health", async (_request, _response) => {
  return { status: "healthy" };
});

server.listen({ port: 8081, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
