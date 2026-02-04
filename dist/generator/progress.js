/**
 * Progress tracking for generation operations
 * Extracted for better separation of concerns and testability
 */
import ora from 'ora';
import { log } from '../utils/logger.js';
/**
 * Create a progress tracker for generation operations
 */
export function createProgressTracker(options) {
    const { totalItems } = options;
    let completed = 0;
    const spinner = ora({
        text: 'Generating... 0%',
        spinner: 'dots'
    }).start();
    const getPercent = () => Math.round((completed / totalItems) * 100);
    return {
        update(type, name, status, error) {
            if (status === 'start') {
                spinner.text = `[${getPercent()}%] Generating ${type}: ${name}...`;
            }
            else if (status === 'success') {
                completed++;
                spinner.text = `[${getPercent()}%] ✓ ${type}: ${name}`;
                log.verbose(`Generated ${type}: ${name}`);
            }
            else {
                completed++;
                spinner.warn(`[${getPercent()}%] ⚠ ${type}: ${name} - ${error}`);
                spinner.start();
                log.verbose(`Failed ${type}: ${name} - ${error}`);
            }
        },
        complete() {
            spinner.succeed(`Generation complete! [100%]`);
        },
        getPercent,
        getCompletedCount() {
            return completed;
        }
    };
}
/**
 * Create a no-op progress tracker for testing or silent mode
 */
export function createSilentProgressTracker() {
    let completed = 0;
    return {
        update(_type, _name, status) {
            if (status !== 'start') {
                completed++;
            }
        },
        complete() {
            // No-op
        },
        getPercent() {
            return 100;
        },
        getCompletedCount() {
            return completed;
        }
    };
}
//# sourceMappingURL=progress.js.map