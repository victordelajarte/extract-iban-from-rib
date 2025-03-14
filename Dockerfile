FROM node:22.13.1-alpine3.21 AS initial

WORKDIR /app

RUN apk update && apk upgrade

# Install dependencies using apk for Alpine
RUN apk add --no-cache \
    build-base=0.5-r3 \
    cairo-dev=1.18.2-r1 \
    pango-dev=1.54.0-r1 \
    jpeg-dev=9f-r0 \
    giflib-dev=5.2.2-r0 \
    librsvg-dev=2.59.2-r0

FROM initial AS build

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM initial AS final

WORKDIR /app

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/dist /app/dist
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/package-lock.json /app/package-lock.json

RUN npm install --only=production

# Change ownership and restrict file permissions
RUN chown -R appuser:appgroup /app && chmod -R 750 /app

# Switch to the non-root user
USER appuser

EXPOSE 8081

CMD ["npm", "start"]