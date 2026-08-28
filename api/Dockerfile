FROM node:22.11-bookworm-slim
WORKDIR /api
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
USER node
EXPOSE 4000
CMD [ "node", "index.js" ]