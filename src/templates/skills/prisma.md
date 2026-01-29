---
name: prisma
description: |
  Implements Prisma ORM schema design, migrations, and type-safe database queries.
  Use when: defining database schemas, writing migrations, performing CRUD operations, or optimizing database queries.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Prisma Skill

This skill covers Prisma ORM for Node.js and TypeScript with declarative data modeling, type-safe queries, and migration management. Focuses on building robust database layers with full TypeScript integration.

## Quick Start

### Schema Definition

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### Basic Client Usage

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create
const user = await prisma.user.create({
  data: { email: 'user@example.com', name: 'John' }
});

// Read with relations
const userWithPosts = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true }
});
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Schema | Declarative data model in .prisma files | Define tables, relations, constraints |
| Client | Auto-generated type-safe query builder | CRUD operations |
| Migrate | Schema migration system | Database versioning |
| Studio | GUI for database exploration | Data visualization |
| Relations | One-to-one, one-to-many, many-to-many | Data relationships |

## Common Patterns

### Complex Queries with Filters

**When:** Building search and filter APIs

```typescript
async function searchPosts(params: {
  search?: string;
  authorId?: number;
  published?: boolean;
  skip?: number;
  take?: number;
}) {
  const { search, authorId, published, skip = 0, take = 10 } = params;

  return prisma.post.findMany({
    where: {
      AND: [
        search ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        authorId ? { authorId } : {},
        published !== undefined ? { published } : {},
      ],
    },
    include: { author: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
}
```

### Transactions

**When:** Operations that must succeed or fail together

```typescript
async function transferCredits(fromId: number, toId: number, amount: number) {
  return prisma.$transaction(async (tx) => {
    // Deduct from sender
    const sender = await tx.user.update({
      where: { id: fromId },
      data: { credits: { decrement: amount } },
    });

    if (sender.credits < 0) {
      throw new Error('Insufficient credits');
    }

    // Add to recipient
    await tx.user.update({
      where: { id: toId },
      data: { credits: { increment: amount } },
    });

    return { success: true };
  });
}
```

### Nested Writes

**When:** Creating related records together

```typescript
async function createUserWithPosts(data: {
  email: string;
  name: string;
  posts: { title: string; content?: string }[];
}) {
  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      posts: {
        create: data.posts,
      },
    },
    include: { posts: true },
  });
}
```

## Migration Commands

```bash
# Create migration (development)
npx prisma migrate dev --name add_user_role

# Apply migrations (production)
npx prisma migrate deploy

# Quick sync without migration (dev only)
npx prisma db push

# Regenerate client after schema changes
npx prisma generate

# Open database GUI
npx prisma studio

# Reset database (development)
npx prisma migrate reset
```

## Pitfalls

- Always validate user input before queries
- Use transactions for multi-model operations
- Don't expose raw Prisma client to API responses
- Remember to regenerate client after schema changes
- Use `select` instead of `include` when you need specific fields
- Handle unique constraint violations gracefully

## See Also

- [schema](references/schema.md) - Schema design patterns
- [queries](references/queries.md) - Query optimization
- [relations](references/relations.md) - Relationship patterns
- [migrations](references/migrations.md) - Migration strategies

## Related Skills

For TypeScript patterns, see the **typescript** skill. For alternative ORM, see the **drizzle** skill. For testing, see the **vitest** skill.

## Documentation Resources

> Fetch latest Prisma documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "prisma"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Relations one-to-many many-to-many"
- "Transactions and nested writes"
- "Filtering and pagination"
- "Raw SQL queries"
