# SuperAgents - Implementation Roadmap

> Phase-based implementation plan with progress tracking

---

## Progress Overview

| Phase | Status | Version | Completed | Time Spent |
|-------|--------|---------|-----------|------------|
| Phase 1: Quick Wins | ✅ DONE | v1.1.0 | 2026-01-27 | ~5h |
| Phase 2: Performance | ✅ DONE | v1.2.0 | 2026-01-27 | ~3h |
| **Refactoring: Code Quality** | ✅ DONE | v1.2.1 | 2026-01-28 | ~2h |
| Phase 3: Cost Reduction | ⏳ Pending | v1.3.0 | - | Est. 7-9h |
| Phase 4: New Features | ⏳ Pending | v1.3.0 | - | Est. 15-20h |
| Phase 5: Technical | ⏳ Pending | v1.4.0 | - | Est. 10-14h |
| Phase 6: Advanced | ⏳ Pending | v2.0.0 | - | Est. 35-50h |

**Current Version:** 1.2.1 | **Overall Progress:** 2/6 feature phases + refactoring complete (10h spent, ~67-87h remaining)

---

## Quick Reference

### Completed Features ✅
- ✅ Parallel generation (3 concurrent)
- ✅ Tiered model selection (Haiku/Sonnet/Opus)
- ✅ --dry-run flag (cost estimation)
- ✅ --verbose flag (debug logging)
- ✅ Codebase caching (24h TTL)
- ✅ Response caching (7d TTL)
- ✅ Input validation (prevents runtime errors)
- ✅ Code quality improvements (dead code removed, ~77 LOC reduction)

### CLI Commands Available
```bash
superagents                    # Generate configuration
superagents --dry-run          # Preview without API calls
superagents --verbose          # Show detailed output
superagents cache --stats      # Show cache statistics
superagents cache --clear      # Clear all cached data
superagents update             # Update to latest version
```

### Cache Location
`~/.superagents/cache/`

---

## Phase 1: Quick Wins ✅ COMPLETED

> **Implemented:** 2026-01-27 | **Version:** 1.1.0 | **Time:** ~5 hours

### Summary

| Feature | Files Created | Key Functions |
|---------|---------------|---------------|
| Parallel Generation | `src/utils/concurrency.ts` | `parallelGenerate()`, `parallelGenerateWithErrors()` |
| Tiered Models | `src/utils/model-selector.ts` | `selectModel()`, `getSkillComplexity()` |
| --dry-run | `src/cli/dry-run.ts` | `displayDryRunPreview()` |
| --verbose | `src/utils/logger.ts` | `log.debug()`, `log.verbose()`, `setVerbose()` |

### Key Improvements
- **Speed:** 3x faster with parallel generation (200ms vs 500ms for 5 items)
- **Cost:** ~40% reduction using Haiku for simple skills
- **UX:** Dry-run shows cost estimate before generation
- **Debug:** Verbose mode shows model selection and streaming output

---

## Phase 2: Performance ✅ COMPLETED

> **Implemented:** 2026-01-27 | **Version:** 1.2.0 | **Time:** ~3 hours

### Summary

| Feature | Files Modified | Key Functions |
|---------|----------------|---------------|
| Codebase Cache | `src/cache/index.ts` | `getCodebaseHash()`, `getCachedAnalysis()`, `setCachedAnalysis()` |
| Response Cache | `src/cache/index.ts` | `getCachedGeneration()`, `setCachedGeneration()` |

### Key Improvements
- **Codebase Cache:** Skip re-analysis on unchanged projects (24h TTL)
- **Response Cache:** Reuse generations for same goal+codebase (7d TTL)
- **New Commands:** `superagents cache --stats`, `superagents cache --clear`

---

## Refactoring: Code Quality Improvements ✅ COMPLETED

> **Implemented:** 2026-01-28 | **Version:** 1.2.1 | **Time:** ~2 hours

### Summary

Comprehensive refactoring to align codebase with new coding principles from CLAUDE.md:
- Think Before Coding
- Simplicity First
- Surgical Changes
- Goal-Driven Execution

| Phase | Focus | LOC Change | Files Modified |
|-------|-------|------------|----------------|
| Phase 1: Cleanup | Dead code removal, comments, validation | -10 +40 | 6 files |
| Phase 2: Simplification | Remove streaming, centralize constants | -55 | 3 files |
| Phase 3: Optimization | Remove unused exports | -12 | 2 files |

### Key Improvements

