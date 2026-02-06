---
name: playwright
description: |
  Implements end-to-end testing with Playwright for cross-browser automation.
  Use when: writing E2E tests, testing user flows, visual regression testing, or automating browser interactions.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Playwright Skill

This skill covers Playwright for end-to-end testing with TypeScript. Playwright supports Chromium, Firefox, and WebKit with a single API, auto-waits for elements, and runs tests in parallel.

## Quick Start

### Basic Page Test

```typescript
import { test, expect } from '@playwright/test';

test('homepage has correct title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/My App/);
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
```

### Form Submission Test

```typescript
test('user can sign up', async ({ page }) => {
  await page.goto('/signup');

  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('securepassword');
  await page.getByRole('button', { name: 'Sign up' }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Locators | Find elements on page | `getByRole`, `getByLabel`, `getByText` |
| Assertions | Verify expected state | `expect(locator).toBeVisible()` |
| Auto-waiting | Waits for elements automatically | No manual `waitFor` needed |
| Page Object | Reusable page abstractions | Complex multi-page flows |
| Fixtures | Test setup/teardown | Auth state, test data |
| Trace Viewer | Debug failed tests | Visual timeline of actions |

## Common Patterns

### Page Object Model

**When:** Tests share interactions with the same page

```typescript
// pages/login.page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(private page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// tests/login.spec.ts
import { LoginPage } from '../pages/login.page';

test('successful login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});

test('shows error on invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('wrong@test.com', 'wrong');
  await expect(loginPage.errorMessage).toContainText('Invalid credentials');
});
```

### Authentication Fixture

**When:** Multiple tests need an authenticated user

```typescript
// fixtures/auth.ts
import { test as base } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Login once, reuse state
    await page.goto('/login');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/dashboard');

    await use(page);
  },
});

// Or use storageState for faster auth reuse
// playwright.config.ts
// { storageState: 'playwright/.auth/user.json' }
```

### API Mocking

**When:** Testing UI without real API calls

```typescript
test('shows products from API', async ({ page }) => {
  // Mock the API response
  await page.route('/api/products', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: '1', name: 'Widget', price: 9.99 },
        { id: '2', name: 'Gadget', price: 19.99 },
      ]),
    });
  });

  await page.goto('/products');
  await expect(page.getByText('Widget')).toBeVisible();
  await expect(page.getByText('Gadget')).toBeVisible();
});
```

## Pitfalls

- **Prefer role/label locators** over CSS selectors — `getByRole('button', { name: 'Submit' })` not `page.locator('.btn-submit')`
- **Don't use `page.waitForTimeout()`** — use auto-waiting or `expect` assertions instead
- **Use `test.describe`** to group related tests, not to share state between tests
- **Run tests in parallel** — default in Playwright. Ensure tests are independent.
- **Use trace on CI** — `trace: 'on-first-retry'` in config for debugging failures

## Related Skills

For component testing, see the **vitest** skill. For React testing, see the **react** skill. For TypeScript, see the **typescript** skill.

## Documentation Resources

> Fetch latest Playwright documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "playwright"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Locators getByRole getByLabel getByText"
- "Page Object Model pattern"
- "Authentication and fixtures"
- "API mocking and route interception"
