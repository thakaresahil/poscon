FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY . .

USER node
EXPOSE 9000

# Apply migrations and load sample data into an empty database, then start the API
CMD ["sh", "-c", "npm run db:setup && node server.js"]
