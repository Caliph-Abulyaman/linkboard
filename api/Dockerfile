FROM node:22.11-bookworm-slim
WORKDIR /api
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
USER node
EXPOSE 4000
CMD [ "node", "index.js" ]