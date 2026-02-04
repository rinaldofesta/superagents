/**
 * Progress tracking for generation operations
 * Extracted for better separation of concerns and testability
 */
export type ProgressStatus = 'start' | 'success' | 'error';
export interface ProgressTracker {
    /**
     * Update progress for a specific item
     */
    update(type: string, name: string, status: ProgressStatus, error?: string): void;
    /**
     * Mark generation as complete
     */
    complete(): void;
    /**
     * Get current completion percentage
     */
    getPercent(): number;
    /**
     * Get count of completed items
     */
    getCompletedCount(): number;
}
export interface ProgressTrackerOptions {
    /** Total number of items to generate */
    totalItems: number;
    /** Spinner text format */
    spinnerType?: string;
}
/**
 * Create a progress tracker for generation operations
 */
export declare function createProgressTracker(options: ProgressTrackerOptions): ProgressTracker;
/**
 * Create a no-op progress tracker for testing or silent mode
 */
export declare function createSilentProgressTracker(): ProgressTracker;
//# sourceMappingURL=progress.d.ts.map