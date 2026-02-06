---
name: angular
description: |
  Implements Angular component architecture, dependency injection, and reactive patterns.
  Use when: building Angular apps, working with services and DI, implementing RxJS patterns, or configuring Angular modules.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Angular Skill

This skill covers Angular 17+ development with standalone components, signals, and TypeScript strict mode. Follows the Angular team's recommended patterns.

## Quick Start

### Standalone Component

```typescript
import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <div>
      <h2>{{ label() }}</h2>
      <p>Count: {{ count() }}</p>
      <button (click)="increment()">+</button>
    </div>
  `
})
export class CounterComponent {
  label = input.required<string>();
  countChange = output<number>();

  count = signal(0);

  increment() {
    this.count.update(c => c + 1);
    this.countChange.emit(this.count());
  }
}
```

### Service with Dependency Injection

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }

  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`);
  }
}
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Standalone | No NgModule needed | Default for all new components |
| Signals | Fine-grained reactivity | Component state, computed values |
| inject() | Function-based DI | Services, HTTP, router |
| RxJS | Async data streams | HTTP, events, WebSockets |
| Zoneless | No Zone.js overhead | Performance-critical apps |

## Common Patterns

### Smart/Dumb Component Pattern

**When:** Separating data logic from presentation

```typescript
// Smart component: handles data
@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [UserListComponent],
  template: `
    <app-user-list
      [users]="users()"
      (select)="onSelect($event)"
    />
  `
})
export class UserPageComponent {
  private userService = inject(UserService);
  users = toSignal(this.userService.getUsers(), { initialValue: [] });

  onSelect(user: User) {
    this.router.navigate(['/users', user.id]);
  }
}

// Dumb component: pure presentation
@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    @for (user of users(); track user.id) {
      <div (click)="select.emit(user)">{{ user.name }}</div>
    }
  `
})
export class UserListComponent {
  users = input.required<User[]>();
  select = output<User>();
}
```

### Reactive Forms

**When:** Complex forms with validation

```typescript
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="email" />
      @if (form.controls.email.errors?.['required']) {
        <span>Email is required</span>
      }
      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

## Pitfalls

- Use `track` in `@for` loops (required in Angular 17+)
- Avoid `subscribe()` — use `async` pipe or `toSignal()` instead
- Don't put logic in templates — use computed signals
- Use `inject()` over constructor injection for readability
- Standalone components are the default — avoid NgModules for new code

## Related Skills

For TypeScript patterns, see the **typescript** skill. For styling, see the **tailwind** skill. For testing, see the **vitest** skill.

## Documentation Resources

> Fetch latest Angular documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "angular"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Standalone components and signals"
- "Dependency injection with inject function"
- "Control flow syntax @if @for @switch"
- "Reactive forms validation"
