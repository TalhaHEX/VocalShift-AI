FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application source
COPY . .

# Set public API URL for browser requests
ENV NEXT_PUBLIC_API_URL=http://localhost:3003
ENV NODE_ENV=production

# Build Next.js application
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]
