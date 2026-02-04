/**
 * Verbose logging utility for SuperAgents
 * Provides structured logging with operation context
 */

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
  },

  table: (data: Record<string, string | number>) => {
    if (verboseMode) {
      const maxKeyLen = Math.max(...Object.keys(data).map(k => k.length));
      for (const [key, value] of Object.entries(data)) {
        console.log(pc.dim(`  ${key.padEnd(maxKeyLen)}: ${value}`));
      }
    }
  }
};

/**
 * Operation logger interface
 */
export interface OperationLogger {
  debug: (message: string) => void;
  verbose: (message: string) => void;
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

/**
 * Create a logger with operation context prefix
 * Useful for tracking logs from specific operations (e.g., cache, generator)
 */
export function createOperationLogger(operationId: string): OperationLogger {
  const prefix = `[${operationId}]`;

  return {
    debug: (message: string) => log.debug(`${prefix} ${message}`),
    verbose: (message: string) => log.verbose(`${prefix} ${message}`),
    info: (message: string) => log.info(`${prefix} ${message}`),
    warn: (message: string) => log.warn(`${prefix} ${message}`),
    error: (message: string) => log.error(`${prefix} ${message}`)
  };
}