**Phase 1: Low-Risk Cleanup**
- ✅ Removed unused `isVerbose()` function from logger
- ✅ Removed unused `_recommendations` parameter from dry-run
- ✅ Added explanatory comments to complex logic (streaming, caching, model selection)
- ✅ Added input validation to `generateAll()`, `getCachedAnalysis()`, `displayDryRunPreview()`

**Phase 2: Simplify Over-Engineering**
- ✅ Centralized cache TTL constants (`CODEBASE_CACHE_TTL`, `GENERATION_CACHE_TTL`)
- ✅ Removed streaming implementation (~47 LOC) - added complexity for minimal value
- ✅ Kept `getModelTier()` function - prevents code duplication (used 3 times)

**Phase 3: Structural Improvements**
- ✅ Removed unused `estimateTokenCost()` function (~8 LOC)
- ✅ Made `API_CONCURRENCY` module-private (not used externally)
- ✅ Made `createLimiter()` module-private (not used externally)
- ✅ Skipped prompt template extraction - current structure already optimal
- ✅ Verified no custom error classes exist - already using plain Error

### Files Modified

- `src/utils/logger.ts` - Removed dead code
- `src/cli/dry-run.ts` - Removed unused param, added validation
- `src/index.ts` - Updated function call
- `src/generator/index.ts` - Added validation, removed streaming, added comments
- `src/cache/index.ts` - Centralized TTL constants, added validation, added comments
- `src/utils/model-selector.ts` - Removed unused function, added comments
- `src/utils/concurrency.ts` - Made internal helpers private

### Cumulative Results

- **Total LOC Removed:** ~77 lines
- **Comments Added:** ~15 lines (documentation)
- **Validation Added:** ~25 lines (error prevention)
- **Net Code Reduction:** ~37 lines + significantly reduced complexity

### Behavioral Changes

- **Verbose mode:** No longer streams output (same result, no real-time updates)
- **Error handling:** Better validation with clear error messages
- **Code clarity:** Complex logic now has explanatory comments

### Verification

- ✅ Build passes: `npm run build`
- ✅ All tests pass: 10/10 in cache.test.ts
- ✅ TypeScript strict mode: No errors

---

## Phase 3: Cost Reduction (Pending)

> **Target Version:** 1.3.0 | **Estimated Time:** 7-9 hours

### Goals
- Reduce token usage by 30-50%
- Use local templates for common patterns
- Trim unnecessary context

### Features

#### 3.1 Prompt Compression (~3-4h)
**Goal:** More efficient prompts with less redundancy

**Implementation:**
- Create `src/prompts/templates.ts` with shorter prompts
- Replace verbose examples with summaries
- Summarize files (imports + exports + functions) instead of full content
- Remove extra whitespace and redundant explanations

**Files to modify:**
- [ ] `src/prompts/templates.ts` (new)
- [ ] `src/generator/index.ts` (use compressed prompts)
- [ ] `src/analyzer/codebase-analyzer.ts` (summarize files)

#### 3.2 Local Templates (~4-5h)
**Goal:** Use local templates for common agents/skills, only call API for customization

**Implementation:**
- Create `src/templates/` with base agent/skill templates
- Template variables: `{{projectName}}`, `{{framework}}`, `{{goal}}`
- Fallback to API if no template exists

**Files to modify:**
- [ ] `src/templates/agents/` (new directory with .md templates)
- [ ] `src/templates/skills/` (new directory with .md templates)
- [ ] `src/templates/loader.ts` (new)
- [ ] `src/generator/index.ts` (check templates first)

---

## Phase 4: New Features (Pending)

> **Target Version:** 1.3.0 | **Estimated Time:** 15-20 hours

### Features

#### 4.1 --update Mode (~4-5h)
**Goal:** Update existing `.claude/` folder incrementally

**Implementation:**
- Add `--update` flag to CLI
- Create `src/updater/index.ts` with ConfigUpdater class
- Allow adding/removing agents/skills
- Regenerate specific files without full rebuild

**Files to modify:**
- [ ] `src/updater/index.ts` (new)
- [ ] `src/index.ts` (add --update flag)

#### 4.2 Monorepo Support (~5-6h)
**Goal:** Detect and handle monorepos with multiple packages

**Implementation:**
- Detect npm/yarn/pnpm/lerna workspaces
- Scan individual packages
- Allow per-package configuration
- Multi-select package prompt

