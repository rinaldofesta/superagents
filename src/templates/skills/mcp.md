---
name: mcp
description: |
  Implements MCP (Model Context Protocol) servers with tools, resources, and prompts.
  Use when: building MCP servers to expose tools to AI assistants, creating resources for context, or implementing custom prompts.
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, mcp__context7__resolve-library-id, mcp__context7__query-docs
---

# MCP (Model Context Protocol) Skill

This skill covers the Model Context Protocol - an open protocol for connecting AI assistants to external tools and data sources. Focuses on building MCP servers that expose tools, resources, and prompts to AI assistants like Claude.

## Quick Start

### Python MCP Server with FastMCP

```python
from fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool()
def get_weather(location: str) -> str:
    """Get current weather for a location.

    Args:
        location: City name to get weather for
    """
    # Fetch weather data from API
    return f"Weather in {location}: 72°F, Sunny"

@mcp.tool()
def search_database(query: str, limit: int = 10) -> list[dict]:
    """Search the database for matching records.

    Args:
        query: Search query string
        limit: Maximum results to return
    """
    return db.search(query, limit=limit)

if __name__ == "__main__":
    mcp.run()
```

### TypeScript MCP Server

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  { name: "my-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler("tools/list", async () => ({
  tools: [{
    name: "get_weather",
    description: "Get weather for a location",
    inputSchema: {
      type: "object",
      properties: {
        location: { type: "string", description: "City name" }
      },
      required: ["location"]
    }
  }]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
```

## Key Concepts

| Concept | Description | Use Case |
|---------|-------------|----------|
| Tools | Executable functions | API calls, computations |
| Resources | Data sources | Files, databases, APIs |
| Prompts | Reusable templates | Guided interactions |
| Server | MCP implementation | Expose capabilities |
| Transport | Communication layer | stdio, HTTP, WebSocket |

## Common Patterns

### Tool with Complex Input

**When:** Tools need structured input validation

```python
from fastmcp import FastMCP
from pydantic import BaseModel, Field
from typing import Optional

mcp = FastMCP("github-server")

class CreateIssueInput(BaseModel):
    repo: str = Field(description="Repository in format owner/repo")
    title: str = Field(description="Issue title")
    body: Optional[str] = Field(default=None, description="Issue body (markdown)")
    labels: list[str] = Field(default_factory=list, description="Labels to apply")

@mcp.tool()
def create_github_issue(input: CreateIssueInput) -> dict:
    """Create a new GitHub issue.

    Args:
        input: Issue creation parameters
    """
    response = github_client.create_issue(
        repo=input.repo,
        title=input.title,
        body=input.body,
        labels=input.labels
    )
    return {"issue_number": response.number, "url": response.html_url}
```

### Resource for File Access

**When:** Exposing files or data to the AI

```python
from fastmcp import FastMCP
from pathlib import Path

mcp = FastMCP("file-server")

@mcp.resource("file://{path}")
def read_file(path: str) -> str:
    """Read contents of a file.

    Args:
        path: Path to the file to read
    """
    file_path = Path(path)
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {path}")
    return file_path.read_text()

@mcp.resource("config://app")
def get_app_config() -> dict:
    """Get application configuration."""
    return {
        "version": "1.0.0",
        "environment": os.getenv("ENV", "development"),
        "features": load_feature_flags()
    }
```

### Prompt Templates

**When:** Providing reusable interaction patterns

```python
from fastmcp import FastMCP

mcp = FastMCP("code-review-server")

@mcp.prompt()
def code_review_prompt(code: str, language: str, focus: str = "general") -> str:
    """Generate a code review prompt.

    Args:
        code: The code to review
        language: Programming language
        focus: Review focus (security, performance, general)
    """
    return f"""Please review this {language} code with a focus on {focus}:

```{language}
{code}
```

Consider:
- Code quality and readability
- Potential bugs or edge cases
- Best practices for {language}
- {"Security vulnerabilities" if focus == "security" else ""}
- {"Performance optimizations" if focus == "performance" else ""}

Provide specific, actionable feedback."""
```

### Error Handling

**When:** Graceful error responses

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await executeTool(name, args);
    return {
      content: [{
        type: "text",
        text: JSON.stringify(result, null, 2)
      }]
    };
  } catch (error) {
    // Return error in a structured way
    return {
      content: [{
        type: "text",
        text: `Error: ${error.message}`
      }],
      isError: true
    };
  }
});
```

## Claude Desktop Configuration

```json
{
  "mcpServers": {
    "my-python-server": {
      "command": "python",
      "args": ["/path/to/server.py"],
      "env": {
        "API_KEY": "your-api-key"
      }
    },
    "my-node-server": {
      "command": "node",
      "args": ["/path/to/dist/index.js"]
    },
    "npx-server": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"]
    }
  }
}
```

## Testing MCP Servers

```python
import pytest
from fastmcp.testing import MCPTestClient

@pytest.fixture
def client():
    return MCPTestClient(mcp)

async def test_get_weather(client):
    result = await client.call_tool("get_weather", {"location": "London"})
    assert "London" in result
    assert "°F" in result or "°C" in result

async def test_invalid_location(client):
    with pytest.raises(ValueError):
        await client.call_tool("get_weather", {"location": ""})
```

## Pitfalls

- Always validate tool inputs before execution
- Return clear error messages for debugging
- Use descriptive tool names and descriptions
- Keep tools focused on single responsibilities
- Handle timeouts for long-running operations
- Test with Claude Desktop before deployment
- Don't expose sensitive data in error messages
- Use environment variables for secrets, not hardcoded values

## See Also

- [tools](references/tools.md) - Tool design patterns
- [resources](references/resources.md) - Resource patterns
- [security](references/security.md) - Security considerations
- [testing](references/testing.md) - Testing MCP servers

## Related Skills

For Python servers, see the **python** and **fastapi** skills. For TypeScript servers, see the **nodejs** and **typescript** skills.

## Documentation Resources

> Fetch latest MCP documentation with Context7.

**How to use Context7:**
1. Use `mcp__context7__resolve-library-id` to search for "mcp" or "model context protocol"
2. **Prefer website documentation** (IDs starting with `/websites/`) over source code
3. Query with `mcp__context7__query-docs` using the resolved library ID

**Recommended Queries:**
- "Tool definition and input schema"
- "Resources and resource templates"
- "FastMCP Python server"
- "TypeScript SDK server implementation"
