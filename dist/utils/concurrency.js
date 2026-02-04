/**
 * Concurrency utilities for parallel API calls
 */
import pLimit from 'p-limit';
// Limit concurrent API calls to avoid rate limiting
// Configurable via environment variable for different environments
const DEFAULT_CONCURRENCY = 3;
const API_CONCURRENCY = parseInt(process.env.SUPERAGENTS_CONCURRENCY || String(DEFAULT_CONCURRENCY), 10) || DEFAULT_CONCURRENCY;
/**
 * Create a new rate limiter (internal helper)
 */
const createLimiter = () => pLimit(API_CONCURRENCY);
/**
 * Execute tasks in parallel with concurrency limit and progress tracking
 */
export async function parallelGenerate(items, generator, onProgress) {
    if (items.length === 0)
        return [];
    const limit = createLimiter();
    let completed = 0;
    const promises = items.map(item => limit(async () => {
        const result = await generator(item);
        completed++;
        onProgress?.(completed, items.length, item);
        return result;
    }));
    return Promise.all(promises);
}
/**
 * Execute tasks in parallel, collecting results and errors separately
 */
export async function parallelGenerateWithErrors(items, generator, onSuccess, onError) {
    if (items.length === 0)
        return { results: [], errors: [] };
    const limit = createLimiter();
    const results = [];
    const errors = [];
    const promises = items.map(item => limit(async () => {
        try {
            const result = await generator(item);
            results.push(result);
            onSuccess?.(item, result);
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            errors.push({ item, error: err });
            onError?.(item, err);
        }
    }));
    await Promise.all(promises);
    return { results, errors };
}
//# sourceMappingURL=concurrency.js.map