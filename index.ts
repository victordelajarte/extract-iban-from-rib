import multipart from '@fastify/multipart';
import fastify from 'fastify';
import { writeFileSync } from 'fs';
import { renderPageAsImage } from 'unpdf';

const server = fastify().register(multipart);

server.post('/', async (request, response) => {
    console.log('Converting PDF to image');
    const parts = await request.file();
    if (!parts) {
        console.log('No parts found');
        throw new Error('No parts found');
    }

    const chunks = [];
    for await (const chunk of parts.file) {
        chunks.push(chunk);
    }

    const pdfBuffer = Buffer.concat(chunks);
    const image = await renderPageAsImage(new Uint8Array(pdfBuffer), 1, {
        canvas: () => import("canvas"),
    });
    const imageBuffer = Buffer.from(image);
    response.header('Content-Type', 'image/png');

    writeFileSync('./output/image.png', imageBuffer);

    response.send(imageBuffer);
})

server.listen({ port: 5000 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})