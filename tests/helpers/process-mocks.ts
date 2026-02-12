import { vi } from 'vitest';
import { EventEmitter } from 'node:events';
import type { ChildProcess } from 'node:child_process';

/**
 * Creates a mock ChildProcess that emits events for testing.
 */
export function createMockChildProcess(options: {
  stdout?: string;
  stderr?: string;
  exitCode?: number;
  signal?: string | null;
  error?: Error;
  delay?: number;
}): Partial<ChildProcess> {
  const {
    stdout = '',
    stderr = '',
    exitCode = 0,
    signal = null,
    error,
    delay = 0,
  } = options;

  const stdoutEmitter = new EventEmitter();
  const stderrEmitter = new EventEmitter();
  const processEmitter = new EventEmitter();

  const mockProcess = Object.assign(processEmitter, {
    stdout: stdoutEmitter,
    stderr: stderrEmitter,
    pid: Math.floor(Math.random() * 10000),
    kill: vi.fn(),
  });

  // Simulate process execution
  setTimeout(() => {
    if (error) {
      processEmitter.emit('error', error);
    } else {
      if (stdout) {
        stdoutEmitter.emit('data', Buffer.from(stdout));
      }
      if (stderr) {
        stderrEmitter.emit('data', Buffer.from(stderr));
      }
      processEmitter.emit('close', exitCode, signal);
    }
  }, delay);

  return mockProcess;
}

/**
 * Creates a mock spawn function for child_process.spawn.
 */
export function createSpawnMock(defaultOptions?: Parameters<typeof createMockChildProcess>[0]) {
  const spawnMock = vi.fn((command: string, args?: readonly string[]) => {
    return createMockChildProcess(defaultOptions || {});
  });

  return spawnMock;
}

/**
 * Creates a mock exec function for child_process.exec.
 */
export function createExecMock(defaultOptions: {
  stdout?: string;
  stderr?: string;
  error?: Error | null;
  delay?: number;
} = {}) {
  const execMock = vi.fn((command: string, callback?: (error: Error | null, stdout: string, stderr: string) => void) => {
    const {
      stdout = '',
      stderr = '',
      error = null,
      delay = 0,
    } = defaultOptions;

    if (callback) {
      setTimeout(() => {
        callback(error, stdout, stderr);
      }, delay);
    }

    return createMockChildProcess({ stdout, stderr, exitCode: error ? 1 : 0 }) as ChildProcess;
  });

  return execMock;
}

/**
 * Creates a mock execAsync function (promisified exec).
 */
export function createExecAsyncMock(defaultOptions: {
  stdout?: string;
  stderr?: string;
  error?: Error | null;
  delay?: number;
} = {}) {
  const execAsyncMock = vi.fn(async (command: string) => {
    const {
      stdout = '',
      stderr = '',
      error = null,
      delay = 0,
    } = defaultOptions;

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    if (error) {
      throw error;
    }

    return { stdout, stderr };
  });

  return execAsyncMock;
}

/**
 * Creates a mock that simulates a timeout scenario.
 */
export function createTimeoutMock(timeoutMs: number) {
  return createExecAsyncMock({
    error: new Error(`Command timed out after ${timeoutMs}ms`),
    delay: timeoutMs + 100,
  });
}
