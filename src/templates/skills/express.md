---
name: express
description: |
  Implements Express.js middleware patterns, routing, and API development.
  Use when: building REST APIs, implementing middleware chains, handling requests/responses, or organizing route handlers.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Express.js Skill

This skill covers Express.js 4.x/5.x for building REST APIs and web applications. Focuses on middleware patterns, error handling, and clean route organization.

## Quick Start

### Basic Server Setup

```typescript
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

// Security and parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### TypeScript Request/Response Types

```typescript
import type { Request, Response, NextFunction } from 'express';

interface CreateUserBody {
  email: string;
  name: string;
}

app.post('/api/users', (
  req: Request<{}, {}, CreateUserBody>,
  res: Response
) => {
  const { email, name } = req.body;
  // ...
});
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Middleware | Functions with access to req, res, next | Logging, auth, parsing |
| Router | Modular route handlers | Organize endpoints |
| Error Handling | 4-argument middleware | Centralized errors |
| Request | Incoming HTTP data | Body, params, query |
| Response | HTTP response methods | json, send, status |

## Common Patterns

### Authentication Middleware

**When:** Protecting routes that require authentication

```typescript
import type { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const user = await verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Usage
app.get('/api/profile', authenticate, (req: AuthRequest, res) => {
  res.json({ user: req.user });
});
```

### Async Error Handler

**When:** Handling async route handlers without try/catch everywhere

```typescript
type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

const asyncHandler = (fn: AsyncHandler) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await db.users.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }
  res.json(user);
}));
```

### Global Error Handler

**When:** Centralizing error responses

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Must be last middleware
app.use((
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err.stack);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  // Don't expose internal errors in production
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message,
  });
});
```

### Router Organization

**When:** Organizing routes by resource

```typescript
// routes/users.ts
import { Router } from 'express';

const router = Router();

router.get('/', listUsers);
router.get('/:id', getUser);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

// app.ts
import usersRouter from './routes/users';
import postsRouter from './routes/posts';

app.use('/api/users', usersRouter);
app.use('/api/posts', postsRouter);
```

## Request Validation

```typescript
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  age: z.number().int().positive().optional(),
});

function validate<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues
      });
    }
    req.body = result.data;
    next();
  };
}

app.post('/api/users', validate(createUserSchema), createUser);
```

## Pitfalls

- Always call `next()` in middleware (or send response)
- Error middleware must have 4 parameters
- Define error handler last
- Use helmet for security headers
- Validate all inputs
- Don't forget `return` after sending response in conditionals

## See Also

- [middleware](references/middleware.md) - Middleware patterns
- [routing](references/routing.md) - Route organization
- [errors](references/errors.md) - Error handling patterns
- [security](references/security.md) - Security best practices

## Related Skills

For Node.js patterns, see the **nodejs** skill. For validation, see the **zod** skill. For database, see the **prisma** or **drizzle** skills.

## Documentation Resources

> Fetch latest Express.js documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "express"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Middleware chain and error handling"
- "Router and route organization"
- "Request body parsing and validation"
- "Static files and templating"
