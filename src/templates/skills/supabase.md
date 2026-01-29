---
name: supabase
description: |
  Implements Supabase authentication, database queries, storage, and realtime subscriptions.
  Use when: implementing user authentication, querying PostgreSQL via Supabase client, managing file storage, or building realtime features.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Supabase Skill

This skill covers Supabase - the open-source Firebase alternative with PostgreSQL, Auth, Storage, and Realtime. Focuses on building full-stack applications with type-safe database access.

## Quick Start

### Client Setup

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    }
  }
);
```

### Basic Authentication

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword'
});

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Auth | User authentication system | Sign up, login, OAuth |
| Database | PostgreSQL with REST API | CRUD operations |
| Storage | File storage with CDN | Images, documents |
| Realtime | Live data subscriptions | Chat, notifications |
| Edge Functions | Serverless functions | Custom backend logic |
| RLS | Row Level Security | Data access control |

## Common Patterns

### Database Queries with Filters

**When:** Building search and filter APIs

```typescript
// Select with complex filters
const { data, error } = await supabase
  .from('posts')
  .select(`
    *,
    author:users(id, name, avatar_url),
    tags:post_tags(tag:tags(name))
  `)
  .eq('published', true)
  .ilike('title', `%${search}%`)
  .order('created_at', { ascending: false })
  .range(0, 9); // Pagination

// Insert with return
const { data, error } = await supabase
  .from('posts')
  .insert({ title: 'New Post', content: '...', author_id: userId })
  .select()
  .single();

// Upsert (insert or update)
const { data, error } = await supabase
  .from('profiles')
  .upsert({ id: userId, name: 'John', updated_at: new Date() })
  .select();
```

### OAuth Authentication

**When:** Implementing social login

```typescript
// OAuth sign in
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    scopes: 'read:user user:email',
  }
});

// Handle callback (in your callback route)
const { data, error } = await supabase.auth.exchangeCodeForSession(code);
```

### Realtime Subscriptions

**When:** Building live-updating features

```typescript
// Subscribe to database changes
const channel = supabase
  .channel('posts-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'posts',
      filter: 'published=eq.true'
    },
    (payload) => {
      console.log('Change received:', payload);
      if (payload.eventType === 'INSERT') {
        addPost(payload.new);
      } else if (payload.eventType === 'UPDATE') {
        updatePost(payload.new);
      } else if (payload.eventType === 'DELETE') {
        removePost(payload.old.id);
      }
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

### File Storage

**When:** Handling user uploads

```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.png`, file, {
    cacheControl: '3600',
    upsert: true,
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/avatar.png`);

// Generate signed URL (for private buckets)
const { data, error } = await supabase.storage
  .from('private-files')
  .createSignedUrl('document.pdf', 3600); // 1 hour expiry

// Delete file
await supabase.storage.from('avatars').remove([`${userId}/avatar.png`]);
```

## Row Level Security (RLS)

```sql
-- Enable RLS on table
alter table posts enable row level security;

-- Users can only read published posts
create policy "Public posts are viewable by everyone"
on posts for select
using (published = true);

-- Users can only update their own posts
create policy "Users can update own posts"
on posts for update
using (auth.uid() = author_id);

-- Users can only insert posts as themselves
create policy "Users can insert own posts"
on posts for insert
with check (auth.uid() = author_id);
```

## Type Generation

```bash
# Generate TypeScript types from your database
npx supabase gen types typescript --project-id your-project-id > types/database.ts
```

## Pitfalls

- Configure Row Level Security (RLS) policies
- Use service role key only on server (never expose to client)
- Handle auth state changes properly
- Unsubscribe from realtime channels on cleanup
- Use `.single()` when expecting exactly one row
- Handle null checks for optional relations

## See Also

- [auth](references/auth.md) - Authentication patterns
- [queries](references/queries.md) - Database query patterns
- [realtime](references/realtime.md) - Realtime subscriptions
- [storage](references/storage.md) - File storage patterns

## Related Skills

For React integration, see the **react** skill. For Next.js integration, see the **nextjs** skill. For database design, see the **prisma** skill.

## Documentation Resources

> Fetch latest Supabase documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "supabase"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Row Level Security policies"
- "Authentication with OAuth providers"
- "Realtime subscriptions and channels"
- "Storage bucket policies and uploads"
