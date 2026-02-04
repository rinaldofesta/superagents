/**
 * Verbose logging utility for SuperAgents
 * Provides structured logging with operation context
 */
import pc from 'picocolors';
let verboseMode = false;
export function setVerbose(enabled) {
    verboseMode = enabled;
}
export function isVerbose() {
    return verboseMode;
}
export const log = {
    info: (message) => {
        console.log(pc.blue('ℹ') + ' ' + message);
    },
    success: (message) => {
        console.log(pc.green('✓') + ' ' + message);
    },
    warn: (message) => {
        console.log(pc.yellow('⚠') + ' ' + message);
    },
    error: (message) => {
        console.log(pc.red('✗') + ' ' + message);
    },
    debug: (message) => {
        if (verboseMode) {
            console.log(pc.dim('[DEBUG] ' + message));
        }
    },
    verbose: (message) => {
        if (verboseMode) {
            console.log(pc.dim('  → ' + message));
        }
    },
    section: (title) => {
        if (verboseMode) {
            console.log('\n' + pc.bold(pc.cyan(title)));
        }
    },
    table: (data) => {
        if (verboseMode) {
            const maxKeyLen = Math.max(...Object.keys(data).map(k => k.length));
            for (const [key, value] of Object.entries(data)) {
                console.log(pc.dim(`  ${key.padEnd(maxKeyLen)}: ${value}`));
            }
        }
    }
};
/**
 * Create a logger with operation context prefix
 * Useful for tracking logs from specific operations (e.g., cache, generator)
 */
export function createOperationLogger(operationId) {
    const prefix = `[${operationId}]`;
    return {
        debug: (message) => log.debug(`${prefix} ${message}`),
        verbose: (message) => log.verbose(`${prefix} ${message}`),
        info: (message) => log.info(`${prefix} ${message}`),
        warn: (message) => log.warn(`${prefix} ${message}`),
        error: (message) => log.error(`${prefix} ${message}`)
    };
}
//# sourceMappingURL=logger.js.map