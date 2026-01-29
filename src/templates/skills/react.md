---
name: react
description: |
  Implements React component patterns, hooks, and state management.
  Use when: building UI components, managing component state, handling user interactions, or implementing custom hooks.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# React Skill

This skill covers React 18+ development with function components, hooks, and TypeScript. Focuses on Dan Abramov's patterns for building maintainable, performant UI components.

## Quick Start

### Component with TypeScript Props

```tsx
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export function Button({
  onClick,
  children,
  variant = 'primary',
  disabled = false
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`btn btn-${variant}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
```

### Custom Hook Pattern

```tsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return { value, toggle, setTrue, setFalse };
}
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Hooks | Function component state/effects | useState, useEffect, etc. |
| Components | Reusable UI pieces | Buttons, forms, layouts |
| Props | Component inputs | Data flow down |
| Context | Global state | Theme, auth, settings |
| Suspense | Async UI boundaries | Loading states |

## Common Patterns

### Data Fetching Hook

**When:** Components need to fetch and cache data

```tsx
function useData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!cancelled) setData(data);
      })
      .catch(err => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}
```

### Controlled Form Component

**When:** Building forms with validation

```tsx
interface FormData {
  email: string;
  password: string;
}

function LoginForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const [form, setForm] = useState<FormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(form);
    if (Object.keys(newErrors).length === 0) {
      onSubmit(form);
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" value={form.email} onChange={handleChange} />
      {errors.email && <span className="error">{errors.email}</span>}
      {/* ... */}
    </form>
  );
}
```

### Context with Reducer

**When:** Complex state shared across components

```tsx
interface State { user: User | null; loading: boolean; }
type Action =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; user: User }
  | { type: 'LOGOUT' };

const AuthContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

function authReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOGIN_START': return { ...state, loading: true };
    case 'LOGIN_SUCCESS': return { user: action.user, loading: false };
    case 'LOGOUT': return { user: null, loading: false };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, { user: null, loading: false });
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

## Pitfalls

- Don't mutate state directly
- Add keys to list items
- Avoid inline object/function props (memo issues)
- Clean up effects (return cleanup function)
- Don't call hooks conditionally

## See Also

- [hooks](references/hooks.md) - Built-in and custom hooks
- [patterns](references/patterns.md) - Component composition patterns
- [performance](references/performance.md) - Optimization techniques
- [testing](references/testing.md) - Testing React components

## Related Skills

For Next.js integration, see the **nextjs** skill. For styling, see the **tailwind** skill. For testing, see the **vitest** skill.

## Documentation Resources

> Fetch latest React documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "react"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "useEffect cleanup and dependencies"
- "useMemo and useCallback optimization"
- "Suspense and lazy loading"
- "Server Components and Client Components"
