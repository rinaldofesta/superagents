---
name: typescript
description: |
  Enforces TypeScript strict mode, type patterns, and type-safe development.
  Use when: writing TypeScript code, defining types/interfaces, fixing type errors, or configuring tsconfig.json.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# TypeScript Skill

This skill covers TypeScript 5.x development with **strict mode** and ESM modules. All code must pass type checking with `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, and `noFallthroughCasesInSwitch` enabled.

## Quick Start

### Type-Only Imports

```typescript
// ALWAYS use type keyword for type-only imports
import type { UserProfile, AuthState } from './types.js';
import type { Request, Response } from 'express';

// Mixed imports: values and types
import fs from 'fs-extra';
import type { Stats } from 'fs-extra';
```

### Interface Definition Pattern

```typescript
// Explicit types, no inference for public APIs
export interface CacheEntry<T> {
  version: string;
  hash: string;
  timestamp: string;
  data: T;
}

// Use union types for constrained string values
export type AuthMethod = 'oauth' | 'api-key' | 'session';
```

## Key Concepts

| Concept | Usage | Example |
|---------|-------|---------|
| Strict mode | Always enabled | `"strict": true` in tsconfig |
| ESM imports | Use `.js` extension | `import { x } from './utils.js'` |
| Type imports | Separate with `type` keyword | `import type { T } from './types.js'` |
| Unused params | Prefix with underscore | `(_unused, value) => value` |
| Union types | For constrained values | `'option1' \| 'option2'` |
| Generic constraints | For reusable patterns | `<T extends object>` |

## Common Patterns

### Type-Safe API Responses

**When:** Building services that return structured data

```typescript
interface ApiResponse<T> {
  data: T;
  error?: string;
  meta?: { timestamp: string; version: string };
}

async function fetchUser(id: string): Promise<ApiResponse<User>> {
  try {
    const user = await db.users.findUnique({ where: { id } });
    return { data: user };
  } catch (error) {
    return { data: null, error: 'User not found' };
  }
}
```

### Discriminated Unions

**When:** Handling multiple states or variants

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

function processResult<T>(result: Result<T>): T {
  if (result.success) {
    return result.data; // TypeScript knows data exists here
  }
  throw result.error;
}
```

### Type Guards

**When:** Narrowing types at runtime

```typescript
interface Dog { bark(): void; breed: string; }
interface Cat { meow(): void; color: string; }

function isDog(animal: Dog | Cat): animal is Dog {
  return 'bark' in animal;
}

function handleAnimal(animal: Dog | Cat) {
  if (isDog(animal)) {
    animal.bark(); // TypeScript knows this is a Dog
  } else {
    animal.meow(); // TypeScript knows this is a Cat
  }
}
```

## Pitfalls

- Avoid `any` - use `unknown` for truly unknown types
- Don't ignore type errors with `// @ts-ignore`
- Prefer interfaces for objects, types for unions
- Use `satisfies` for const objects with inferred types
- Always use `.js` extensions in import paths for ESM

## See Also

- [patterns](references/patterns.md) - Idiomatic TypeScript patterns
- [types](references/types.md) - Type definition strategies
- [modules](references/modules.md) - ESM module patterns
- [errors](references/errors.md) - Error handling with types

## Related Skills

For Node.js-specific patterns, see the **nodejs** skill. For validation, see the **zod** skill. For testing, see the **vitest** skill.

## Documentation Resources

> Fetch latest TypeScript documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "typescript"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code repositories
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Utility types Pick Omit Partial"
- "Type inference and narrowing"
- "Strict mode configuration options"
- "Generic constraints and conditional types"
