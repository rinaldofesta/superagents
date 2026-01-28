/**
 * Verbose logging utility for SuperAgents
 */

import pc from 'picocolors';

let verboseMode = false;

export function setVerbose(enabled: boolean): void {
  verboseMode = enabled;
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
