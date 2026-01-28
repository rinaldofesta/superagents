/**
 * Verbose logging utility for SuperAgents
 */
import pc from 'picocolors';
let verboseMode = false;
export function setVerbose(enabled) {
    verboseMode = enabled;
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
//# sourceMappingURL=logger.js.map