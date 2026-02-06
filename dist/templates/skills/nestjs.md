---
name: nestjs
description: |
  Implements NestJS modules, controllers, services, and decorator-based patterns.
  Use when: building NestJS APIs, implementing dependency injection, creating guards/pipes/interceptors, or working with NestJS modules.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# NestJS Skill

This skill covers NestJS 10+ with TypeScript strict mode. NestJS uses decorators, dependency injection, and a modular architecture inspired by Angular for building server-side applications.

## Quick Start

### Controller + Service

```typescript
// users.controller.ts
import { Controller, Get, Post, Body, Param, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
```

```typescript
// users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  private users: User[] = [];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  create(dto: CreateUserDto): User {
    const user = { id: crypto.randomUUID(), ...dto };
    this.users.push(user);
    return user;
  }
}
```

### Module Registration

```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Available to other modules
})
export class UsersModule {}
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Modules | Organize related features | Feature boundaries |
| Controllers | Handle HTTP requests | Routes and params |
| Providers | Injectable services | Business logic |
| Pipes | Transform/validate input | DTO validation |
| Guards | Authorization checks | Auth, roles |
| Interceptors | Cross-cutting concerns | Logging, caching |
| Middleware | Request processing | CORS, compression |

## Common Patterns

### Validation with class-validator

**When:** Validating request bodies

```typescript
// dto/create-user.dto.ts
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

// main.ts — enable global validation
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,       // Strip unknown properties
  forbidNonWhitelisted: true, // Throw on unknown properties
  transform: true,       // Auto-transform to DTO class
}));
```

### Custom Guard

**When:** Protecting routes with authentication

```typescript
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) throw new UnauthorizedException();

    try {
      const user = await this.authService.verifyToken(token);
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}

// Usage: @UseGuards(AuthGuard) on controller or method
```

### Repository Pattern with Prisma

**When:** Database access with clean abstraction

```typescript
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany();
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }
}
```

## Pitfalls

- Register all providers in their module's `providers` array
- Export providers that other modules need to use
- Use `forRoot()` / `forRootAsync()` for dynamic module configuration
- Don't inject request-scoped providers into singleton providers
- Use `class-validator` + `ValidationPipe` for DTO validation, not manual checks

## Related Skills

For TypeScript patterns, see the **typescript** skill. For database access, see the **prisma** skill. For testing, see the **vitest** skill.

## Documentation Resources

> Fetch latest NestJS documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "nestjs"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Controllers decorators and routing"
- "Custom providers and dependency injection"
- "Guards pipes and interceptors"
- "Module system and dynamic modules"
