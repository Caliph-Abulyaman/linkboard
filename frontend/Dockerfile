FROM node:22.11-bookworm-slim AS builder
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22.11-bookworm-slim
WORKDIR /frontend
COPY --from=builder /frontend/.next/standalone ./
COPY --from=builder /frontend/.next/static ./.next/static
COPY --from=builder /frontend/public/ ./public/
COPY --from=builder /frontend/healthcheck.js ./
USER node
CMD [ "node", "server.js" ]