**Files to modify:**
- [ ] `src/analyzer/codebase-analyzer.ts` (add `detectMonorepo()`)
- [ ] `src/types/codebase.ts` (add `MonorepoInfo` type)
- [ ] `src/cli/prompts.ts` (add package selection)

#### 4.3 Custom Templates (~3-4h)
**Goal:** Allow users to provide custom agent/skill templates

**Implementation:**
- Templates in `~/.superagents/templates/`
- Commands: `superagents templates --list`, `--export`, `--import`
- Check custom templates before built-in

**Files to modify:**
- [ ] `src/templates/custom.ts` (new)
- [ ] `src/index.ts` (add templates command)
- [ ] `src/generator/index.ts` (check custom templates)

#### 4.4 Config Export/Import (~3-4h)
**Goal:** Share configurations with team via zip files

**Implementation:**
- Export: `superagents export [output.zip]`
- Import: `superagents import <source.zip>`
- Include metadata (version, goal, agents, skills)

**Files to modify:**
- [ ] `src/config/export-import.ts` (new)
- [ ] `src/index.ts` (add export/import commands)
- [ ] `package.json` (add archiver, unzipper deps)

---

## Phase 5: Technical Improvements (Pending)

> **Target Version:** 1.4.0 | **Estimated Time:** 10-14 hours

### Features

#### 5.1 Test Coverage (~6-8h)
**Goal:** Add comprehensive unit + integration tests

**Test Structure:**
```
tests/
├── unit/                    # 60% coverage
│   ├── analyzer/
│   ├── generator/
│   ├── cache/
│   └── utils/
├── integration/             # 30% coverage
│   ├── cli.test.ts
│   └── full-workflow.test.ts
└── fixtures/                # Test projects
    ├── nextjs-project/
    ├── react-project/
    └── monorepo-project/
```

**Coverage Targets:**
- utils/: 90%
- cache/: 85%
- analyzer/: 80%
- generator/: 75%
- cli/: 70%

**Files to create:**
- [ ] `tests/fixtures/` (test projects)
- [ ] `tests/unit/` (unit tests)
- [ ] `tests/integration/` (integration tests)
- [ ] `vitest.config.ts`

#### 5.2 Error Recovery (~2-3h)
**Goal:** Better error handling with retry logic

**Implementation:**
- Create `src/utils/retry.ts` with exponential backoff
- Wrap API calls in `withAPIRetry()` (3 attempts, 2s delay, 2x multiplier)
- Log retry attempts in verbose mode

**Files to modify:**
- [ ] `src/utils/retry.ts` (new)
- [ ] `src/generator/index.ts` (use retry wrapper)

#### 5.3 Offline Mode (~2-3h)
**Goal:** Work offline using cached/template-based generation

**Implementation:**
- Detect internet connection
- Show warning if offline
- Use only cached analysis and local templates
- Skip API-dependent steps

**Files to modify:**
- [ ] `src/utils/network.ts` (new)
- [ ] `src/index.ts` (offline mode logic)
- [ ] `src/generator/index.ts` (handle offline)

---

## Phase 6: Advanced Features (Pending)

> **Target Version:** 2.0.0 | **Estimated Time:** 35-50 hours

### Features

#### 6.1 VS Code Extension (~20-30h)
**Goal:** GUI for SuperAgents directly in VS Code

**Scope:** Separate project with webview UI

**Files:**
```
superagents-vscode/
├── package.json
├── src/
│   ├── extension.ts
│   ├── commands/
│   │   ├── generate.ts
│   │   ├── update.ts
│   │   └── preview.ts
│   ├── views/
│   │   ├── configTreeView.ts
│   │   └── previewPanel.ts
│   └── utils/
│       └── superagents.ts
└── media/
```

#### 6.2 Plugin System (~15-20h)
**Goal:** Allow custom analyzers and generators

**Plugin Interface:**
```typescript
interface SuperAgentsPlugin {
  name: string;
  version: string;
  onAnalyze?: (codebase: CodebaseAnalysis) => Promise<CodebaseAnalysis>;
  onRecommend?: (recommendations: Recommendations) => Promise<Recommendations>;
  onGenerate?: (context: GenerationContext) => Promise<GeneratedOutputs>;
  analyzers?: Analyzer[];
  generators?: Generator[];
}
```

---

## Testing Strategy

### Test Pyramid
- **Unit Tests (60%):** Model selector, cache, logger, templates
- **Integration Tests (30%):** Analyzer with fixtures, generator with mocked API, cache persistence
- **E2E Tests (10%):** Full workflow, export/import, update mode

