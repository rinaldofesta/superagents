---
name: drizzle
description: |
  Implements Drizzle ORM schema definitions, type-safe queries, and migrations.
  Use when: defining database schemas in TypeScript, writing SQL-like queries, or managing database migrations with Drizzle.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Drizzle ORM Skill

This skill covers Drizzle ORM - a lightweight, type-safe SQL ORM for TypeScript. Focuses on SQL-like query building with full type inference and minimal runtime overhead.

## Quick Start

### Schema Definition

```typescript
// db/schema.ts
import { pgTable, serial, varchar, integer, timestamp, boolean, text } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 256 }).unique().notNull(),
  name: varchar('name', { length: 256 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 256 }).notNull(),
  content: text('content'),
  published: boolean('published').default(false).notNull(),
  authorId: integer('author_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type inference
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Basic Queries

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from './schema';

const db = drizzle(pool, { schema });

// Select
const allUsers = await db.select().from(users);

// Insert
await db.insert(users).values({ email: 'user@example.com', name: 'John' });
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Schema | TypeScript-first table definitions | Define database structure |
| Query Builder | SQL-like and relational APIs | Data access |
| Drizzle Kit | CLI for migrations | Schema management |
| Dialects | PostgreSQL, MySQL, SQLite | Database support |
| Type Inference | `$inferSelect`, `$inferInsert` | TypeScript types from schema |

## Common Patterns

### Complex Queries with Joins

**When:** Fetching related data

```typescript
import { eq, and, or, desc, like, sql } from 'drizzle-orm';

// Inner join
const postsWithAuthors = await db
  .select({
    post: posts,
    authorName: users.name,
  })
  .from(posts)
  .innerJoin(users, eq(posts.authorId, users.id))
  .where(eq(posts.published, true))
  .orderBy(desc(posts.createdAt));

// Left join with aggregation
const usersWithPostCount = await db
  .select({
    user: users,
    postCount: sql<number>`count(${posts.id})`.as('post_count'),
  })
  .from(users)
  .leftJoin(posts, eq(users.id, posts.authorId))
  .groupBy(users.id);
```

### Search and Filter

**When:** Building dynamic query APIs

```typescript
async function searchPosts(params: {
  search?: string;
  authorId?: number;
  published?: boolean;
  limit?: number;
  offset?: number;
}) {
  const conditions = [];

  if (params.search) {
    conditions.push(
      or(
        like(posts.title, `%${params.search}%`),
        like(posts.content, `%${params.search}%`)
      )
    );
  }
  if (params.authorId) {
    conditions.push(eq(posts.authorId, params.authorId));
  }
  if (params.published !== undefined) {
    conditions.push(eq(posts.published, params.published));
  }

  return db
    .select()
    .from(posts)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(params.limit || 10)
    .offset(params.offset || 0)
    .orderBy(desc(posts.createdAt));
}
```

### Transactions

**When:** Multiple operations that must succeed together

```typescript
async function createPostWithTags(
  postData: NewPost,
  tagIds: number[]
) {
  return db.transaction(async (tx) => {
    const [post] = await tx
      .insert(posts)
      .values(postData)
      .returning();

    if (tagIds.length > 0) {
      await tx.insert(postTags).values(
        tagIds.map(tagId => ({ postId: post.id, tagId }))
      );
    }

    return post;
  });
}
```

## Configuration

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## Migration Commands

```bash
# Generate SQL migrations from schema changes
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate

# Push schema directly (development only)
npx drizzle-kit push

# Open Drizzle Studio GUI
npx drizzle-kit studio
```

## Pitfalls

- Use `$inferSelect` and `$inferInsert` for type inference
- Remember to run `generate` after schema changes
- Use transactions for multi-table operations
- SQL-like API is more flexible but relational API is simpler
- Always use parameterized queries (Drizzle handles this automatically)
- Handle null values explicitly in schema definitions

## See Also

- [schema](references/schema.md) - Schema definition patterns
- [queries](references/queries.md) - Query building patterns
- [relations](references/relations.md) - Relational queries
- [migrations](references/migrations.md) - Migration strategies

## Related Skills

For TypeScript patterns, see the **typescript** skill. For alternative ORM, see the **prisma** skill. For API building, see the **express** or **fastapi** skills.

## Documentation Resources

> Fetch latest Drizzle ORM documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "drizzle-orm"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Select queries with joins"
- "Transactions and batch operations"
- "Relations and nested queries"
- "PostgreSQL specific features"
