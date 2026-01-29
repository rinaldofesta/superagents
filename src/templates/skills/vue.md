---
name: vue
description: |
  Implements Vue.js Composition API patterns, reactivity, and component design.
  Use when: building Vue.js applications, implementing reactive state, creating components, or using Vue-specific directives.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Vue.js Skill

This skill covers Vue.js 3.x with Composition API, TypeScript integration, and modern reactivity patterns. Focuses on building maintainable, performant single-page applications.

## Quick Start

### Component with Composition API

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

// Reactive state
const count = ref(0);
const user = ref({ name: 'John', email: 'john@example.com' });

// Computed property
const doubleCount = computed(() => count.value * 2);

// Watcher
watch(count, (newVal, oldVal) => {
  console.log(`Count changed from ${oldVal} to ${newVal}`);
});

// Lifecycle
onMounted(() => {
  console.log('Component mounted');
});

// Methods
function increment() {
  count.value++;
}
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Double: {{ doubleCount }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>
```

### TypeScript Props and Emits

```vue
<script setup lang="ts">
interface Props {
  title: string;
  count?: number;
  items: string[];
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
});

const emit = defineEmits<{
  update: [value: string];
  delete: [id: number];
}>();

function handleUpdate() {
  emit('update', 'new value');
}
</script>
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Composition API | Function-based component logic | Reusable logic, TypeScript |
| Reactivity | ref, reactive, computed | State management |
| Components | Single File Components (.vue) | UI building blocks |
| Directives | v-if, v-for, v-model | Template logic |
| Composables | Reusable composition functions | Shared logic |

## Common Patterns

### Composable for Data Fetching

**When:** Reusing async data fetching logic

```typescript
// composables/useFetch.ts
import { ref, watchEffect, type Ref } from 'vue';

export function useFetch<T>(url: Ref<string> | string) {
  const data = ref<T | null>(null);
  const error = ref<Error | null>(null);
  const loading = ref(true);

  async function fetchData() {
    loading.value = true;
    error.value = null;

    try {
      const urlValue = typeof url === 'string' ? url : url.value;
      const response = await fetch(urlValue);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data.value = await response.json();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }

  watchEffect(() => {
    fetchData();
  });

  return { data, error, loading, refetch: fetchData };
}

// Usage in component
const { data: users, loading, error } = useFetch<User[]>('/api/users');
```

### State with Pinia

**When:** Managing global application state

```typescript
// stores/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null);
  const loading = ref(false);

  // Getters
  const isLoggedIn = computed(() => !!user.value);
  const displayName = computed(() => user.value?.name ?? 'Guest');

  // Actions
  async function login(email: string, password: string) {
    loading.value = true;
    try {
      const response = await api.login(email, password);
      user.value = response.user;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null;
  }

  return { user, loading, isLoggedIn, displayName, login, logout };
});

// Usage in component
const userStore = useUserStore();
await userStore.login('email', 'password');
```

### Provide/Inject for Dependency Injection

**When:** Passing data deep through component tree

```typescript
// Parent component
import { provide, ref } from 'vue';

const theme = ref<'light' | 'dark'>('light');
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light';
};

provide('theme', { theme, toggleTheme });

// Child component (any depth)
import { inject } from 'vue';

const { theme, toggleTheme } = inject('theme')!;
```

## Template Directives

```vue
<template>
  <!-- Conditionals -->
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>Content</div>

  <!-- Lists (always use :key) -->
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }}
    </li>
  </ul>

  <!-- Two-way binding -->
  <input v-model="searchQuery" />
  <input v-model.number="age" type="number" />
  <input v-model.trim="name" />

  <!-- Event handling -->
  <button @click="handleClick">Click</button>
  <form @submit.prevent="handleSubmit">...</form>
  <input @keyup.enter="search" />
</template>
```

## Pitfalls

- Use `ref` for primitives, `reactive` for objects
- Don't destructure reactive objects (loses reactivity)
- Use `shallowRef` for large objects that don't need deep reactivity
- Remember `.value` when accessing refs in script
- Always use `:key` with `v-for`
- Use `toRefs` when destructuring reactive objects

## See Also

- [composition-api](references/composition-api.md) - Composition API patterns
- [reactivity](references/reactivity.md) - Reactivity system deep dive
- [components](references/components.md) - Component patterns
- [pinia](references/pinia.md) - State management

## Related Skills

For build tooling, see the **nodejs** skill. For styling, see the **tailwind** skill. For testing, see the **vitest** skill.

## Documentation Resources

> Fetch latest Vue.js documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "vue"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Composition API ref reactive computed"
- "Composables and reusability"
- "Props and emits with TypeScript"
- "Provide inject dependency injection"
