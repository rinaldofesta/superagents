# SuperAgents - New Implementation Plan

> Detailed step-by-step guide to implement all planned improvements

---

## Table of Contents

1. [Implementation Order](#implementation-order)
2. [Phase 1: Quick Wins](#phase-1-quick-wins)
3. [Phase 2: Performance Optimizations](#phase-2-performance-optimizations)
4. [Phase 3: Cost Reduction](#phase-3-cost-reduction)
5. [Phase 4: New Features](#phase-4-new-features)
6. [Phase 5: Technical Improvements](#phase-5-technical-improvements)
7. [Phase 6: Advanced Features](#phase-6-advanced-features)
8. [Testing Strategy](#testing-strategy)
9. [Rollout Plan](#rollout-plan)

---

## Implementation Order

### Priority Matrix

```
                    HIGH IMPACT
                        │
     ┌──────────────────┼──────────────────┐
     │                  │                  │
     │  P1: Quick Wins  │  P2: Performance │
     │  - Parallel Gen  │  - Caching       │
     │  - Tiered Models │  - Streaming     │
     │  - Dry-run       │                  │
LOW  │                  │                  │  HIGH
EFFORT ─────────────────┼───────────────────── EFFORT
     │                  │                  │
     │  P3: Features    │  P4: Advanced    │
     │  - Update mode   │  - VS Code Ext   │
     │  - Monorepo      │  - Plugin System │
     │                  │                  │
     └──────────────────┼──────────────────┘
                        │
                    LOW IMPACT
```

### Dependency Graph

```
Phase 1 (Quick Wins)
    ├── 1.1 Parallel Generation (no deps)
    ├── 1.2 Tiered Model Selection (no deps)
    ├── 1.3 --dry-run Flag (no deps)
    └── 1.4 --verbose Flag (no deps)
            │
            ▼
Phase 2 (Performance)
    ├── 2.1 Codebase Cache (depends on 1.4 for logging)
    ├── 2.2 Response Cache (depends on 2.1 for hash logic)
    └── 2.3 Streaming Responses (no deps)
            │
            ▼
Phase 3 (Cost Reduction)
    ├── 3.1 Prompt Compression (no deps)
    ├── 3.2 Local Templates (no deps)
    └── 3.3 Smart Context Trimming (depends on 3.1)
            │
            ▼
Phase 4 (New Features)
    ├── 4.1 --update Mode (depends on 2.1, 2.2)
    ├── 4.2 Monorepo Support (depends on 2.1)
    ├── 4.3 Custom Templates (depends on 3.2)
    └── 4.4 Config Export/Import (no deps)
            │
            ▼
Phase 5 (Technical)
    ├── 5.1 Test Coverage (can start anytime)
    ├── 5.2 Error Recovery (no deps)
    └── 5.3 Offline Mode (depends on 3.2, 2.2)
            │
            ▼
Phase 6 (Advanced)
    ├── 6.1 VS Code Extension (depends on 4.4)
    ├── 6.2 Plugin System (depends on all)
    └── 6.3 Web Interface (depends on 4.4)
```

---

## Phase 1: Quick Wins

### 1.1 Parallel Generation

**Goal:** Generate multiple agents/skills concurrently instead of sequentially.

**Current Code** (`src/generator/index.ts`):
```typescript
// Current: Sequential generation
for (const agentName of context.selectedAgents) {
  const agent = await this.generateAgent(context, agentName);
  outputs.agents.push(agent);
}
```

**New Code:**
```typescript
// New: Parallel generation with concurrency limit
import pLimit from 'p-limit';

const limit = pLimit(3); // Max 3 concurrent API calls

const agentPromises = context.selectedAgents.map(agentName =>
  limit(() => this.generateAgent(context, agentName))
);

const agents = await Promise.all(agentPromises);
outputs.agents.push(...agents);
```

**Implementation Steps:**

1. **Install dependency:**
   ```bash
   npm install p-limit
   ```

2. **Create file** `src/utils/concurrency.ts`:
   ```typescript
   import pLimit from 'p-limit';

   // Limit concurrent API calls to avoid rate limiting
   export const API_CONCURRENCY = 3;
   export const createLimiter = () => pLimit(API_CONCURRENCY);

   export async function parallelGenerate<T>(
     items: string[],
     generator: (item: string) => Promise<T>,
     onProgress?: (completed: number, total: number, item: string) => void
   ): Promise<T[]> {
     const limit = createLimiter();
     let completed = 0;

     const promises = items.map(item =>
       limit(async () => {
         const result = await generator(item);
         completed++;
         onProgress?.(completed, items.length, item);
         return result;
       })
     );

     return Promise.all(promises);
   }
   ```

3. **Update** `src/generator/index.ts`:
   ```typescript
   import { parallelGenerate } from '../utils/concurrency.js';

   async generateAll(context: GenerationContext): Promise<GeneratedOutputs> {
     const outputs: GeneratedOutputs = {
       agents: [],
       skills: [],
       hooks: [],
       claudeMd: '',
       settings: {}
     };

     const totalItems = context.selectedAgents.length + context.selectedSkills.length + 1;
     let completed = 0;

     const spinner = ora({
       text: `Generating... 0%`,
       spinner: 'dots'
     }).start();

     const updateProgress = (item: string) => {
       completed++;
       const percent = Math.round((completed / totalItems) * 100);
       spinner.text = `[${percent}%] ✓ ${item}`;
     };

     // Generate agents in parallel
     outputs.agents = await parallelGenerate(
       context.selectedAgents,
       (name) => this.generateAgent(context, name),
       (_, __, item) => updateProgress(`Agent: ${item}`)
     );

     // Generate skills in parallel
     outputs.skills = await parallelGenerate(
       context.selectedSkills,
       (name) => this.generateSkill(context, name),
       (_, __, item) => updateProgress(`Skill: ${item}`)
     );

     // Generate CLAUDE.md (single call)
     outputs.claudeMd = await this.generateClaudeMd(context);
     updateProgress('CLAUDE.md');

     spinner.succeed(`Generation complete! [100%]`);
     return outputs;
   }
   ```

4. **Test:**
   ```bash
   npm run build
   superagents  # Should be noticeably faster with multiple agents/skills
   ```

**Files to modify:**
- [ ] `package.json` - Add p-limit dependency
- [ ] `src/utils/concurrency.ts` - Create new file
- [ ] `src/generator/index.ts` - Update to use parallel generation

**Estimated time:** 1-2 hours

---

### 1.2 Tiered Model Selection

**Goal:** Use cheaper/faster models for simpler tasks automatically.

**Strategy:**
- **Haiku** (`claude-3-5-haiku-20241022`): Simple skills, hooks
- **Sonnet** (`claude-sonnet-4-5-20250929`): Agents, complex skills
- **Opus** (`claude-opus-4-5-20251101`): CLAUDE.md (only if user selected Opus)

**Implementation Steps:**

1. **Create file** `src/utils/model-selector.ts`:
   ```typescript
   export type ModelTier = 'haiku' | 'sonnet' | 'opus';
   export type GenerationType = 'agent' | 'skill' | 'hook' | 'claude-md';

   export const MODEL_IDS = {
     haiku: 'claude-3-5-haiku-20241022',
     sonnet: 'claude-sonnet-4-5-20250929',
     opus: 'claude-opus-4-5-20251101'
   } as const;

   // Cost per 1M tokens (approximate)
   export const MODEL_COSTS = {
     haiku: { input: 0.25, output: 1.25 },
     sonnet: { input: 3, output: 15 },
     opus: { input: 15, output: 75 }
   } as const;

   interface ModelSelectionOptions {
     userSelectedModel: 'sonnet' | 'opus';
     generationType: GenerationType;
     complexity?: 'simple' | 'medium' | 'complex';
   }

   export function selectModel(options: ModelSelectionOptions): string {
     const { userSelectedModel, generationType, complexity = 'medium' } = options;

     // Simple mapping based on generation type
     const tierMap: Record<GenerationType, ModelTier> = {
       'hook': 'haiku',           // Hooks are simple bash scripts
       'skill': complexity === 'simple' ? 'haiku' : 'sonnet',
       'agent': 'sonnet',         // Agents need good reasoning
       'claude-md': userSelectedModel  // Respect user's choice for main doc
     };

     const tier = tierMap[generationType];

     // Never use a model more expensive than user selected
     if (tier === 'opus' && userSelectedModel === 'sonnet') {
       return MODEL_IDS.sonnet;
     }

     return MODEL_IDS[tier];
   }

   // Determine skill complexity based on name
   export function getSkillComplexity(skillName: string): 'simple' | 'medium' | 'complex' {
     const simpleSkills = ['markdown', 'git', 'npm', 'eslint', 'prettier'];
     const complexSkills = ['nextjs', 'react', 'typescript', 'graphql', 'kubernetes'];

     if (simpleSkills.includes(skillName)) return 'simple';
     if (complexSkills.includes(skillName)) return 'complex';
     return 'medium';
   }
   ```

2. **Update** `src/generator/index.ts`:
   ```typescript
   import { selectModel, getSkillComplexity } from '../utils/model-selector.js';

   async generateAgent(context: GenerationContext, agentName: string): Promise<AgentOutput> {
     const model = selectModel({
       userSelectedModel: context.selectedModel,
       generationType: 'agent'
     });

     // Use model in API call...
   }

   async generateSkill(context: GenerationContext, skillName: string): Promise<SkillOutput> {
     const complexity = getSkillComplexity(skillName);
     const model = selectModel({
       userSelectedModel: context.selectedModel,
       generationType: 'skill',
       complexity
     });

     // Use model in API call...
   }
   ```

3. **Add verbose logging** (optional, for debugging):
   ```typescript
   if (context.verbose) {
     console.log(pc.dim(`  Using model: ${model} for ${agentName}`));
   }
   ```

**Files to modify:**
- [ ] `src/utils/model-selector.ts` - Create new file
- [ ] `src/generator/index.ts` - Use tiered model selection
- [ ] `src/types/generation.ts` - Add `verbose` to GenerationContext

**Estimated time:** 1-2 hours

---

### 1.3 --dry-run Flag

**Goal:** Preview what would be generated without making API calls.

**Implementation Steps:**

1. **Update** `src/index.ts` to add flag:
   ```typescript
   program
     .name('superagents')
     .description('Context-aware Claude Code configuration generator')
     .version('1.0.0')
     .option('--dry-run', 'Preview what would be generated without making API calls')
     .option('-v, --verbose', 'Show detailed output')
     .action(async (options) => {
       const isDryRun = options.dryRun || false;
       const isVerbose = options.verbose || false;

       // ... existing code ...

       if (isDryRun) {
         displayDryRunPreview(context, recommendations);
         return;
       }

       // ... continue with actual generation ...
     });
   ```

2. **Create** `src/cli/dry-run.ts`:
   ```typescript
   import pc from 'picocolors';
   import type { GenerationContext } from '../types/generation.js';
   import type { Recommendations } from '../types/config.js';
   import { selectModel, getSkillComplexity, MODEL_COSTS } from '../utils/model-selector.js';

   export function displayDryRunPreview(
     context: GenerationContext,
     recommendations: Recommendations
   ): void {
     console.log('\n' + pc.yellow('═'.repeat(60)));
     console.log(pc.yellow(pc.bold('  DRY RUN - No files will be created')));
     console.log(pc.yellow('═'.repeat(60)) + '\n');

     // Show what would be generated
     console.log(pc.bold('Would generate:\n'));

     console.log(pc.cyan('  Agents:'));
     for (const agent of context.selectedAgents) {
       const model = selectModel({
         userSelectedModel: context.selectedModel,
         generationType: 'agent'
       });
       console.log(pc.dim(`    → ${agent} (using ${model})`));
     }

     console.log(pc.cyan('\n  Skills:'));
     for (const skill of context.selectedSkills) {
       const complexity = getSkillComplexity(skill);
       const model = selectModel({
         userSelectedModel: context.selectedModel,
         generationType: 'skill',
         complexity
       });
       console.log(pc.dim(`    → ${skill} (${complexity}, using ${model})`));
     }

     console.log(pc.cyan('\n  Other files:'));
     console.log(pc.dim('    → CLAUDE.md'));
     console.log(pc.dim('    → settings.json'));
     console.log(pc.dim('    → hooks/skill-loader.sh'));

     // Show output location
     console.log(pc.bold('\nOutput directory:'));
     console.log(pc.dim(`  ${context.codebase.projectRoot}/.claude/`));

     // Estimate cost
     const estimate = estimateCost(context);
     console.log(pc.bold('\nEstimated API cost:'));
     console.log(pc.dim(`  ~$${estimate.toFixed(4)} USD`));

     // Show command to run for real
     console.log(pc.bold('\nTo generate for real, run:'));
     console.log(pc.green('  superagents\n'));
   }

   function estimateCost(context: GenerationContext): number {
     // Rough estimates based on typical token usage
     const TOKENS_PER_AGENT = { input: 2000, output: 3000 };
     const TOKENS_PER_SKILL = { input: 1500, output: 2000 };
     const TOKENS_CLAUDE_MD = { input: 3000, output: 4000 };

     let totalCost = 0;

     // Agents
     for (const agent of context.selectedAgents) {
       const model = selectModel({
         userSelectedModel: context.selectedModel,
         generationType: 'agent'
       });
       const tier = model.includes('haiku') ? 'haiku' : model.includes('opus') ? 'opus' : 'sonnet';
       const cost = MODEL_COSTS[tier];
       totalCost += (TOKENS_PER_AGENT.input * cost.input + TOKENS_PER_AGENT.output * cost.output) / 1_000_000;
     }

     // Skills
     for (const skill of context.selectedSkills) {
       const complexity = getSkillComplexity(skill);
       const model = selectModel({
         userSelectedModel: context.selectedModel,
         generationType: 'skill',
         complexity
       });
       const tier = model.includes('haiku') ? 'haiku' : model.includes('opus') ? 'opus' : 'sonnet';
       const cost = MODEL_COSTS[tier];
       totalCost += (TOKENS_PER_SKILL.input * cost.input + TOKENS_PER_SKILL.output * cost.output) / 1_000_000;
     }

     // CLAUDE.md
     const claudeModel = selectModel({
       userSelectedModel: context.selectedModel,
       generationType: 'claude-md'
     });
     const claudeTier = claudeModel.includes('haiku') ? 'haiku' : claudeModel.includes('opus') ? 'opus' : 'sonnet';
     const claudeCost = MODEL_COSTS[claudeTier];
     totalCost += (TOKENS_CLAUDE_MD.input * claudeCost.input + TOKENS_CLAUDE_MD.output * claudeCost.output) / 1_000_000;

     return totalCost;
   }
   ```

3. **Update** `src/cli/banner.ts` to export new function:
   ```typescript
   export { displayDryRunPreview } from './dry-run.js';
   ```

4. **Test:**
   ```bash
   npm run build
   superagents --dry-run
   ```

**Files to modify:**
- [ ] `src/index.ts` - Add --dry-run and --verbose flags
- [ ] `src/cli/dry-run.ts` - Create new file
- [ ] `src/utils/model-selector.ts` - Export MODEL_COSTS

**Estimated time:** 2-3 hours

---

### 1.4 --verbose Flag

**Goal:** Show detailed logging for debugging and transparency.

**Implementation Steps:**

1. **Create** `src/utils/logger.ts`:
   ```typescript
   import pc from 'picocolors';

   let verboseMode = false;

   export function setVerbose(enabled: boolean): void {
     verboseMode = enabled;
   }

   export function isVerbose(): boolean {
     return verboseMode;
   }

   export const log = {
     info: (message: string) => {
       console.log(pc.blue('ℹ') + ' ' + message);
     },

     success: (message: string) => {
       console.log(pc.green('✓') + ' ' + message);
     },

     warn: (message: string) => {
       console.log(pc.yellow('⚠') + ' ' + message);
     },

     error: (message: string) => {
       console.log(pc.red('✗') + ' ' + message);
     },

     debug: (message: string) => {
       if (verboseMode) {
         console.log(pc.dim('[DEBUG] ' + message));
       }
     },

     verbose: (message: string) => {
       if (verboseMode) {
         console.log(pc.dim('  → ' + message));
       }
     },

     section: (title: string) => {
       if (verboseMode) {
         console.log('\n' + pc.bold(pc.cyan(title)));
       }
     }
   };
   ```

2. **Update** `src/index.ts`:
   ```typescript
   import { setVerbose, log } from './utils/logger.js';

   .action(async (options) => {
     setVerbose(options.verbose || false);

     log.debug('Starting SuperAgents...');
     log.debug(`Working directory: ${process.cwd()}`);

     // ... rest of code ...
   });
   ```

3. **Use throughout codebase:**
   ```typescript
   // In analyzer
   log.debug(`Detected framework: ${framework}`);
   log.verbose(`Found ${files.length} source files`);

   // In generator
   log.debug(`Generating agent: ${agentName}`);
   log.verbose(`Using model: ${model}`);
   log.verbose(`Prompt tokens: ~${estimatedTokens}`);
   ```

**Files to modify:**
- [ ] `src/utils/logger.ts` - Create new file
- [ ] `src/index.ts` - Add --verbose flag and use logger
- [ ] `src/analyzer/codebase-analyzer.ts` - Add verbose logging
- [ ] `src/generator/index.ts` - Add verbose logging

**Estimated time:** 1-2 hours

---

## Phase 2: Performance Optimizations

### 2.1 Codebase Cache

**Goal:** Cache codebase analysis results to skip re-analysis on unchanged projects.

**Strategy:**
1. Hash key files (package.json, tsconfig.json, key source files)
2. Store analysis result with hash
3. On next run, compare hashes - if same, use cached result

**Implementation Steps:**

1. **Create** `src/cache/index.ts`:
   ```typescript
   import fs from 'fs-extra';
   import path from 'path';
   import crypto from 'crypto';
   import os from 'os';
   import type { CodebaseAnalysis } from '../types/codebase.js';

   const CACHE_DIR = path.join(os.homedir(), '.superagents', 'cache');
   const CACHE_VERSION = '1';  // Increment when cache format changes

   interface CacheEntry<T> {
     version: string;
     hash: string;
     timestamp: string;
     data: T;
   }

   export class CacheManager {
     private cacheDir: string;

     constructor() {
       this.cacheDir = CACHE_DIR;
     }

     async init(): Promise<void> {
       await fs.ensureDir(this.cacheDir);
     }

     async getCodebaseHash(projectRoot: string): Promise<string> {
       const filesToHash = [
         'package.json',
         'tsconfig.json',
         'package-lock.json',
         'yarn.lock',
         'pnpm-lock.yaml'
       ];

       const hashes: string[] = [];

       for (const file of filesToHash) {
         const filePath = path.join(projectRoot, file);
         if (await fs.pathExists(filePath)) {
           const content = await fs.readFile(filePath, 'utf-8');
           hashes.push(crypto.createHash('md5').update(content).digest('hex'));
         }
       }

       // Also hash the src directory structure (not content, just names)
       const srcDir = path.join(projectRoot, 'src');
       if (await fs.pathExists(srcDir)) {
         const files = await this.getFileList(srcDir);
         hashes.push(crypto.createHash('md5').update(files.join('\n')).digest('hex'));
       }

       return crypto.createHash('md5').update(hashes.join('-')).digest('hex');
     }

     private async getFileList(dir: string): Promise<string[]> {
       const entries = await fs.readdir(dir, { withFileTypes: true });
       const files: string[] = [];

       for (const entry of entries) {
         const fullPath = path.join(dir, entry.name);
         if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
           files.push(...await this.getFileList(fullPath));
         } else if (entry.isFile()) {
           files.push(fullPath);
         }
       }

       return files.sort();
     }

     async getCachedAnalysis(projectRoot: string): Promise<CodebaseAnalysis | null> {
       const hash = await this.getCodebaseHash(projectRoot);
       const cacheFile = path.join(this.cacheDir, `analysis-${hash}.json`);

       if (await fs.pathExists(cacheFile)) {
         try {
           const entry: CacheEntry<CodebaseAnalysis> = await fs.readJson(cacheFile);

           // Check version compatibility
           if (entry.version !== CACHE_VERSION) {
             return null;
           }

           // Check if cache is too old (24 hours)
           const age = Date.now() - new Date(entry.timestamp).getTime();
           if (age > 24 * 60 * 60 * 1000) {
             return null;
           }

           return entry.data;
         } catch {
           return null;
         }
       }

       return null;
     }

     async setCachedAnalysis(projectRoot: string, analysis: CodebaseAnalysis): Promise<void> {
       const hash = await this.getCodebaseHash(projectRoot);
       const cacheFile = path.join(this.cacheDir, `analysis-${hash}.json`);

       const entry: CacheEntry<CodebaseAnalysis> = {
         version: CACHE_VERSION,
         hash,
         timestamp: new Date().toISOString(),
         data: analysis
       };

       await fs.writeJson(cacheFile, entry, { spaces: 2 });
     }

     async clearCache(): Promise<void> {
       await fs.emptyDir(this.cacheDir);
     }
   }

   export const cache = new CacheManager();
   ```

2. **Update** `src/index.ts`:
   ```typescript
   import { cache } from './cache/index.js';

   // In main action:
   await cache.init();

   // Check cache first
   let codebaseAnalysis = await cache.getCachedAnalysis(process.cwd());

   if (codebaseAnalysis) {
     log.verbose('Using cached codebase analysis');
     spinner.stop(pc.green('✓') + ' Codebase analyzed (cached)');
   } else {
     spinner.start('Analyzing your codebase...');
     const analyzer = new CodebaseAnalyzer(process.cwd());
     codebaseAnalysis = await analyzer.analyze();
     await cache.setCachedAnalysis(process.cwd(), codebaseAnalysis);
     spinner.stop(pc.green('✓') + ' Codebase analyzed');
   }
   ```

3. **Add clear cache command:**
   ```typescript
   program
     .command('cache')
     .description('Manage cache')
     .option('--clear', 'Clear all cached data')
     .action(async (options) => {
       if (options.clear) {
         await cache.init();
         await cache.clearCache();
         console.log(pc.green('✓') + ' Cache cleared');
       }
     });
   ```

**Files to modify:**
- [ ] `src/cache/index.ts` - Create new file
- [ ] `src/index.ts` - Use cache, add cache command
- [ ] `package.json` - No new deps needed (using crypto from Node)

**Estimated time:** 3-4 hours

---

### 2.2 Response Cache

**Goal:** Cache AI-generated responses to avoid redundant API calls.

**Strategy:**
1. Hash: goal description + codebase hash + agent/skill name + model
2. Store generated content with hash
3. On cache hit, return cached content immediately

**Implementation Steps:**

1. **Extend** `src/cache/index.ts`:
   ```typescript
   interface GenerationCacheKey {
     goalDescription: string;
     codebaseHash: string;
     itemType: 'agent' | 'skill' | 'claude-md';
     itemName: string;
     model: string;
   }

   export class CacheManager {
     // ... existing code ...

     getGenerationHash(key: GenerationCacheKey): string {
       const str = JSON.stringify(key);
       return crypto.createHash('md5').update(str).digest('hex');
     }

     async getCachedGeneration(key: GenerationCacheKey): Promise<string | null> {
       const hash = this.getGenerationHash(key);
       const cacheFile = path.join(this.cacheDir, `gen-${hash}.txt`);

       if (await fs.pathExists(cacheFile)) {
         try {
           const entry: CacheEntry<string> = await fs.readJson(cacheFile + '.meta');

           if (entry.version !== CACHE_VERSION) {
             return null;
           }

           // Generation cache lasts 7 days
           const age = Date.now() - new Date(entry.timestamp).getTime();
           if (age > 7 * 24 * 60 * 60 * 1000) {
             return null;
           }

           return await fs.readFile(cacheFile, 'utf-8');
         } catch {
           return null;
         }
       }

       return null;
     }

     async setCachedGeneration(key: GenerationCacheKey, content: string): Promise<void> {
       const hash = this.getGenerationHash(key);
       const cacheFile = path.join(this.cacheDir, `gen-${hash}.txt`);

       const entry: CacheEntry<null> = {
         version: CACHE_VERSION,
         hash,
         timestamp: new Date().toISOString(),
         data: null
       };

       await fs.writeFile(cacheFile, content, 'utf-8');
       await fs.writeJson(cacheFile + '.meta', entry, { spaces: 2 });
     }
   }
   ```

2. **Update** `src/generator/index.ts`:
   ```typescript
   import { cache } from '../cache/index.js';

   async generateAgent(context: GenerationContext, agentName: string): Promise<AgentOutput> {
     const cacheKey = {
       goalDescription: context.goal.description,
       codebaseHash: await cache.getCodebaseHash(context.codebase.projectRoot),
       itemType: 'agent' as const,
       itemName: agentName,
       model: selectModel({ userSelectedModel: context.selectedModel, generationType: 'agent' })
     };

     // Check cache
     const cached = await cache.getCachedGeneration(cacheKey);
     if (cached) {
       log.verbose(`Using cached agent: ${agentName}`);
       return {
         filename: `${agentName}.md`,
         content: cached,
         agentName
       };
     }

     // Generate and cache
     const content = await this.callAPI(/* ... */);
     await cache.setCachedGeneration(cacheKey, content);

     return {
       filename: `${agentName}.md`,
       content,
       agentName
     };
   }
   ```

**Files to modify:**
- [ ] `src/cache/index.ts` - Add generation cache methods
- [ ] `src/generator/index.ts` - Use generation cache

**Estimated time:** 2-3 hours

---

### 2.3 Streaming Responses

**Goal:** Show AI-generated content in real-time for better perceived performance.

**Implementation Steps:**

1. **Update** `src/generator/index.ts`:
   ```typescript
   import Anthropic from '@anthropic-ai/sdk';

   async generateWithStreaming(
     prompt: string,
     model: string,
     onChunk: (text: string) => void
   ): Promise<string> {
     const anthropic = new Anthropic({ apiKey: this.apiKey });

     let fullContent = '';

     const stream = await anthropic.messages.stream({
       model,
       max_tokens: 4000,
       messages: [{ role: 'user', content: prompt }]
     });

     for await (const event of stream) {
       if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
         const text = event.delta.text;
         fullContent += text;
         onChunk(text);
       }
     }

     return fullContent;
   }
   ```

2. **Create streaming progress display:**
   ```typescript
   // In verbose mode, show streaming content
   if (context.verbose) {
     const content = await this.generateWithStreaming(
       prompt,
       model,
       (chunk) => process.stdout.write(pc.dim(chunk))
     );
     console.log(); // New line after streaming
     return content;
   } else {
     // Non-streaming for normal mode
     return await this.callAPI(prompt, model);
   }
   ```

**Files to modify:**
- [ ] `src/generator/index.ts` - Add streaming support

**Estimated time:** 2-3 hours

---

## Phase 3: Cost Reduction

### 3.1 Prompt Compression

**Goal:** Reduce token usage with more efficient prompts.

**Implementation Steps:**

1. **Create** `src/prompts/templates.ts`:
   ```typescript
   // Shorter, more efficient prompts

   export const AGENT_PROMPT_TEMPLATE = `Generate a Claude Code agent.

   PROJECT: {{goal}}
   TYPE: {{category}}
   FRAMEWORK: {{framework}}

   AGENT: {{agentName}}

   Output YAML frontmatter + markdown:
   ---
   name: {{agentName}}
   description: [2 lines, include "Use when:"]
   tools: Read, Edit, Write, Glob, Grep, Bash
   model: sonnet
   skills: [relevant skills]
   ---

   # {{agentName}}

   [Role description, 1-2 sentences]

   ## Context
   [Project-specific context]

   ## Patterns
   [Key patterns with code examples]

   ## Rules
   [Numbered critical rules]

   Be specific to THIS project. No generic content.`;

   export function compressPrompt(template: string, vars: Record<string, string>): string {
     let result = template;
     for (const [key, value] of Object.entries(vars)) {
       result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
     }
     // Remove extra whitespace
     return result.replace(/\n{3,}/g, '\n\n').trim();
   }
   ```

2. **Reduce context sent to API:**
   ```typescript
   // Instead of sending full file contents, send summaries
   function summarizeFile(content: string): string {
     const lines = content.split('\n');
     const imports = lines.filter(l => l.startsWith('import ')).slice(0, 10);
     const exports = lines.filter(l => l.includes('export ')).slice(0, 10);
     const functions = lines.filter(l => l.match(/^(async )?(function|const) \w+/)).slice(0, 10);

     return [
       '// Imports:',
       ...imports,
       '// Exports:',
       ...exports,
       '// Functions:',
       ...functions
     ].join('\n');
   }
   ```

**Files to modify:**
- [ ] `src/prompts/templates.ts` - Create new file
- [ ] `src/generator/index.ts` - Use compressed prompts
- [ ] `src/analyzer/codebase-analyzer.ts` - Summarize files instead of full content

**Estimated time:** 3-4 hours

---

### 3.2 Local Templates

**Goal:** Use local templates for common patterns, only call API for customization.

**Implementation Steps:**

1. **Create** `src/templates/` directory with base templates:
   ```
   src/templates/
   ├── agents/
   │   ├── frontend-engineer.md
   │   ├── backend-engineer.md
   │   ├── reviewer.md
   │   └── debugger.md
   ├── skills/
   │   ├── typescript.md
   │   ├── react.md
   │   ├── nextjs.md
   │   └── tailwind.md
   └── hooks/
       └── skill-loader.sh
   ```

2. **Create** `src/templates/loader.ts`:
   ```typescript
   import fs from 'fs-extra';
   import path from 'path';
   import { fileURLToPath } from 'url';

   const __dirname = path.dirname(fileURLToPath(import.meta.url));
   const TEMPLATES_DIR = path.join(__dirname, '..', '..', 'templates');

   export async function getTemplate(type: 'agent' | 'skill' | 'hook', name: string): Promise<string | null> {
     const templatePath = path.join(TEMPLATES_DIR, `${type}s`, `${name}.md`);

     if (await fs.pathExists(templatePath)) {
       return await fs.readFile(templatePath, 'utf-8');
     }

     return null;
   }

   export function customizeTemplate(template: string, context: Record<string, string>): string {
     let result = template;

     for (const [key, value] of Object.entries(context)) {
       result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
     }

     return result;
   }
   ```

3. **Update generator to use templates:**
   ```typescript
   async generateAgent(context: GenerationContext, agentName: string): Promise<AgentOutput> {
     // Try to get local template first
     const template = await getTemplate('agent', agentName);

     if (template) {
       // Customize template with project context (no API call!)
       const customized = customizeTemplate(template, {
         projectName: context.codebase.projectName,
         framework: context.codebase.framework || 'unknown',
         goal: context.goal.description
       });

       log.verbose(`Using local template for agent: ${agentName}`);

       return {
         filename: `${agentName}.md`,
         content: customized,
         agentName
       };
     }

     // Fall back to API generation
     log.verbose(`No template found, generating via API: ${agentName}`);
     return await this.generateAgentViaAPI(context, agentName);
   }
   ```

**Files to modify:**
- [ ] `src/templates/` - Create directory with templates
- [ ] `src/templates/loader.ts` - Create template loader
- [ ] `src/generator/index.ts` - Use templates when available

**Estimated time:** 4-5 hours

---

## Phase 4: New Features

### 4.1 --update Mode

**Goal:** Update existing `.claude/` folder without full regeneration.

**Implementation Steps:**

1. **Add flag to CLI:**
   ```typescript
   program
     .option('--update', 'Update existing .claude/ folder incrementally')
   ```

2. **Create** `src/updater/index.ts`:
   ```typescript
   import fs from 'fs-extra';
   import path from 'path';
   import pc from 'picocolors';
   import * as p from '@clack/prompts';

   interface UpdateOptions {
     addAgents?: string[];
     removeAgents?: string[];
     addSkills?: string[];
     removeSkills?: string[];
     regenerateClaudeMd?: boolean;
   }

   export class ConfigUpdater {
     private claudeDir: string;

     constructor(projectRoot: string) {
       this.claudeDir = path.join(projectRoot, '.claude');
     }

     async exists(): Promise<boolean> {
       return fs.pathExists(this.claudeDir);
     }

     async getCurrentConfig(): Promise<{
       agents: string[];
       skills: string[];
     }> {
       const agentsDir = path.join(this.claudeDir, 'agents');
       const skillsDir = path.join(this.claudeDir, 'skills');

       const agents = (await fs.pathExists(agentsDir))
         ? (await fs.readdir(agentsDir)).map(f => f.replace('.md', ''))
         : [];

       const skills = (await fs.pathExists(skillsDir))
         ? (await fs.readdir(skillsDir)).map(f => f.replace('.md', ''))
         : [];

       return { agents, skills };
     }

     async promptForUpdates(current: { agents: string[]; skills: string[] }): Promise<UpdateOptions> {
       const action = await p.select({
         message: 'What would you like to update?',
         options: [
           { value: 'add', label: 'Add new agents/skills' },
           { value: 'remove', label: 'Remove existing agents/skills' },
           { value: 'regenerate', label: 'Regenerate CLAUDE.md' },
           { value: 'all', label: 'Regenerate everything' }
         ]
       });

       // ... implementation based on selection ...
       return {};
     }
   }
   ```

3. **Update main CLI:**
   ```typescript
   if (options.update) {
     const updater = new ConfigUpdater(process.cwd());

     if (!(await updater.exists())) {
       displayError('No .claude/ folder found. Run superagents without --update first.');
       process.exit(1);
     }

     const current = await updater.getCurrentConfig();
     console.log(pc.dim(`Current config: ${current.agents.length} agents, ${current.skills.length} skills`));

     const updates = await updater.promptForUpdates(current);
     // ... apply updates ...
   }
   ```

**Files to modify:**
- [ ] `src/updater/index.ts` - Create new file
- [ ] `src/index.ts` - Add --update flag and logic

**Estimated time:** 4-5 hours

---

### 4.2 Monorepo Support

**Goal:** Detect and handle monorepos with multiple packages.

**Implementation Steps:**

1. **Update** `src/analyzer/codebase-analyzer.ts`:
   ```typescript
   interface MonorepoInfo {
     isMonorepo: boolean;
     rootPackage: string;
     packages: PackageInfo[];
     workspaceManager: 'npm' | 'yarn' | 'pnpm' | 'lerna' | null;
   }

   interface PackageInfo {
     name: string;
     path: string;
     type: ProjectType;
     dependencies: Dependency[];
   }

   async detectMonorepo(projectRoot: string): Promise<MonorepoInfo> {
     // Check for workspace configurations
     const pkg = await this.readPackageJson(projectRoot);

     if (!pkg) {
       return { isMonorepo: false, rootPackage: '', packages: [], workspaceManager: null };
     }

     // npm/yarn workspaces
     if (pkg.workspaces) {
       const workspaces = Array.isArray(pkg.workspaces)
         ? pkg.workspaces
         : pkg.workspaces.packages || [];

       const packages = await this.scanWorkspaces(projectRoot, workspaces);

       return {
         isMonorepo: true,
         rootPackage: pkg.name || 'root',
         packages,
         workspaceManager: await this.detectWorkspaceManager(projectRoot)
       };
     }

     // pnpm workspaces
     const pnpmWorkspace = path.join(projectRoot, 'pnpm-workspace.yaml');
     if (await fs.pathExists(pnpmWorkspace)) {
       // Parse pnpm-workspace.yaml
       // ...
     }

     // Lerna
     const lernaConfig = path.join(projectRoot, 'lerna.json');
     if (await fs.pathExists(lernaConfig)) {
       // Parse lerna.json
       // ...
     }

     return { isMonorepo: false, rootPackage: '', packages: [], workspaceManager: null };
   }

   private async scanWorkspaces(root: string, patterns: string[]): Promise<PackageInfo[]> {
     const packages: PackageInfo[] = [];

     for (const pattern of patterns) {
       const dirs = await glob(pattern, { cwd: root, onlyDirectories: true });

       for (const dir of dirs) {
         const pkgPath = path.join(root, dir, 'package.json');
         if (await fs.pathExists(pkgPath)) {
           const pkg = await fs.readJson(pkgPath);
           packages.push({
             name: pkg.name,
             path: dir,
             type: await this.detectProjectType(path.join(root, dir)),
             dependencies: this.extractDependencies(pkg)
           });
         }
       }
     }

     return packages;
   }
   ```

2. **Update prompts for monorepo:**
   ```typescript
   if (codebaseAnalysis.monorepo?.isMonorepo) {
     const selectedPackages = await p.multiselect({
       message: 'Which packages should we configure?',
       options: codebaseAnalysis.monorepo.packages.map(pkg => ({
         value: pkg.path,
         label: `${pkg.name} (${pkg.type})`,
         hint: pkg.path
       })),
       initialValues: codebaseAnalysis.monorepo.packages.map(p => p.path)
     });
   }
   ```

**Files to modify:**
- [ ] `src/analyzer/codebase-analyzer.ts` - Add monorepo detection
- [ ] `src/types/codebase.ts` - Add MonorepoInfo type
- [ ] `src/cli/prompts.ts` - Add package selection for monorepos

**Estimated time:** 5-6 hours

---

### 4.3 Custom Templates

**Goal:** Allow users to provide custom agent/skill templates.

**Implementation Steps:**

1. **Create** `src/templates/custom.ts`:
   ```typescript
   import fs from 'fs-extra';
   import path from 'path';
   import os from 'os';

   const CUSTOM_TEMPLATES_DIR = path.join(os.homedir(), '.superagents', 'templates');

   export async function initCustomTemplates(): Promise<void> {
     await fs.ensureDir(path.join(CUSTOM_TEMPLATES_DIR, 'agents'));
     await fs.ensureDir(path.join(CUSTOM_TEMPLATES_DIR, 'skills'));
   }

   export async function getCustomTemplate(type: 'agent' | 'skill', name: string): Promise<string | null> {
     const templatePath = path.join(CUSTOM_TEMPLATES_DIR, `${type}s`, `${name}.md`);

     if (await fs.pathExists(templatePath)) {
       return await fs.readFile(templatePath, 'utf-8');
     }

     return null;
   }

   export async function saveCustomTemplate(type: 'agent' | 'skill', name: string, content: string): Promise<void> {
     await initCustomTemplates();
     const templatePath = path.join(CUSTOM_TEMPLATES_DIR, `${type}s`, `${name}.md`);
     await fs.writeFile(templatePath, content, 'utf-8');
   }

   export async function listCustomTemplates(): Promise<{ agents: string[]; skills: string[] }> {
     await initCustomTemplates();

     const agents = await fs.readdir(path.join(CUSTOM_TEMPLATES_DIR, 'agents'));
     const skills = await fs.readdir(path.join(CUSTOM_TEMPLATES_DIR, 'skills'));

     return {
       agents: agents.map(f => f.replace('.md', '')),
       skills: skills.map(f => f.replace('.md', ''))
     };
   }
   ```

2. **Add CLI command:**
   ```typescript
   program
     .command('templates')
     .description('Manage custom templates')
     .option('--list', 'List custom templates')
     .option('--export <name>', 'Export a generated agent/skill as template')
     .option('--import <file>', 'Import a template file')
     .action(async (options) => {
       // ... implementation ...
     });
   ```

**Files to modify:**
- [ ] `src/templates/custom.ts` - Create new file
- [ ] `src/index.ts` - Add templates command
- [ ] `src/generator/index.ts` - Check custom templates first

**Estimated time:** 3-4 hours

---

### 4.4 Config Export/Import

**Goal:** Export/import configurations for sharing with team.

**Implementation Steps:**

1. **Create** `src/config/export-import.ts`:
   ```typescript
   import fs from 'fs-extra';
   import path from 'path';
   import archiver from 'archiver';
   import unzipper from 'unzipper';

   interface ExportedConfig {
     version: string;
     exportedAt: string;
     goal: string;
     category: string;
     agents: string[];
     skills: string[];
   }

   export async function exportConfig(claudeDir: string, outputPath: string): Promise<void> {
     const output = fs.createWriteStream(outputPath);
     const archive = archiver('zip', { zlib: { level: 9 } });

     archive.pipe(output);

     // Add all files from .claude/
     archive.directory(claudeDir, '.claude');

     // Add metadata
     const metadata: ExportedConfig = {
       version: '1.0.0',
       exportedAt: new Date().toISOString(),
       goal: 'Exported configuration',
       category: 'custom',
       agents: (await fs.readdir(path.join(claudeDir, 'agents'))).map(f => f.replace('.md', '')),
       skills: (await fs.readdir(path.join(claudeDir, 'skills'))).map(f => f.replace('.md', ''))
     };

     archive.append(JSON.stringify(metadata, null, 2), { name: 'superagents-meta.json' });

     await archive.finalize();
   }

   export async function importConfig(zipPath: string, targetDir: string): Promise<void> {
     const claudeDir = path.join(targetDir, '.claude');

     // Check if .claude exists
     if (await fs.pathExists(claudeDir)) {
       throw new Error('.claude/ directory already exists. Use --force to overwrite.');
     }

     // Extract zip
     await fs.createReadStream(zipPath)
       .pipe(unzipper.Extract({ path: targetDir }))
       .promise();
   }
   ```

2. **Add CLI commands:**
   ```typescript
   program
     .command('export')
     .description('Export .claude/ configuration as a zip file')
     .argument('[output]', 'Output file path', 'superagents-config.zip')
     .action(async (output) => {
       const claudeDir = path.join(process.cwd(), '.claude');

       if (!(await fs.pathExists(claudeDir))) {
         displayError('No .claude/ folder found');
         process.exit(1);
       }

       await exportConfig(claudeDir, output);
       console.log(pc.green('✓') + ` Exported to ${output}`);
     });

   program
     .command('import')
     .description('Import a .claude/ configuration from zip or URL')
     .argument('<source>', 'Zip file path or URL')
     .option('--force', 'Overwrite existing .claude/ folder')
     .action(async (source, options) => {
       // ... implementation ...
     });
   ```

**Files to modify:**
- [ ] `src/config/export-import.ts` - Create new file
- [ ] `src/index.ts` - Add export/import commands
- [ ] `package.json` - Add archiver, unzipper dependencies

**Estimated time:** 3-4 hours

---

## Phase 5: Technical Improvements

### 5.1 Test Coverage

**Goal:** Add comprehensive test coverage.

**Test Structure:**
```
tests/
├── unit/
│   ├── analyzer/
│   │   ├── codebase-analyzer.test.ts
│   │   └── detectors.test.ts
│   ├── generator/
│   │   ├── agents.test.ts
│   │   └── skills.test.ts
│   ├── cache/
│   │   └── cache.test.ts
│   └── utils/
│       ├── model-selector.test.ts
│       └── logger.test.ts
├── integration/
│   ├── cli.test.ts
│   └── full-workflow.test.ts
└── fixtures/
    ├── nextjs-project/
    ├── react-project/
    └── monorepo-project/
```

**Implementation Steps:**

1. **Create test fixtures:**
   ```bash
   mkdir -p tests/fixtures/nextjs-project
   # Create minimal package.json, tsconfig.json, etc.
   ```

2. **Create** `tests/unit/analyzer/codebase-analyzer.test.ts`:
   ```typescript
   import { describe, it, expect, beforeAll } from 'vitest';
   import { CodebaseAnalyzer } from '../../../src/analyzer/codebase-analyzer.js';
   import path from 'path';

   describe('CodebaseAnalyzer', () => {
     const fixturesDir = path.join(__dirname, '../../fixtures');

     describe('detectProjectType', () => {
       it('should detect Next.js project', async () => {
         const analyzer = new CodebaseAnalyzer(path.join(fixturesDir, 'nextjs-project'));
         const result = await analyzer.analyze();

         expect(result.projectType).toBe('nextjs');
         expect(result.framework).toBe('Next.js');
       });

       it('should detect React project', async () => {
         const analyzer = new CodebaseAnalyzer(path.join(fixturesDir, 'react-project'));
         const result = await analyzer.analyze();

         expect(result.projectType).toBe('react');
       });
     });

     describe('analyzeDependencies', () => {
       it('should categorize dependencies correctly', async () => {
         const analyzer = new CodebaseAnalyzer(path.join(fixturesDir, 'nextjs-project'));
         const result = await analyzer.analyze();

         const tailwind = result.dependencies.find(d => d.name === 'tailwindcss');
         expect(tailwind?.category).toBe('styling');
       });
     });
   });
   ```

3. **Create** `tests/unit/utils/model-selector.test.ts`:
   ```typescript
   import { describe, it, expect } from 'vitest';
   import { selectModel, getSkillComplexity } from '../../../src/utils/model-selector.js';

   describe('selectModel', () => {
     it('should use Haiku for hooks', () => {
       const model = selectModel({
         userSelectedModel: 'sonnet',
         generationType: 'hook'
       });

       expect(model).toContain('haiku');
     });

     it('should use Sonnet for agents', () => {
       const model = selectModel({
         userSelectedModel: 'sonnet',
         generationType: 'agent'
       });

       expect(model).toContain('sonnet');
     });

     it('should respect user selection for claude-md', () => {
       const model = selectModel({
         userSelectedModel: 'opus',
         generationType: 'claude-md'
       });

       expect(model).toContain('opus');
     });
   });

   describe('getSkillComplexity', () => {
     it('should identify simple skills', () => {
       expect(getSkillComplexity('markdown')).toBe('simple');
       expect(getSkillComplexity('git')).toBe('simple');
     });

     it('should identify complex skills', () => {
       expect(getSkillComplexity('nextjs')).toBe('complex');
       expect(getSkillComplexity('kubernetes')).toBe('complex');
     });
   });
   ```

4. **Update** `package.json`:
   ```json
   {
     "scripts": {
       "test": "vitest run",
       "test:watch": "vitest",
       "test:coverage": "vitest run --coverage"
     }
   }
   ```

**Files to create:**
- [ ] `tests/fixtures/` - Test fixtures
- [ ] `tests/unit/` - Unit tests
- [ ] `tests/integration/` - Integration tests
- [ ] `vitest.config.ts` - Vitest configuration

**Estimated time:** 6-8 hours

---

### 5.2 Error Recovery

**Goal:** Better error handling with retry logic for API failures.

**Implementation Steps:**

1. **Create** `src/utils/retry.ts`:
   ```typescript
   import pc from 'picocolors';
   import { log } from './logger.js';

   interface RetryOptions {
     maxAttempts?: number;
     delayMs?: number;
     backoffMultiplier?: number;
     onRetry?: (attempt: number, error: Error) => void;
   }

   export async function withRetry<T>(
     fn: () => Promise<T>,
     options: RetryOptions = {}
   ): Promise<T> {
     const {
       maxAttempts = 3,
       delayMs = 1000,
       backoffMultiplier = 2,
       onRetry
     } = options;

     let lastError: Error;
     let currentDelay = delayMs;

     for (let attempt = 1; attempt <= maxAttempts; attempt++) {
       try {
         return await fn();
       } catch (error) {
         lastError = error as Error;

         if (attempt < maxAttempts) {
           onRetry?.(attempt, lastError);
           log.verbose(`Retry ${attempt}/${maxAttempts} after ${currentDelay}ms...`);

           await new Promise(resolve => setTimeout(resolve, currentDelay));
           currentDelay *= backoffMultiplier;
         }
       }
     }

     throw lastError!;
   }

   // Specific retry for API calls
   export async function withAPIRetry<T>(fn: () => Promise<T>): Promise<T> {
     return withRetry(fn, {
       maxAttempts: 3,
       delayMs: 2000,
       backoffMultiplier: 2,
       onRetry: (attempt, error) => {
         log.warn(`API call failed (attempt ${attempt}): ${error.message}`);
       }
     });
   }
   ```

2. **Update generator to use retry:**
   ```typescript
   import { withAPIRetry } from '../utils/retry.js';

   async callAPI(prompt: string, model: string): Promise<string> {
     return withAPIRetry(async () => {
       const response = await this.anthropic.messages.create({
         model,
         max_tokens: 4000,
         messages: [{ role: 'user', content: prompt }]
       });

       if (response.content[0].type !== 'text') {
         throw new Error('Unexpected response type');
       }

       return response.content[0].text;
     });
   }
   ```

**Files to modify:**
- [ ] `src/utils/retry.ts` - Create new file
- [ ] `src/generator/index.ts` - Use retry wrapper

**Estimated time:** 2-3 hours

---

### 5.3 Offline Mode

**Goal:** Work offline using cached/template-based generation.

**Implementation Steps:**

1. **Add offline detection:**
   ```typescript
   import dns from 'dns';

   export async function isOnline(): Promise<boolean> {
     return new Promise((resolve) => {
       dns.lookup('api.anthropic.com', (err) => {
         resolve(!err);
       });
     });
   }
   ```

2. **Update main flow:**
   ```typescript
   const online = await isOnline();

   if (!online) {
     log.warn('No internet connection detected. Running in offline mode.');
     log.info('Will use cached results and local templates only.');

     // Skip API-dependent steps
     // Use only cached analysis and templates
   }
   ```

**Files to modify:**
- [ ] `src/utils/network.ts` - Create new file
- [ ] `src/index.ts` - Add offline mode logic
- [ ] `src/generator/index.ts` - Handle offline mode

**Estimated time:** 2-3 hours

---

## Phase 6: Advanced Features

### 6.1 VS Code Extension

**Goal:** GUI for SuperAgents directly in VS Code.

**Structure:**
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
    └── icons/
```

This is a separate project - see detailed plan in Phase 6.

**Estimated time:** 20-30 hours (separate project)

---

### 6.2 Plugin System

**Goal:** Allow custom analyzers and generators via plugins.

**Plugin Interface:**
```typescript
interface SuperAgentsPlugin {
  name: string;
  version: string;

  // Optional hooks
  onAnalyze?: (codebase: CodebaseAnalysis) => Promise<CodebaseAnalysis>;
  onRecommend?: (recommendations: Recommendations) => Promise<Recommendations>;
  onGenerate?: (context: GenerationContext) => Promise<GeneratedOutputs>;

  // Custom analyzers
  analyzers?: Analyzer[];

  // Custom generators
  generators?: Generator[];
}
```

**Estimated time:** 15-20 hours

---

## Testing Strategy

### Test Pyramid

```
           /\
          /  \
         / E2E \        (10%)
        /______\
       /        \
      / Integration \   (30%)
     /______________\
    /                \
   /     Unit Tests   \ (60%)
  /____________________\
```

### Test Categories

1. **Unit Tests** (60%)
   - Model selector logic
   - Cache key generation
   - Template compilation
   - Prompt compression
   - Logger functions

2. **Integration Tests** (30%)
   - Codebase analyzer with real fixtures
   - Generator with mocked API
   - Cache persistence
   - CLI flag parsing

3. **E2E Tests** (10%)
   - Full workflow with test project
   - Export/import cycle
   - Update mode

### Coverage Targets

| Module | Target |
|--------|--------|
| utils/ | 90% |
| cache/ | 85% |
| analyzer/ | 80% |
| generator/ | 75% |
| cli/ | 70% |

---

## Rollout Plan

### Version 1.1 (Phase 1)
- [ ] Parallel generation
- [ ] Tiered model selection
- [ ] --dry-run flag
- [ ] --verbose flag

### Version 1.2 (Phase 2)
- [ ] Codebase cache
- [ ] Response cache
- [ ] Streaming responses

### Version 1.3 (Phase 3 + 4)
- [ ] Prompt compression
- [ ] Local templates
- [ ] --update mode
- [ ] Monorepo support

### Version 1.4 (Phase 5)
- [ ] Custom templates
- [ ] Export/import
- [ ] Test coverage
- [ ] Error recovery

### Version 2.0 (Phase 6)
- [ ] VS Code extension
- [ ] Plugin system
- [ ] Web interface

---

## Checklist Summary

### Phase 1: Quick Wins
- [ ] 1.1 Install p-limit, create concurrency.ts
- [ ] 1.1 Update generator for parallel generation
- [ ] 1.2 Create model-selector.ts
- [ ] 1.2 Update generator to use tiered models
- [ ] 1.3 Create dry-run.ts
- [ ] 1.3 Add --dry-run flag to CLI
- [ ] 1.4 Create logger.ts
- [ ] 1.4 Add --verbose flag to CLI

### Phase 2: Performance
- [ ] 2.1 Create cache/index.ts
- [ ] 2.1 Implement codebase caching
- [ ] 2.2 Add response caching
- [ ] 2.3 Add streaming support

### Phase 3: Cost Reduction
- [ ] 3.1 Create prompts/templates.ts
- [ ] 3.1 Implement prompt compression
- [ ] 3.2 Create templates directory
- [ ] 3.2 Implement template loader

### Phase 4: New Features
- [ ] 4.1 Create updater/index.ts
- [ ] 4.1 Implement --update mode
- [ ] 4.2 Add monorepo detection
- [ ] 4.3 Implement custom templates
- [ ] 4.4 Implement export/import

### Phase 5: Technical
- [ ] 5.1 Create test fixtures
- [ ] 5.1 Write unit tests
- [ ] 5.1 Write integration tests
- [ ] 5.2 Create retry.ts
- [ ] 5.3 Implement offline mode

### Phase 6: Advanced
- [ ] 6.1 VS Code extension (separate project)
- [ ] 6.2 Plugin system

---

_Document Version: 1.0_
_Created: 2026-01-27_
_Total Estimated Time: 80-100 hours_
