---
name: python
description: |
  Implements Python best practices, type hints, async patterns, and project structure.
  Use when: writing Python scripts, building backends, implementing async code, or setting up Python projects.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# Python Skill

This skill covers Python 3.10+ development with modern type hints, async patterns, and best practices. Focuses on building maintainable, type-safe Python applications.

## Quick Start

### Project Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Modern alternative: use pyproject.toml with pip
pip install -e ".[dev]"
```

### Type Hints Basics

```python
from typing import Optional, List, Dict

def greet(name: str, times: int = 1) -> str:
    return f"Hello, {name}! " * times

def process_items(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}

def fetch_user(user_id: int) -> Optional[User]:
    """Returns None if user not found."""
    return db.get(user_id)

# Python 3.10+ union syntax
def parse(value: str | int) -> str:
    return str(value)
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Virtual Environments | Isolated package installations | Project dependencies |
| Type Hints | Optional static typing | Code clarity, IDE support |
| Async/Await | Asynchronous programming | I/O bound operations |
| Decorators | Function/class modifiers | Logging, auth, caching |
| Context Managers | Resource management | Files, connections |
| Dataclasses | Structured data | DTOs, config objects |

## Common Patterns

### Async HTTP Requests

**When:** Making concurrent API calls

```python
import asyncio
import aiohttp
from typing import Any

async def fetch_data(session: aiohttp.ClientSession, url: str) -> dict[str, Any]:
    async with session.get(url) as response:
        response.raise_for_status()
        return await response.json()

async def fetch_all(urls: list[str]) -> list[dict[str, Any]]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_data(session, url) for url in urls]
        return await asyncio.gather(*tasks, return_exceptions=True)

# Usage
results = asyncio.run(fetch_all([
    "https://api.example.com/users/1",
    "https://api.example.com/users/2",
]))
```

### Dataclass with Validation

**When:** Defining structured data with defaults

```python
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime

@dataclass
class User:
    id: int
    email: str
    name: str
    active: bool = True
    created_at: datetime = field(default_factory=datetime.now)
    tags: list[str] = field(default_factory=list)
    metadata: dict[str, str] = field(default_factory=dict)

    def __post_init__(self):
        if not self.email or "@" not in self.email:
            raise ValueError("Invalid email address")

# Immutable dataclass
@dataclass(frozen=True)
class Config:
    api_key: str
    base_url: str
    timeout: int = 30
```

### Context Manager

**When:** Managing resources that need cleanup

```python
from contextlib import contextmanager, asynccontextmanager
from typing import Generator, AsyncGenerator
import time

@contextmanager
def timer(label: str) -> Generator[None, None, None]:
    start = time.time()
    try:
        yield
    finally:
        elapsed = time.time() - start
        print(f"{label}: {elapsed:.2f}s")

# Usage
with timer("Database query"):
    results = db.execute_query()

# Async context manager
@asynccontextmanager
async def get_db_connection() -> AsyncGenerator[Connection, None]:
    conn = await create_connection()
    try:
        yield conn
    finally:
        await conn.close()
```

### Decorator with Arguments

**When:** Creating reusable function wrappers

```python
from functools import wraps
from typing import Callable, TypeVar, ParamSpec
import logging

P = ParamSpec("P")
T = TypeVar("T")

def retry(max_attempts: int = 3, delay: float = 1.0):
    def decorator(func: Callable[P, T]) -> Callable[P, T]:
        @wraps(func)
        def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    logging.warning(f"Attempt {attempt + 1} failed: {e}")
                    if attempt < max_attempts - 1:
                        time.sleep(delay)
            raise last_exception
        return wrapper
    return decorator

@retry(max_attempts=3, delay=2.0)
def unstable_api_call() -> dict:
    return requests.get("https://api.example.com/data").json()
```

## Project Structure

```
my_project/
├── pyproject.toml          # Modern Python packaging
├── src/
│   └── my_project/
│       ├── __init__.py
│       ├── main.py
│       ├── models/
│       │   └── user.py
│       ├── services/
│       │   └── auth.py
│       └── utils/
│           └── helpers.py
├── tests/
│   ├── conftest.py
│   └── test_main.py
└── requirements.txt
```

## pyproject.toml Example

```toml
[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "my-project"
version = "1.0.0"
requires-python = ">=3.10"
dependencies = [
    "aiohttp>=3.9.0",
    "pydantic>=2.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-asyncio>=0.21.0",
    "mypy>=1.0.0",
    "ruff>=0.1.0",
]

[tool.mypy]
python_version = "3.10"
strict = true
```

## Pitfalls

- Use virtual environments for every project
- Don't use mutable default arguments (`def foo(items=[])`)
- Remember `async` functions need `await`
- Use `is` for None comparison, `==` for values
- Handle exceptions specifically, not bare `except:`
- Use `pathlib.Path` instead of string paths
- Prefer f-strings over `.format()` or `%`

## See Also

- [async](references/async.md) - Async programming patterns
- [typing](references/typing.md) - Type hint patterns
- [testing](references/testing.md) - pytest patterns
- [packaging](references/packaging.md) - Project packaging

## Related Skills

For web APIs, see the **fastapi** skill. For containerization, see the **docker** skill.

## Documentation Resources

> Fetch latest Python documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "python"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Type hints generics TypeVar"
- "Asyncio patterns and best practices"
- "Dataclasses and pydantic models"
- "Context managers and decorators"
