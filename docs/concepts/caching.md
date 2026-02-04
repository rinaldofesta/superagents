# Caching

SuperAgents uses intelligent caching to speed up generation and reduce API costs.

## Cache Types

SuperAgents maintains two cache layers:

| Cache Type | TTL | Purpose | Location |
|------------|-----|---------|----------|
| Codebase Analysis | 24 hours | Skip re-analyzing unchanged projects | `~/.superagents/cache/analysis/` |
| Generated Content | 7 days | Reuse generated agents and skills | `~/.superagents/cache/generation/` |

Both caches are stored in your home directory at `~/.superagents/cache/`.

## Codebase Analysis Cache

### What Gets Cached

Codebase analysis results:
- Project type (node, python, web, fullstack)
- Detected framework (React, Express, FastAPI, etc.)
- Dependencies from package.json, requirements.txt
- Code patterns (API routes, database usage, etc.)
- Monorepo structure

### Cache Key

The cache key is a hash of:
- package.json content (if exists)
- tsconfig.json content (if exists)
- requirements.txt content (if exists)
- pyproject.toml content (if exists)
- src/ directory structure
- Project root path

If any of these change, the cache is invalidated.

### Performance Impact

Without cache: 5-10 seconds analysis
With cache: < 100ms (instant)

### TTL: 24 Hours

The cache expires after 24 hours. After expiration, SuperAgents re-analyzes the codebase on next run.

### Example

First run:

```bash
superagents
# Analyzing codebase... (8 seconds)
```

Second run (within 24 hours, no file changes):

```bash
superagents
# Using cached analysis
```

File changed (package.json updated):

```bash
superagents
# Analyzing codebase... (cache invalidated)
```

## Generated Content Cache

### What Gets Cached

Generated content for agents and skills:
- Agent markdown files
- Skill markdown files
- CLAUDE.md content

### Cache Key

The cache key is a hash of:
- Project goal
- Codebase analysis hash (framework, language, dependencies)
- Item type (agent or skill)
- Item name
- Model used (Haiku or Sonnet)

If any of these change, the cache is invalidated.

### Performance Impact

Without cache: 10-30 seconds generation (API calls)
With cache: < 100ms (instant)

### TTL: 7 Days

The cache expires after 7 days. After expiration, SuperAgents regenerates content on next run.

### Example

First run (new project):

```bash
superagents
# Generating 4 agents... (15 seconds)
# Generating 5 skills... (10 seconds)
```

Second run (same goal and codebase):

```bash
superagents
# Using cached content for 4 agents
# Using cached content for 5 skills
```

Goal changed:

```bash
superagents
? What are you building?
> [New goal entered]

# Regenerating agents... (cache invalidated by goal change)
```

## Cache Statistics

View cache statistics:

```bash
superagents cache --stats
```

Output:

```
Cache Statistics:

Analysis Cache:
  Entries: 5
  Total Size: 24 KB
  Oldest: 2 days ago
  Newest: 1 hour ago

Generation Cache:
  Entries: 42
  Total Size: 156 KB
  Oldest: 5 days ago
  Newest: 1 hour ago

Cache Hit Rate (last 30 days): 73%
```

## Clearing Cache

### Clear All Cache

Remove all cached data:

```bash
superagents cache --clear
```

Confirmation prompt:

```
? Clear all cached data?
  This will force re-analysis and regeneration on next run.
  ○ Yes
  ○ No
```

### Clear Specific Project Cache

The cache uses project-specific keys. To clear cache for one project, run from that project directory:

```bash
cd your-project
superagents cache --clear-project
```

### Manual Cache Removal

Cache is stored in `~/.superagents/cache/`. You can manually delete:

```bash
# Clear all cache
rm -rf ~/.superagents/cache/

# Clear analysis cache only
rm -rf ~/.superagents/cache/analysis/

# Clear generation cache only
rm -rf ~/.superagents/cache/generation/
```

## Cache Behavior

### On First Run

No cache exists. SuperAgents:
1. Analyzes codebase (5-10 seconds)
2. Generates content with AI (10-30 seconds)
3. Caches both

### On Subsequent Runs (No Changes)

Cache hit. SuperAgents:
1. Loads cached analysis (< 100ms)
2. Loads cached content (< 100ms)
3. Writes to `.claude/` (< 1 second)

Total time: ~1 second (vs. 15-40 seconds without cache)

### On File Changes

Cache partially invalidated. SuperAgents:
1. Re-analyzes codebase (cache miss)
2. Uses cached generation if goal unchanged
3. Updates analysis cache

### On Goal Changes

Generation cache invalidated. SuperAgents:
1. Uses cached analysis (cache hit)
2. Regenerates content (cache miss)
3. Updates generation cache

### On Update Command

`superagents --update` respects cache:

- Adding an agent: Generates only new agent (others from cache)
- Removing an agent: No generation needed
- Regenerate option: Forces cache invalidation for selected items

## Cache and Dry Run

Dry run mode uses cache:

```bash
superagents --dry-run
```

Output shows cache status:

```
Analysis: Using cached (2 hours old)

Agents (4):
  backend-engineer: Using local template
  api-designer: Using cached generation
  frontend-specialist: Would generate with API
  testing-specialist: Using cached generation

Skills (3):
  typescript: Using local template
  react: Using local template
  vitest: Using local template
```

## Cost Savings

Cache dramatically reduces costs:

### Without Cache

Every run requires:
- Analysis (no cost, but slow)
- API calls for generation

Example: 6 custom items × $0.02 per item = $0.12 per run

10 runs in a week: $1.20

### With Cache

After first run, subsequent runs:
- Use cached analysis (instant)
- Use cached generation (no API calls)

Example: $0.12 first run, $0 for next 9 runs

10 runs in a week: $0.12

92% cost savings.

## Cache Invalidation Scenarios

| Scenario | Analysis Cache | Generation Cache |
|----------|----------------|------------------|
| No changes | Hit | Hit |
| package.json updated | Miss | Hit (if goal same) |
| Source code changed | Miss | Hit (if goal same) |
| Goal changed | Hit | Miss |
| Framework changed | Miss | Miss |
| Cache expired (24h/7d) | Miss | Miss |

## Best Practices

### Leverage Cache

Run SuperAgents multiple times during development. Cache makes subsequent runs nearly instant.

### Clear When Needed

Clear cache if:
- Recommendations seem stale
- Framework changed significantly
- Want to regenerate with updated templates

### Check Statistics

Periodically check cache stats:

```bash
superagents cache --stats
```

High hit rate (>70%) indicates effective caching.

### Dry Run First

Use dry run to check cache status before generating:

```bash
superagents --dry-run
```

Shows what will be cached vs. generated.

## Cache and Teams

Cache is per-machine, not shared. Each team member has their own cache.

To share configurations, use export/import:

```bash
# Export on one machine
superagents export team-config.zip

# Import on another
superagents import team-config.zip
```

This bypasses cache entirely.

## Troubleshooting

### Cache Not Hitting

Problem: SuperAgents regenerates every time.

Solutions:
1. Check if files are changing between runs
2. Verify goal is identical each time
3. Check cache stats: `superagents cache --stats`

### Stale Recommendations

Problem: Recommendations don't match current project.

Solution: Clear cache to force re-analysis:

```bash
superagents cache --clear
```

### Cache Corruption

Problem: Cache errors or invalid data.

Solution: Clear cache and regenerate:

```bash
rm -rf ~/.superagents/cache/
superagents
```

## Next Steps

- [Generation Process](generation.md) - How content is generated
- [Cache Command](../commands/cache.md) - Cache management commands
- [CLI Options](../reference/cli-options.md) - Command-line flags
