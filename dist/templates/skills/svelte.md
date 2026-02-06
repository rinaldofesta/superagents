---
name: svelte
description: |
  Implements Svelte 5 runes, SvelteKit routing, and reactive state patterns.
  Use when: building Svelte/SvelteKit apps, managing state with runes, implementing SSR/SSG, or working with form actions.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Svelte Skill

This skill covers Svelte 5 with runes and SvelteKit for full-stack development. Svelte compiles components at build time — no virtual DOM, no runtime overhead.

## Quick Start

### Component with Runes (Svelte 5)

```svelte
<script lang="ts">
  interface Props {
    label: string;
    initialCount?: number;
  }

  let { label, initialCount = 0 }: Props = $props();

  let count = $state(initialCount);
  let doubled = $derived(count * 2);

  function increment() {
    count++;
  }
</script>

<div>
  <h2>{label}</h2>
  <p>Count: {count} (doubled: {doubled})</p>
  <button onclick={increment}>+</button>
</div>
```

### SvelteKit Page with Load Function

```typescript
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = await db.users.findUnique({ where: { id: params.id } });
  return { user };
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<h1>{data.user.name}</h1>
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| $state | Reactive state declaration | Component state |
| $derived | Computed values | Derived state |
| $effect | Side effects | DOM, subscriptions |
| $props | Component inputs | Parent-child data |
| $bindable | Two-way binding | Form inputs |
| Load functions | Server-side data fetching | SSR, SSG pages |
| Form actions | Server-side form handling | Mutations |

## Common Patterns

### Form with Server Action

**When:** Handling form submissions with progressive enhancement

```typescript
// +page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const title = data.get('title') as string;

    if (!title || title.length < 3) {
      return fail(400, { title, error: 'Title must be at least 3 characters' });
    }

    await db.todos.create({ data: { title } });
    return { success: true };
  }
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<form method="POST" action="?/create" use:enhance>
  <input name="title" value={form?.title ?? ''} />
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  <button type="submit">Add</button>
</form>
```

### Shared State with Runes

**When:** State shared across components without prop drilling

```typescript
// lib/stores/cart.svelte.ts
class CartStore {
  items = $state<CartItem[]>([]);
  total = $derived(this.items.reduce((sum, i) => sum + i.price * i.qty, 0));
  count = $derived(this.items.reduce((sum, i) => sum + i.qty, 0));

  add(product: Product) {
    const existing = this.items.find(i => i.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
  }

  remove(id: string) {
    this.items = this.items.filter(i => i.id !== id);
  }
}

export const cart = new CartStore();
```

## Pitfalls

- `$state` replaces `let` for reactive variables — don't mix old and new syntax
- `$derived` replaces `$:` reactive statements
- `$effect` runs after DOM update — don't use it for derived state
- SvelteKit form actions work without JS (progressive enhancement)
- Use `.svelte.ts` extension for files that use runes outside components

## Related Skills

For TypeScript patterns, see the **typescript** skill. For styling, see the **tailwind** skill. For testing, see the **vitest** skill.

## Documentation Resources

> Fetch latest Svelte documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "svelte"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Svelte 5 runes $state $derived $effect"
- "SvelteKit load functions and form actions"
- "SvelteKit routing and layouts"
- "Svelte component props and events"
