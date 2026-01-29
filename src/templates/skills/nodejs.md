---
name: nodejs
description: |
  Configures Node.js runtime, module patterns, and server-side APIs.
  Use when: writing Node.js server code, working with async operations, file system, child processes, or configuring ESM/CommonJS modules.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Node.js Skill

This skill covers Node.js 20+ development with ESM modules, async patterns, and modern APIs. Focuses on server-side JavaScript best practices for building CLI tools, APIs, and backend services.

## Quick Start

### Environment Configuration

```typescript
// Always validate environment at startup
const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiKey: process.env.API_KEY,
} as const;

if (!config.apiKey) {
  console.error('Missing required API_KEY environment variable');
  process.exit(1);
}
```

### Async File Operations

```typescript
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

async function loadConfig(path: string): Promise<Config> {
  const content = await readFile(path, 'utf-8');
  return JSON.parse(content);
}

async function ensureDir(dir: string): Promise<void> {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| ESM | ES Modules (import/export) | Modern module system |
| Async/Await | Non-blocking I/O | API calls, file operations |
| Streams | Efficient data processing | Large files, real-time data |
| Process | Environment and lifecycle | Config, graceful shutdown |
| Worker Threads | CPU-bound parallelism | Heavy computations |

## Common Patterns

### Graceful Shutdown

**When:** Building long-running services

```typescript
const shutdown = async (signal: string) => {
  console.log(`Received ${signal}, shutting down gracefully...`);

  // Close server, database connections, etc.
  await server.close();
  await db.disconnect();

  process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});
```

### Parallel Execution with Concurrency Control

**When:** Processing multiple items with rate limiting

```typescript
async function processWithConcurrency<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const promise = processor(item).then((result) => {
      results.push(result);
    });
    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }

  await Promise.all(executing);
  return results;
}
```

### Stream Processing

**When:** Handling large files or real-time data

```typescript
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';

async function processLargeFile(input: string, output: string) {
  const transform = new Transform({
    transform(chunk, encoding, callback) {
      // Process chunk
      const processed = chunk.toString().toUpperCase();
      callback(null, processed);
    }
  });

  await pipeline(
    createReadStream(input),
    transform,
    createWriteStream(output)
  );
}
```

## Pitfalls

- Don't block the event loop with sync operations
- Handle unhandled promise rejections
- Use `path.join()` for cross-platform paths
- Validate environment variables at startup
- Use `.js` extensions in ESM imports

## See Also

- [async](references/async.md) - Async patterns and error handling
- [streams](references/streams.md) - Stream processing patterns
- [modules](references/modules.md) - ESM vs CommonJS
- [process](references/process.md) - Process management

## Related Skills

For TypeScript-specific patterns, see the **typescript** skill. For CLI building, see the **commander** skill. For file operations, see the **fs-extra** skill.

## Documentation Resources

> Fetch latest Node.js documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "nodejs"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "fs promises API readFile writeFile"
- "ESM module resolution"
- "Stream pipeline and transform"
- "Child process spawn exec"
