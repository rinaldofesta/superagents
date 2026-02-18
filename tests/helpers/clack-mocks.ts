import { vi } from 'vitest';

/**
 * Creates a mock implementation of @clack/prompts with common functions.
 * Returns an object with mocked functions and reset utilities.
 */
export function createClackMocks() {
  const mocks = {
    intro: vi.fn(),
    outro: vi.fn(),
    text: vi.fn().mockResolvedValue('default-text'),
    select: vi.fn().mockResolvedValue('default-option'),
    multiselect: vi.fn().mockResolvedValue(['default-item']),
    confirm: vi.fn().mockResolvedValue(true),
    group: vi.fn().mockImplementation(async (prompts) => {
      const results: Record<string, unknown> = {};
      for (const [key, prompt] of Object.entries(prompts)) {
        if (typeof prompt === 'function') {
          results[key] = await prompt({ results });
        }
      }
      return results;
    }),
    spinner: vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      message: vi.fn(),
    })),
    isCancel: vi.fn((value) => value === Symbol.for('clack.cancel')),
    cancel: vi.fn(),
  };

  const reset = () => {
    Object.values(mocks).forEach((mock) => {
      if (typeof mock === 'function' && 'mockClear' in mock) {
        mock.mockClear();
      }
    });
  };

  const mockCancel = () => {
    const cancelSymbol = Symbol.for('clack.cancel');
    mocks.isCancel.mockReturnValue(true);
    return cancelSymbol;
  };

  return {
    ...mocks,
    reset,
    mockCancel,
  };
}

/**
 * Creates a minimal mock for @clack/prompts suitable for vi.mock() usage.
 */
export function createClackModuleMock() {
  return {
    intro: vi.fn(),
    outro: vi.fn(),
    text: vi.fn().mockResolvedValue('default-text'),
    select: vi.fn().mockResolvedValue('default-option'),
    multiselect: vi.fn().mockResolvedValue(['default-item']),
    confirm: vi.fn().mockResolvedValue(true),
    group: vi.fn().mockResolvedValue({}),
    spinner: vi.fn(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      message: vi.fn(),
    })),
    isCancel: vi.fn(() => false),
    cancel: vi.fn(),
  };
}
