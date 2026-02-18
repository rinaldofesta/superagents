import { vi } from 'vitest';

/**
 * Creates a mock for fs-extra with common file operations.
 */
export function createFsMocks() {
  return {
    readFile: vi.fn().mockResolvedValue('default-content'),
    writeFile: vi.fn().mockResolvedValue(undefined),
    readJson: vi.fn().mockResolvedValue({}),
    writeJson: vi.fn().mockResolvedValue(undefined),
    ensureDir: vi.fn().mockResolvedValue(undefined),
    pathExists: vi.fn().mockResolvedValue(true),
    remove: vi.fn().mockResolvedValue(undefined),
    copy: vi.fn().mockResolvedValue(undefined),
    move: vi.fn().mockResolvedValue(undefined),
    readdir: vi.fn().mockResolvedValue([]),
    stat: vi.fn().mockResolvedValue({
      isDirectory: () => false,
      isFile: () => true,
      size: 0,
      mtime: new Date(),
    }),
    access: vi.fn().mockResolvedValue(undefined),
    outputFile: vi.fn().mockResolvedValue(undefined),
    emptyDir: vi.fn().mockResolvedValue(undefined),
  };
}

/**
 * Creates a mock for fs-extra module suitable for vi.mock() usage.
 */
export function createFsModuleMock() {
  return {
    default: createFsMocks(),
    ...createFsMocks(),
  };
}

/**
 * Mock configuration for file system errors.
 */
export function mockFsError(type: 'ENOENT' | 'EACCES' | 'EEXIST' | 'EISDIR', path: string) {
  const error = new Error(`${type}: ${path}`) as NodeJS.ErrnoException;
  error.code = type;
  error.path = path;
  return error;
}

/**
 * Creates a mock that simulates directory listing with specific files.
 */
export function mockDirectoryListing(files: string[]) {
  return vi.fn().mockResolvedValue(files);
}

/**
 * Creates a mock that simulates file content reading.
 */
export function mockFileContent(content: string | Record<string, unknown>) {
  if (typeof content === 'string') {
    return vi.fn().mockResolvedValue(content);
  }
  return vi.fn().mockResolvedValue(content);
}
