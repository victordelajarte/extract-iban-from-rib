import multipart from "@fastify/multipart";
import fastify from "fastify";
import { renderPageAsImage } from "unpdf";

const server = fastify().register(multipart);

server.post("/convert", async (request, response) => {
    try {
        console.log("Converting PDF to image");
        const parts = await request.file();
        if (!parts) {
            console.log("No parts found");
            throw new Error("No parts found");
        }

        const chunks = [];
        for await (const chunk of parts.file) {
            chunks.push(chunk);
        }
        console.log("Got chunks", chunks.length);

        const pdfBuffer = Buffer.concat(chunks);
        const image = await renderPageAsImage(new Uint8Array(pdfBuffer), 1, {
            canvas: () => import("canvas"),
        });
        const imageBuffer = Buffer.from(image);
        response.header("Content-Type", "image/png");

        response.send(imageBuffer);
    } catch (error) {
        console.error({ error });
        response.status(500).send({ error });
    }
});

server.listen({ port: 5000 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