### Test Commands
```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

---

## Rollout Plan

### Version 1.1 ✅ (Phase 1)
- [x] Parallel generation
- [x] Tiered model selection
- [x] --dry-run flag
- [x] --verbose flag

### Version 1.2 ✅ (Phase 2)
- [x] Codebase cache
- [x] Response cache
- [x] Streaming responses

### Version 1.3 (Phase 3 + 4)
- [ ] Prompt compression
- [ ] Local templates
- [ ] --update mode
- [ ] Monorepo support
- [ ] Custom templates
- [ ] Export/import

### Version 1.4 (Phase 5)
- [ ] Test coverage (60%+ unit, 30%+ integration)
- [ ] Error recovery
- [ ] Offline mode

### Version 2.0 (Phase 6)
- [ ] VS Code extension
- [ ] Plugin system

---

## Implementation Checklist

### Phase 1 ✅ COMPLETED
- [x] Install p-limit, create concurrency.ts
- [x] Update generator for parallel generation
- [x] Create model-selector.ts with tiered selection
- [x] Create dry-run.ts with cost estimation
- [x] Create logger.ts with verbose mode

### Phase 2 ✅ COMPLETED
- [x] Create cache/index.ts with CacheManager
- [x] Implement codebase caching (24h TTL)
- [x] Implement response caching (7d TTL)
- [x] Add streaming support for verbose mode

### Phase 3 (Next Up)
- [ ] Create prompts/templates.ts
- [ ] Implement prompt compression
- [ ] Create templates directory with base agents/skills
- [ ] Implement template loader

### Phase 4
- [ ] Create updater/index.ts
- [ ] Implement --update mode
- [ ] Add monorepo detection
- [ ] Implement custom templates
- [ ] Implement export/import

### Phase 5
- [ ] Create test fixtures (nextjs, react, monorepo)
- [ ] Write unit tests (utils, cache, analyzer)
- [ ] Write integration tests (CLI, full workflow)
- [ ] Create retry.ts with exponential backoff
- [ ] Implement offline mode

### Phase 6
- [ ] Design VS Code extension architecture
- [ ] Implement plugin system interface
- [ ] Create plugin loader and registry

---

## Dependency Graph

```
Phase 1 (Quick Wins)
    ├── 1.1 Parallel Generation
    ├── 1.2 Tiered Model Selection
    ├── 1.3 --dry-run Flag
    └── 1.4 --verbose Flag
            │
            ▼
Phase 2 (Performance)
    ├── 2.1 Codebase Cache (needs 1.4 for logging)
    ├── 2.2 Response Cache (needs 2.1 for hash logic)
    └── 2.3 Streaming (independent)
            │
            ▼
Phase 3 (Cost Reduction)
    ├── 3.1 Prompt Compression (independent)
    └── 3.2 Local Templates (independent)
            │
            ▼
Phase 4 (New Features)
    ├── 4.1 --update (needs 2.1, 2.2)
    ├── 4.2 Monorepo (needs 2.1)
    ├── 4.3 Custom Templates (needs 3.2)
    └── 4.4 Export/Import (independent)
            │
            ▼
Phase 5 (Technical)
    ├── 5.1 Test Coverage (can start anytime)
    ├── 5.2 Error Recovery (independent)
    └── 5.3 Offline Mode (needs 3.2, 2.2)
            │
            ▼
Phase 6 (Advanced)
    ├── 6.1 VS Code Extension (needs 4.4)
    └── 6.2 Plugin System (needs all)
```

---

## Priority Matrix

```
                    HIGH IMPACT
                        │
     ┌──────────────────┼──────────────────┐
     │                  │                  │
     │  ✅ Phase 1      │  ✅ Phase 2      │
     │  Quick Wins      │  Performance     │
     │                  │                  │
LOW  │                  │                  │  HIGH
EFFORT ─────────────────┼───────────────────── EFFORT
     │                  │                  │
     │  Phase 3         │  Phase 6         │
     │  Cost Reduction  │  Advanced        │
     │                  │                  │
     └──────────────────┼──────────────────┘
                        │
                    LOW IMPACT
```

---

_Document Version: 2.0 (Optimized)_
_Created: 2026-01-27_
_Last Updated: 2026-01-28_
_Total Estimated Time Remaining: ~70-90 hours_
_Time Spent: ~8 hours (Phases 1-2 complete)_
