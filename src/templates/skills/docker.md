---
name: docker
description: |
  Implements Docker containerization, multi-stage builds, and Docker Compose orchestration.
  Use when: writing Dockerfiles, optimizing container images, configuring Docker Compose, or debugging container issues.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Docker Skill

This skill covers Docker containerization best practices for Node.js and other applications. Focuses on building secure, optimized images and managing multi-container environments with Docker Compose.

## Quick Start

### Basic Node.js Dockerfile

```dockerfile
# Use specific version, not 'latest'
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Use non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start command
CMD ["node", "dist/index.js"]
```

### .dockerignore

```
node_modules
npm-debug.log
dist
.git
.env
.env.*
*.md
.DS_Store
coverage
.nyc_output
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Image | Immutable template | Application packaging |
| Container | Running instance of image | Isolated execution |
| Dockerfile | Build instructions | Create custom images |
| Compose | Multi-container orchestration | Development environments |
| Volume | Persistent data storage | Database data |
| Network | Container communication | Service discovery |

## Common Patterns

### Multi-stage Build

**When:** Reducing production image size

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Security: run as non-root
USER node

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Development with Hot Reload

**When:** Local development with file watching

```dockerfile
# Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Don't copy source - we'll mount it as a volume
EXPOSE 3000

CMD ["npm", "run", "dev"]
```

```yaml
# docker-compose.dev.yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - ./src:/app/src
      - ./package.json:/app/package.json
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
```

### Full Stack Docker Compose

**When:** Running multiple services together

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
```

### Security Hardened Image

**When:** Building production-ready secure images

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy files with correct ownership
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules

# Switch to non-root user
USER appuser

# Use dumb-init as PID 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

## Common Commands

```bash
# Build image
docker build -t myapp:latest .
docker build -t myapp:latest -f Dockerfile.prod .

# Run container
docker run -d -p 3000:3000 --name myapp myapp:latest
docker run -it --rm myapp:latest sh  # Interactive shell

# Docker Compose
docker compose up -d          # Start all services (detached)
docker compose down           # Stop all services
docker compose logs -f app    # Follow logs
docker compose exec app sh    # Shell into running container
docker compose ps             # List running services

# Debugging
docker logs myapp             # View container logs
docker exec -it myapp sh      # Shell into running container
docker inspect myapp          # Container details

# Cleanup
docker system prune -a        # Remove unused images/containers
docker volume prune           # Remove unused volumes
docker builder prune          # Clear build cache
```

## Pitfalls

- Don't run as root in production
- Use specific image tags, not `latest`
- Don't store secrets in images (use environment variables)
- Use .dockerignore to reduce image size
- Order Dockerfile instructions for cache efficiency
- Use multi-stage builds for smaller production images
- Add health checks for orchestration
- Handle signals properly (use dumb-init or tini)

## See Also

- [optimization](references/optimization.md) - Image optimization
- [security](references/security.md) - Container security
- [compose](references/compose.md) - Docker Compose patterns
- [networking](references/networking.md) - Container networking

## Related Skills

For Node.js patterns, see the **nodejs** skill. For CI/CD, see infrastructure documentation.

## Documentation Resources

> Fetch latest Docker documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "docker"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Dockerfile best practices"
- "Multi-stage build optimization"
- "Docker Compose networking"
- "Health checks and orchestration"
