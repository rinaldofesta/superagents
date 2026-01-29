---
name: graphql
description: |
  Implements GraphQL schema design, resolvers, and client-side queries.
  Use when: designing GraphQL schemas, writing resolvers, implementing subscriptions, or consuming GraphQL APIs.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# GraphQL Skill

This skill covers GraphQL API development - schema design, resolver patterns, and client integration. Focuses on building type-safe, efficient APIs with proper data loading and error handling.

## Quick Start

### Schema Definition

```graphql
type User {
  id: ID!
  email: String!
  name: String
  posts: [Post!]!
  createdAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String
  published: Boolean!
  author: User!
}

type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  post(id: ID!): Post
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User
  createPost(input: CreatePostInput!): Post!
}

input CreateUserInput {
  email: String!
  name: String
}
```

### Basic Resolver

```typescript
const resolvers = {
  Query: {
    user: (_, { id }, context) => {
      return context.db.user.findUnique({ where: { id } });
    },
  },
  User: {
    posts: (parent, _, context) => {
      return context.db.post.findMany({ where: { authorId: parent.id } });
    },
  },
};
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Schema | Type definitions | API contract |
| Queries | Read operations | Fetch data |
| Mutations | Write operations | Create/Update/Delete |
| Resolvers | Field resolution logic | Data fetching |
| Subscriptions | Real-time updates | Live data |
| DataLoader | Batching and caching | N+1 prevention |

## Common Patterns

### Resolver with DataLoader

**When:** Preventing N+1 query problems

```typescript
import DataLoader from 'dataloader';

// Create loaders per request
function createLoaders(db: Database) {
  return {
    userLoader: new DataLoader<string, User>(async (ids) => {
      const users = await db.user.findMany({
        where: { id: { in: [...ids] } }
      });
      const userMap = new Map(users.map(u => [u.id, u]));
      return ids.map(id => userMap.get(id) || null);
    }),

    postsByAuthorLoader: new DataLoader<string, Post[]>(async (authorIds) => {
      const posts = await db.post.findMany({
        where: { authorId: { in: [...authorIds] } }
      });
      const grouped = new Map<string, Post[]>();
      posts.forEach(post => {
        const list = grouped.get(post.authorId) || [];
        list.push(post);
        grouped.set(post.authorId, list);
      });
      return authorIds.map(id => grouped.get(id) || []);
    }),
  };
}

// Use in resolvers
const resolvers = {
  User: {
    posts: (parent, _, { loaders }) => {
      return loaders.postsByAuthorLoader.load(parent.id);
    },
  },
  Post: {
    author: (parent, _, { loaders }) => {
      return loaders.userLoader.load(parent.authorId);
    },
  },
};
```

### Input Validation

**When:** Validating mutation inputs

```typescript
import { z } from 'zod';
import { GraphQLError } from 'graphql';

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100).optional(),
});

const resolvers = {
  Mutation: {
    createUser: async (_, { input }, context) => {
      const result = createUserSchema.safeParse(input);

      if (!result.success) {
        throw new GraphQLError('Validation failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            errors: result.error.issues,
          },
        });
      }

      return context.db.user.create({ data: result.data });
    },
  },
};
```

### Subscriptions with Redis PubSub

**When:** Building real-time features

```typescript
import { createPubSub } from 'graphql-yoga';

const pubsub = createPubSub<{
  'POST_CREATED': [payload: { postCreated: Post }];
  'POST_UPDATED': [payload: { postUpdated: Post }];
}>();

const resolvers = {
  Mutation: {
    createPost: async (_, { input }, context) => {
      const post = await context.db.post.create({ data: input });

      pubsub.publish('POST_CREATED', { postCreated: post });

      return post;
    },
  },
  Subscription: {
    postCreated: {
      subscribe: () => pubsub.subscribe('POST_CREATED'),
    },
  },
};
```

### Pagination with Cursor

**When:** Implementing efficient list pagination

```graphql
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type PostEdge {
  cursor: String!
  node: Post!
}

type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type Query {
  posts(first: Int, after: String, last: Int, before: String): PostConnection!
}
```

```typescript
const resolvers = {
  Query: {
    posts: async (_, { first = 10, after }, context) => {
      const posts = await context.db.post.findMany({
        take: first + 1, // Fetch one extra to check hasNextPage
        cursor: after ? { id: after } : undefined,
        skip: after ? 1 : 0,
        orderBy: { createdAt: 'desc' },
      });

      const hasNextPage = posts.length > first;
      const edges = posts.slice(0, first).map(post => ({
        cursor: post.id,
        node: post,
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          hasPreviousPage: !!after,
          startCursor: edges[0]?.cursor,
          endCursor: edges[edges.length - 1]?.cursor,
        },
        totalCount: await context.db.post.count(),
      };
    },
  },
};
```

## Client Usage

```typescript
// Apollo Client
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      posts {
        id
        title
      }
    }
  }
`;

function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useQuery(GET_USER, {
    variables: { id: userId },
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <Profile user={data.user} />;
}
```

## Pitfalls

- N+1 problem: Use DataLoader for batching
- Over-fetching: Request only needed fields
- Security: Implement depth limiting and query complexity
- Caching: Use Apollo cache or similar client-side caching
- Error handling: Use proper GraphQL error extensions
- Authentication: Validate context in resolvers

## See Also

- [schema](references/schema.md) - Schema design patterns
- [resolvers](references/resolvers.md) - Resolver patterns
- [security](references/security.md) - Security best practices
- [performance](references/performance.md) - Performance optimization

## Related Skills

For database access, see the **prisma** or **drizzle** skills. For Node.js patterns, see the **nodejs** skill.

## Documentation Resources

> Fetch latest GraphQL documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "graphql"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Schema definition and types"
- "Resolver patterns and context"
- "Subscriptions and real-time"
- "DataLoader batching"
