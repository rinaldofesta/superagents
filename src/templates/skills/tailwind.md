---
name: tailwind
description: |
  Implements Tailwind CSS utility classes, responsive design, and theming.
  Use when: styling components with utility classes, implementing responsive layouts, adding dark mode, or configuring Tailwind.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Tailwind CSS Skill

This skill covers Tailwind CSS 3.x with utility-first styling, responsive design, and modern theming patterns. Focuses on building maintainable, performant UIs without custom CSS.

## Quick Start

### Basic Component Styling

```tsx
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      <div className="mt-2 text-gray-600 dark:text-gray-300">
        {children}
      </div>
    </div>
  );
}
```

### Common Utility Patterns

```tsx
const patterns = {
  // Centering
  center: 'flex items-center justify-center',
  // Container
  container: 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8',
  // Button
  button: 'rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  // Input
  input: 'rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
};
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Utilities | Single-purpose classes | `p-4`, `text-lg`, `flex` |
| Responsive | Mobile-first breakpoints | `md:flex`, `lg:grid` |
| States | Hover, focus, etc. | `hover:bg-blue-500` |
| Dark Mode | Theme switching | `dark:bg-gray-900` |
| Arbitrary Values | Custom values | `w-[137px]`, `bg-[#1da1f2]` |

## Common Patterns

### Responsive Grid Layout

**When:** Building adaptive layouts

```tsx
function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map(product => (
        <div
          key={product.id}
          className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg"
        >
          <img
            src={product.image}
            alt={product.name}
            className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="p-4">
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="mt-1 text-sm text-gray-500">${product.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Interactive Button States

**When:** Building accessible interactive elements

```tsx
function Button({
  variant = 'primary',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button className={`${baseClasses} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}
```

### Form with Validation States

**When:** Styling form inputs with error states

```tsx
function FormField({
  label,
  error,
  ...props
}: FormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        className={`
          w-full rounded-md border px-3 py-2
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
```

## Breakpoints

| Prefix | Min Width | CSS |
|--------|-----------|-----|
| sm | 640px | `@media (min-width: 640px)` |
| md | 768px | `@media (min-width: 768px)` |
| lg | 1024px | `@media (min-width: 1024px)` |
| xl | 1280px | `@media (min-width: 1280px)` |
| 2xl | 1536px | `@media (min-width: 1536px)` |

## Pitfalls

- Don't mix Tailwind with custom CSS unnecessarily
- Use `@apply` sparingly (prefer component extraction)
- Remember mobile-first (base styles apply to all sizes)
- Purge unused styles in production (automatic with JIT)
- Use `clsx` or `cn` utilities for conditional classes

## See Also

- [responsive](references/responsive.md) - Responsive design patterns
- [dark-mode](references/dark-mode.md) - Theme implementation
- [components](references/components.md) - Common component patterns
- [config](references/config.md) - Tailwind configuration

## Related Skills

For React components, see the **react** skill. For Next.js integration, see the **nextjs** skill.

## Documentation Resources

> Fetch latest Tailwind CSS documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "tailwindcss"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Flexbox and Grid utilities"
- "Dark mode configuration"
- "Custom colors and theming"
- "Animation and transition utilities"
