FROM node:18-alpine

WORKDIR /app

# Install ALL dependencies (including dev)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build with tsc
RUN npm run build

# Now remove devDependencies for production
RUN npm prune --production

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/server.js"]