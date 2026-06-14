FROM node:22-bookworm-slim AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

FROM deps AS dev

COPY . .

EXPOSE 4321
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM deps AS build

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS preview

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY --from=build /app/dist ./dist
COPY wrangler.jsonc ./

EXPOSE 4321
CMD ["npx", "wrangler", "dev", "--local", "--ip", "0.0.0.0", "--port", "4321"]
