# Patterns & Conventions

## Detected Patterns
### models
Data models or entities
Confidence: 90%
Files:
  - `src/schemas/index.ts`

### utils
Utility and helper modules
Confidence: 70%
Files:
  - `src/utils/version-check.ts`
  - `src/utils/model-selector.ts`
  - `src/utils/logger.ts`
  - `src/utils/concurrency.ts`
  - `src/utils/claude-cli.ts`

### tests
Test files
Confidence: 100%
Files:
  - `tests/unit/cache/cache.test.ts`

## Negative Constraints
- Use Vitest, NOT Jest
- Use Zod, NOT Joi
- Use Zod, NOT Yup
