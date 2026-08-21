FROM node:22.11-bookworm-slim AS builder
WORKDIR /frontend
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22.11-bookworm-slim
WORKDIR /frontend
COPY --from=builder /frontend/.next .next
COPY --from=builder /frontend/node_modules node_modules
COPY --from=builder /frontend/public/ public/
COPY --from=builder /frontend/next.config.mjs next.config.mjs
COPY --from=builder /frontend/package.json package.json
USER node
CMD [ "npm", "start" ]