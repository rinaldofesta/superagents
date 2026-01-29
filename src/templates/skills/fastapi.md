---
name: fastapi
description: |
  Implements FastAPI endpoint patterns, Pydantic models, and dependency injection.
  Use when: building REST APIs with FastAPI, defining request/response schemas, implementing authentication, or using async endpoints.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# FastAPI Skill

This skill covers FastAPI - a modern, fast Python web framework for building APIs with automatic OpenAPI documentation. Focuses on type-safe API development with Pydantic validation and async support.

## Quick Start

### Basic API Setup

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional

app = FastAPI(
    title="My API",
    version="1.0.0",
    description="A sample API"
)

# Pydantic models for validation
class UserCreate(BaseModel):
    email: EmailStr
    name: str
    age: Optional[int] = None

class User(UserCreate):
    id: int

    model_config = {"from_attributes": True}

# Endpoints
@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int) -> User:
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.post("/users/", response_model=User, status_code=201)
async def create_user(user: UserCreate) -> User:
    return await db.create_user(user)
```

### Run the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Path Operations | Route decorators (@app.get, etc.) | Define endpoints |
| Pydantic Models | Data validation and serialization | Request/response schemas |
| Dependency Injection | Reusable components | Auth, DB sessions |
| Async Support | Native async/await | High performance I/O |
| Auto Documentation | OpenAPI/Swagger UI | /docs, /redoc |

## Common Patterns

### Dependency Injection

**When:** Sharing resources across endpoints

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated

security = HTTPBearer()

# Database session dependency
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        await db.close()

# Auth dependency
async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
    db: Annotated[Session, Depends(get_db)]
) -> User:
    user = await verify_token(credentials.credentials, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

# Use in endpoints
@app.get("/users/me", response_model=User)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    return current_user
```

### Query Parameters with Validation

**When:** Building search and filter endpoints

```python
from fastapi import Query
from typing import Annotated

@app.get("/items/")
async def list_items(
    skip: Annotated[int, Query(ge=0, description="Items to skip")] = 0,
    limit: Annotated[int, Query(ge=1, le=100, description="Max items")] = 10,
    search: Annotated[str | None, Query(min_length=1, max_length=100)] = None,
    sort_by: Annotated[str, Query(pattern="^(name|created_at|price)$")] = "created_at",
):
    return await db.get_items(
        skip=skip,
        limit=limit,
        search=search,
        sort_by=sort_by
    )
```

### Error Handling

**When:** Consistent error responses

```python
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel

class ErrorResponse(BaseModel):
    detail: str
    code: str | None = None

app = FastAPI()

# Custom exception
class AppException(Exception):
    def __init__(self, message: str, code: str, status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "code": exc.code}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors()
        }
    )
```

### Router Organization

**When:** Structuring larger applications

```python
# routers/users.py
from fastapi import APIRouter, Depends
from typing import Annotated

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(verify_api_key)],
)

@router.get("/")
async def list_users():
    return await db.get_users()

@router.get("/{user_id}")
async def get_user(user_id: int):
    return await db.get_user(user_id)

@router.post("/", status_code=201)
async def create_user(user: UserCreate):
    return await db.create_user(user)

# main.py
from fastapi import FastAPI
from routers import users, posts, auth

app = FastAPI()
app.include_router(users.router)
app.include_router(posts.router)
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
```

### Background Tasks

**When:** Running async tasks after response

```python
from fastapi import BackgroundTasks

async def send_email_notification(email: str, message: str):
    # Simulate sending email
    await asyncio.sleep(2)
    print(f"Email sent to {email}")

@app.post("/users/")
async def create_user(
    user: UserCreate,
    background_tasks: BackgroundTasks
):
    new_user = await db.create_user(user)

    # This runs after the response is sent
    background_tasks.add_task(
        send_email_notification,
        user.email,
        "Welcome to our platform!"
    )

    return new_user
```

## Project Structure

```
app/
├── main.py              # FastAPI app entry
├── config.py            # Settings and config
├── dependencies.py      # Shared dependencies
├── models/
│   ├── __init__.py
│   └── user.py          # Pydantic models
├── routers/
│   ├── __init__.py
│   ├── users.py
│   └── posts.py
├── services/
│   ├── __init__.py
│   └── user_service.py
└── db/
    ├── __init__.py
    └── session.py
```

## Pitfalls

- Use `async def` for I/O operations, `def` for CPU-bound
- Pydantic v2 uses `model_validate()` not `parse_obj()`
- Don't forget `await` for async database calls
- Use `response_model` to control output schema
- Set CORS middleware for frontend integration
- Use `Annotated` for cleaner dependency injection
- Add `lifespan` context for startup/shutdown events

## See Also

- [models](references/models.md) - Pydantic model patterns
- [dependencies](references/dependencies.md) - Dependency injection
- [security](references/security.md) - Authentication patterns
- [testing](references/testing.md) - API testing with pytest

## Related Skills

For Python patterns, see the **python** skill. For database, see the **prisma** skill. For containerization, see the **docker** skill.

## Documentation Resources

> Fetch latest FastAPI documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "fastapi"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Dependency injection patterns"
- "Pydantic models and validation"
- "OAuth2 authentication"
- "Background tasks and lifespan"
