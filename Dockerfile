FROM node:20.18.0-alpine AS initial

WORKDIR /app

# Install dependencies using apk for Alpine
RUN apk add --no-cache \
    build-base \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

FROM initial AS build

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM initial AS final

WORKDIR /app

COPY --from=build /app/index.js /app/index.js
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/package-lock.json /app/package-lock.json

RUN npm install --only=production

EXPOSE 8081

CMD ["npm", "start"]