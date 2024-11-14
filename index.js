const http = require("http");
const unpdf = require("unpdf");

const server = http.createServer((request, res) => {
  if (request.url === "/convert" && request.method === "POST") {
    console.log("Request received");
    const bodyChunks = [];
    request.on("data", (chunk) => {
      bodyChunks.push(chunk);
    });
    request.on("end", () => {
      const pdfBuffer = Buffer.concat(bodyChunks);
      require("canvas")
        .then((canvas) => {
          console.log('got canvas')
          return unpdf.renderPageAsImage(new Uint8Array(pdfBuffer), 1, {
            canvas,
          });
        })
        .then((imageBuffer) => {
          console.log('got image buffer')
          res.writeHead(200, { "Content-Type": "image/png" });
          res.end(imageBuffer.toBuffer());
        });
    });
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Route not found" }));
});

server.listen(5000, "localhost", () => {
  console.log("server is running on port 5000");
});
