FROM node:22.11-bookworm-slim
WORKDIR /worker
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
USER node
CMD [ "node", "index.js" ]