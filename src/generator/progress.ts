/**
 * Progress tracking for generation operations
 * Extracted for better separation of concerns and testability
 */

import ora, { type Ora } from 'ora';
import { log } from '../utils/logger.js';

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
export function createProgressTracker(options: ProgressTrackerOptions): ProgressTracker {
  const { totalItems } = options;
  let completed = 0;

  const spinner: Ora = ora({
    text: 'Generating... 0%',
    spinner: 'dots'
  }).start();

  const getPercent = () => Math.round((completed / totalItems) * 100);

  return {
    update(type: string, name: string, status: ProgressStatus, error?: string): void {
      if (status === 'start') {
        spinner.text = `[${getPercent()}%] Generating ${type}: ${name}...`;
      } else if (status === 'success') {
        completed++;
        spinner.text = `[${getPercent()}%] ✓ ${type}: ${name}`;
        log.verbose(`Generated ${type}: ${name}`);
      } else {
        completed++;
        spinner.warn(`[${getPercent()}%] ⚠ ${type}: ${name} - ${error}`);
        spinner.start();
        log.verbose(`Failed ${type}: ${name} - ${error}`);
      }
    },

    complete(): void {
      spinner.succeed(`Generation complete! [100%]`);
    },

    getPercent,

    getCompletedCount(): number {
      return completed;
    }
  };
}

/**
 * Create a no-op progress tracker for testing or silent mode
 */
export function createSilentProgressTracker(): ProgressTracker {
  let completed = 0;

  return {
    update(_type: string, _name: string, status: ProgressStatus): void {
      if (status !== 'start') {
        completed++;
      }
    },

    complete(): void {
      // No-op
    },

    getPercent(): number {
      return 100;
    },

    getCompletedCount(): number {
      return completed;
    }
  };
}
