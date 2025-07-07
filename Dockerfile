# Multi-stage build with environment variable support
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Accept build argument for TMDB API key
# VITE_ prefixed env vars are client-side by design and safe to expose
ARG VITE_TMDB_API_KEY
ENV VITE_TMDB_API_KEY=$VITE_TMDB_API_KEY

# Build the app (Vite will use the environment variable)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
