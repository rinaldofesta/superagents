---
name: nextjs
description: |
  Implements Next.js App Router patterns, server components, and API routes.
  Use when: building Next.js applications, implementing SSR/SSG, creating API routes, or optimizing for performance.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Next.js Skill

This skill covers Next.js 14+ with App Router, Server Components, and modern data fetching patterns. Focuses on building full-stack React applications with optimal performance.

## Quick Start

### Server Component with Data Fetching

```tsx
// app/users/page.tsx (Server Component by default)
async function UsersPage() {
  const users = await fetch('https://api.example.com/users', {
    next: { revalidate: 3600 } // Revalidate every hour
  }).then(res => res.json());

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map((user: User) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default UsersPage;
```

### Client Component

```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| App Router | File-based routing | Pages in app/ directory |
| Server Components | Server-rendered by default | Data fetching, SEO |
| Client Components | Interactive UI | Hooks, event handlers |
| Route Handlers | API endpoints | app/api/*/route.ts |
| Metadata | SEO configuration | Page titles, descriptions |

## Common Patterns

### Route Handler (API)

**When:** Building API endpoints

```typescript
// app/api/items/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get('limit') || '10');

  const items = await db.items.findMany({ take: limit });
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const item = await db.items.create({ data: body });
  return NextResponse.json(item, { status: 201 });
}
```

### Dynamic Route with Params

**When:** Building detail pages

```tsx
// app/posts/[slug]/page.tsx
interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post.title, description: post.excerpt };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return <article>{post.content}</article>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}
```

### Server Actions

**When:** Handling form submissions

```tsx
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;

  await db.posts.create({ data: { title, content } });
  revalidatePath('/posts');
}

// app/posts/new/page.tsx
import { createPost } from '../actions';

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <textarea name="content" required />
      <button type="submit">Create Post</button>
    </form>
  );
}
```

## File Structure

```
app/
├── layout.tsx        # Root layout (required)
├── page.tsx          # Home page (/)
├── loading.tsx       # Loading UI
├── error.tsx         # Error UI (must be client component)
├── not-found.tsx     # 404 page
├── api/
│   └── [...]/route.ts # API routes
├── (group)/          # Route group (no URL impact)
│   └── page.tsx
└── [dynamic]/        # Dynamic routes
    └── page.tsx
```

## Pitfalls

- Don't use client hooks in Server Components
- Add 'use client' directive for client components
- Use `next/image` for optimized images
- Use `next/link` for client-side navigation
- Handle loading and error states
- Remember `params` is now a Promise in Next.js 15+

## See Also

- [routing](references/routing.md) - App Router patterns
- [data-fetching](references/data-fetching.md) - Server-side data patterns
- [caching](references/caching.md) - Caching strategies
- [deployment](references/deployment.md) - Vercel and self-hosting

## Related Skills

For React patterns, see the **react** skill. For styling, see the **tailwind** skill. For database, see the **prisma** or **drizzle** skills.

## Documentation Resources

> Fetch latest Next.js documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "nextjs"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Server Components vs Client Components"
- "Data fetching and caching strategies"
- "Server Actions form handling"
- "Middleware authentication patterns"
