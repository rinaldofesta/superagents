/**
 * Concurrency utilities for parallel API calls
 */

import pLimit from 'p-limit';

// Limit concurrent API calls to avoid rate limiting
const API_CONCURRENCY = 3;

/**
 * Create a new rate limiter (internal helper)
 */
const createLimiter = () => pLimit(API_CONCURRENCY);

/**
 * Progress callback type
 */
export type ProgressCallback = (completed: number, total: number, item: string) => void;

/**
 * Execute tasks in parallel with concurrency limit and progress tracking
 */
export async function parallelGenerate<T>(
  items: string[],
  generator: (item: string) => Promise<T>,
  onProgress?: ProgressCallback
): Promise<T[]> {
  if (items.length === 0) return [];

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

/**
 * Execute tasks in parallel, collecting results and errors separately
 */
export async function parallelGenerateWithErrors<T>(
  items: string[],
  generator: (item: string) => Promise<T>,
  onSuccess?: (item: string, result: T) => void,
  onError?: (item: string, error: Error) => void
): Promise<{ results: T[]; errors: Array<{ item: string; error: Error }> }> {
  if (items.length === 0) return { results: [], errors: [] };

  const limit = createLimiter();
  const results: T[] = [];
  const errors: Array<{ item: string; error: Error }> = [];

  const promises = items.map(item =>
    limit(async () => {
      try {
        const result = await generator(item);
        results.push(result);
        onSuccess?.(item, result);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        errors.push({ item, error: err });
        onError?.(item, err);
      }
    })
  );

  await Promise.all(promises);
  return { results, errors };
}
