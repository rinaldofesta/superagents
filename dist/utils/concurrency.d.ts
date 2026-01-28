/**
 * Concurrency utilities for parallel API calls
 */
/**
 * Progress callback type
 */
export type ProgressCallback = (completed: number, total: number, item: string) => void;
/**
 * Execute tasks in parallel with concurrency limit and progress tracking
 */
export declare function parallelGenerate<T>(items: string[], generator: (item: string) => Promise<T>, onProgress?: ProgressCallback): Promise<T[]>;
/**
 * Execute tasks in parallel, collecting results and errors separately
 */
export declare function parallelGenerateWithErrors<T>(items: string[], generator: (item: string) => Promise<T>, onSuccess?: (item: string, result: T) => void, onError?: (item: string, error: Error) => void): Promise<{
    results: T[];
    errors: Array<{
        item: string;
        error: Error;
    }>;
}>;
//# sourceMappingURL=concurrency.d.ts.map