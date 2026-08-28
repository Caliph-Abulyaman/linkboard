FROM node:22.11-bookworm-slim
WORKDIR /worker
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
USER node
CMD [ "node", "index.js" ]