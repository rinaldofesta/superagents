---
name: vitest
description: |
  Sets up unit testing, test runners, mocking, and coverage with Vitest.
  Use when: writing unit tests, integration tests, setting up mocks, configuring test coverage, or testing async code.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Vitest Skill

This skill covers Vitest - a fast, Vite-native testing framework with Jest compatibility. Focuses on writing effective tests with TypeScript, mocking strategies, and coverage configuration.

## Quick Start

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  afterEach(() => {
    // Cleanup
  });

  it('should add two numbers', () => {
    expect(calculator.add(2, 3)).toBe(5);
  });

  it('should throw on division by zero', () => {
    expect(() => calculator.divide(1, 0)).toThrow('Division by zero');
  });
});
```

### Async Testing

```typescript
import { describe, it, expect } from 'vitest';

describe('API Client', () => {
  it('should fetch user data', async () => {
    const user = await fetchUser('123');
    expect(user).toMatchObject({ id: '123', name: expect.any(String) });
  });

  it('should reject on invalid user', async () => {
    await expect(fetchUser('invalid')).rejects.toThrow('User not found');
  });
});
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| describe/it | Test organization | Group related tests |
| expect | Assertions | Verify outcomes |
| vi | Mock utilities | Spies, stubs, timers |
| beforeEach | Setup hooks | Test isolation |
| coverage | Code coverage | Track test coverage |

## Common Patterns

### Mocking Functions and Modules

**When:** Isolating units under test

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { sendEmail } from './email';
import { createUser } from './user-service';

// Mock entire module
vi.mock('./email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true }),
}));

describe('UserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send welcome email on user creation', async () => {
    await createUser({ email: 'test@example.com', name: 'John' });

    expect(sendEmail).toHaveBeenCalledWith({
      to: 'test@example.com',
      subject: 'Welcome!',
      template: 'welcome',
    });
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
```

### Spying on Methods

**When:** Verifying method calls without replacing implementation

```typescript
import { vi, describe, it, expect } from 'vitest';

describe('Logger', () => {
  it('should log errors with timestamp', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('Something went wrong');

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\d{4}-\d{2}-\d{2}/),
      'ERROR',
      'Something went wrong'
    );

    consoleSpy.mockRestore();
  });
});
```

### Testing with Fake Timers

**When:** Testing time-dependent code

```typescript
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce function calls', () => {
    const fn = vi.fn();
    const debouncedFn = debounce(fn, 100);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
```

### Snapshot Testing

**When:** Testing complex object structures

```typescript
import { describe, it, expect } from 'vitest';

describe('Config Generator', () => {
  it('should generate correct webpack config', () => {
    const config = generateWebpackConfig({
      mode: 'production',
      entry: './src/index.ts',
    });

    expect(config).toMatchSnapshot();
  });

  it('should generate inline snapshot', () => {
    const user = { name: 'John', role: 'admin' };

    expect(user).toMatchInlineSnapshot(`
      {
        "name": "John",
        "role": "admin",
      }
    `);
  });
});
```

## Common Assertions

```typescript
// Equality
expect(value).toBe(5);                    // Strict equality (===)
expect(obj).toEqual({ a: 1 });            // Deep equality
expect(obj).toStrictEqual({ a: 1 });      // Strict deep equality (no undefined)

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(5);
expect(0.1 + 0.2).toBeCloseTo(0.3);

// Strings and Arrays
expect(str).toMatch(/pattern/);
expect(str).toContain('substring');
expect(arr).toContain(item);
expect(arr).toHaveLength(3);

// Objects
expect(obj).toHaveProperty('key', 'value');
expect(obj).toMatchObject({ partial: 'match' });

// Exceptions
expect(() => fn()).toThrow('error message');
expect(() => fn()).toThrow(ErrorClass);

// Async
await expect(promise).resolves.toBe('value');
await expect(promise).rejects.toThrow('error');
```

## Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // or 'jsdom' for browser
    include: ['**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules', 'dist', '**/*.d.ts'],
    },
    setupFiles: ['./test/setup.ts'],
  },
});
```

## Pitfalls

- Clear mocks between tests with `beforeEach(() => vi.clearAllMocks())`
- Use `toStrictEqual` for exact object matching
- Mock timers before the code that uses them
- Don't forget to restore mocks with `mockRestore()`
- Use `vi.resetModules()` when testing module-level code
- Run tests in isolation with `--isolate` flag if needed

## See Also

- [mocking](references/mocking.md) - Mocking strategies
- [assertions](references/assertions.md) - Assertion patterns
- [async](references/async.md) - Async testing patterns
- [coverage](references/coverage.md) - Coverage configuration

## Related Skills

For TypeScript patterns, see the **typescript** skill. For React testing, see the **react** skill.

## Documentation Resources

> Fetch latest Vitest documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "vitest"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Mocking modules and functions"
- "Fake timers and async testing"
- "Coverage configuration"
- "Test fixtures and setup"
