# Cache Command

Manage SuperAgents cache for analysis and generation.

## Cache Statistics

View cache statistics:

```bash
superagents cache --stats
```

Shows:
- Number of cached entries
- Total cache size
- Cache age (oldest and newest)
- Hit rate

## Clear Cache

Remove all cached data:

```bash
superagents cache --clear
```

Prompts for confirmation before clearing.

## Cache Location

SuperAgents stores cache in your home directory:

```
~/.superagents/
└── cache/
    ├── analysis/     # Codebase analysis cache (24h TTL)
    └── generation/   # Generated content cache (7d TTL)
```

## Command Options

| Option | Description |
|--------|-------------|
| `--stats` | Show cache statistics |
| `--clear` | Clear all cached data |

Options are mutually exclusive. Use one at a time.

## Cache Statistics Details

### Example Output

```bash
superagents cache --stats
```

```
Cache Statistics:

Analysis Cache:
  Entries: 5 projects
  Total Size: 24 KB
  Oldest: 2 days ago
  Newest: 1 hour ago

Generation Cache:
  Entries: 42 items
  Total Size: 156 KB
  Oldest: 5 days ago
  Newest: 1 hour ago

Cache Hit Rate (last 30 days): 73%

Breakdown by Type:
  Agents: 18 cached (126 KB)
  Skills: 20 cached (22 KB)
  CLAUDE.md: 4 cached (8 KB)
```

### Fields Explained

**Entries**: Number of cached items
- Analysis cache: Number of projects analyzed
- Generation cache: Number of agents/skills/CLAUDE.md files

**Total Size**: Disk space used by cache

**Oldest/Newest**: Cache entry ages

**Cache Hit Rate**: Percentage of requests served from cache vs. generated

**Breakdown by Type**: Generation cache split by item type

## Clear Cache Details

### Confirmation Prompt

```bash
superagents cache --clear
```

```
? Clear all cached data?
  This will force re-analysis and regeneration on next run.

  Analysis Cache: 5 entries (24 KB)
  Generation Cache: 42 entries (156 KB)

  ○ Yes, clear all cache
  ○ No, keep cache
```

Select "Yes" to proceed with clearing.

### What Gets Deleted

Clearing cache removes:
- All codebase analysis results
- All generated content cache
- Cache metadata

### After Clearing

Next `superagents` run:
- Re-analyzes codebase (5-10 seconds)
- Regenerates all content (10-30 seconds)
- Rebuilds cache

## When to Clear Cache

### Stale Recommendations

Problem: SuperAgents recommends outdated agents/skills.

Solution: Clear cache to force re-analysis:

```bash
superagents cache --clear
```

### After Major Dependency Changes

After significant project changes (e.g., migrated from JavaScript to TypeScript):

```bash
npm install typescript
superagents cache --clear
superagents
```

### Before Sharing Configuration

Ensure fresh generation before exporting:

```bash
superagents cache --clear
superagents
superagents export team-config.zip
```

### Debugging Issues

If generation behaves unexpectedly:

```bash
superagents cache --clear
superagents --verbose
```

### Disk Space Cleanup

If cache grows too large:

```bash
superagents cache --stats  # Check size
superagents cache --clear  # Clear if needed
```

## Cache Behavior

### Automatic Expiration

Cache entries expire automatically:

| Cache Type | TTL | Expiration |
|------------|-----|------------|
| Analysis | 24 hours | Automatic on next run |
| Generation | 7 days | Automatic on next run |

Expired entries are ignored and regenerated.

### Invalidation

Cache is invalidated when:

**Analysis Cache:**
- package.json modified
- tsconfig.json modified
- requirements.txt modified
- Project structure changed

**Generation Cache:**
- Project goal changed
- Codebase analysis changed
- Model selection changed
- Template updated

### Selective Invalidation

You can't selectively clear cache for one project. The `--clear` option removes all cache.

To force re-generation for one project without affecting cache:

```bash
cd your-project
rm -rf .claude/
superagents
```

This regenerates configuration but keeps other projects' cache intact.

## Cache and Performance

### With Cache

Typical run time with cache hits:

```
Analysis: < 100ms (cache hit)
Generation: < 100ms per item (cache hit)
Writing: < 1s

Total: ~2 seconds
```

### Without Cache

Typical run time without cache:

```
Analysis: 5-10 seconds
Generation: 2-5 seconds per item (API calls)
Writing: < 1s

Total: 15-40 seconds
```

Cache provides 7-20x speedup.

## Cache and Costs

### Cost Savings

Cache reduces API costs dramatically:

**Without Cache:**
- Every run requires API calls
- 6 custom items × $0.02 = $0.12 per run
- 10 runs = $1.20

**With Cache:**
- First run: $0.12
- Subsequent runs: $0 (cache hits)
- 10 runs = $0.12

92% cost savings.

### When Cache Doesn't Help

Cache doesn't reduce costs if:
- Using local templates (no API calls anyway)
- Changing goal frequently (invalidates generation cache)
- Clearing cache between runs

## Manual Cache Management

### View Cache Directory

```bash
ls -lh ~/.superagents/cache/
```

Shows cache directories and sizes.

### Check Specific Project Cache

Cache keys are hashed. To see if a project is cached:

```bash
superagents --dry-run --verbose
```

Look for "Using cached analysis" or "Cache hit" messages.

### Delete Cache Manually

```bash
# Remove all cache
rm -rf ~/.superagents/cache/

# Remove analysis cache only
rm -rf ~/.superagents/cache/analysis/

# Remove generation cache only
rm -rf ~/.superagents/cache/generation/
```

This is equivalent to `superagents cache --clear`.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success (stats shown or cache cleared) |
| 1 | Error (e.g., permission denied) |
| 2 | Cancelled (user cancelled clear prompt) |

## Examples

### Check Cache Before Run

See if cache exists:

```bash
superagents cache --stats
```

If hit rate is low, consider clearing:

```bash
superagents cache --clear
```

### Clear Cache After SuperAgents Update

After updating SuperAgents:

```bash
superagents update
superagents cache --clear
```

This ensures you use latest templates and generation logic.

### Troubleshoot Unexpected Behavior

```bash
# Check cache status
superagents cache --stats

# Clear and regenerate
superagents cache --clear
superagents --verbose
```

Verbose mode shows whether cache is being used.

### Pre-Demo Cleanup

Before a demo or presentation:

```bash
superagents cache --clear
superagents
```

Ensures fresh, up-to-date configuration.

## Troubleshooting

### "Permission denied" on Cache Clear

Problem: Cannot delete cache files.

Solution:
```bash
sudo rm -rf ~/.superagents/cache/
```

Or check file permissions:
```bash
ls -la ~/.superagents/cache/
```

### Cache Not Clearing

Problem: Cache persists after clear command.

Solution:
1. Manually delete: `rm -rf ~/.superagents/cache/`
2. Verify deletion: `ls ~/.superagents/`
3. Retry: `superagents cache --stats`

### Cache Stats Empty After Clear

This is expected. Cache is empty after clearing:

```bash
superagents cache --clear
superagents cache --stats
```

Output:
```
Cache Statistics:

Analysis Cache:
  Entries: 0
  Total Size: 0 KB

Generation Cache:
  Entries: 0
  Total Size: 0 KB

Cache Hit Rate: N/A (no data)
```

Run `superagents` to rebuild cache.

## Next Steps

- [Caching Concepts](../concepts/caching.md) - How caching works
- [Generation Process](../concepts/generation.md) - What gets cached
- [Generate Command](generate.md) - Generate with cache
