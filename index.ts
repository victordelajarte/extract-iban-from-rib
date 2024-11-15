import multipart from "@fastify/multipart";
import fastify from "fastify";
import { writeFile } from "fs/promises";
import { renderPageAsImage } from "unpdf";

const server = fastify().register(multipart);

const SAVE_IMAGE = false;

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

        const pdfBuffer = Buffer.concat(chunks);
        const image = await renderPageAsImage(new Uint8Array(pdfBuffer), 1, {
            canvas: () => import("canvas"),
            width: 2480, // Width of an A4 paper in pixels, we get better quality with higher resolution
        });
        const imageBuffer = Buffer.from(image);

        if (SAVE_IMAGE) {
            await writeFile("output/image.png", imageBuffer);
        }

        response.header("Content-Type", "image/png");
        response.send(imageBuffer);
    } catch (error) {
        console.error({ error });
        response.status(500).send({ error });
    }
});

server.get("/", async (_request, _response) => {
    return { message: "Hello, world!" };
})

server.listen({ port: 8081, host: '0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
