import { describe, it, expect, vi } from 'vitest';
import { parallelGenerate, parallelGenerateWithErrors, withRetry } from '../../../src/utils/concurrency.js';

describe('parallelGenerate', () => {
  it('should return empty array for empty input', async () => {
    const generator = vi.fn();
    const result = await parallelGenerate([], generator);

    expect(result).toEqual([]);
    expect(generator).not.toHaveBeenCalled();
  });

  it('should generate all items and return all results', async () => {
    const items = ['agent1', 'agent2', 'agent3'];
    const generator = vi.fn((item: string) => Promise.resolve(`generated-${item}`));

    const results = await parallelGenerate(items, generator);

    expect(results).toHaveLength(3);
    expect(results).toContain('generated-agent1');
    expect(results).toContain('generated-agent2');
    expect(results).toContain('generated-agent3');
    expect(generator).toHaveBeenCalledTimes(3);
  });

  it('should call onProgress callback with correct values', async () => {
    const items = ['agent1', 'agent2', 'agent3'];
    const generator = vi.fn((item: string) => Promise.resolve(`generated-${item}`));
    const onProgress = vi.fn();

    await parallelGenerate(items, generator, onProgress);

    expect(onProgress).toHaveBeenCalledTimes(3);
    // Should be called with (completed, total, item) for each completion
    const calls = onProgress.mock.calls;
    expect(calls.every(call => call[1] === 3)).toBe(true); // total always 3

    // Verify all items were reported
    const reportedItems = calls.map(call => call[2]);
    expect(reportedItems).toContain('agent1');
    expect(reportedItems).toContain('agent2');
    expect(reportedItems).toContain('agent3');
  });

  it('should process all items even with parallel execution', async () => {
    const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
    const generator = vi.fn((item: string) =>
      new Promise<string>(resolve => {
        setTimeout(() => resolve(`result-${item}`), Math.random() * 20);
      })
    );

    const results = await parallelGenerate(items, generator);

    expect(results).toHaveLength(10);
    expect(generator).toHaveBeenCalledTimes(10);
    // All items should have results (order doesn't matter)
    items.forEach(item => {
      expect(results).toContain(`result-${item}`);
    });
  });
});

describe('parallelGenerateWithErrors', () => {
  it('should return all results when all items succeed', async () => {
    const items = ['agent1', 'agent2', 'agent3'];
    const generator = vi.fn((item: string) => Promise.resolve(`success-${item}`));

    const { results, errors } = await parallelGenerateWithErrors(items, generator);

    expect(results).toHaveLength(3);
    expect(errors).toHaveLength(0);
    expect(results).toContain('success-agent1');
    expect(results).toContain('success-agent2');
    expect(results).toContain('success-agent3');
  });

  it('should return all errors when all items fail', async () => {
    const items = ['agent1', 'agent2', 'agent3'];
    const generator = vi.fn((item: string) =>
      Promise.reject(new Error(`Failed to generate ${item}`))
    );

    const { results, errors } = await parallelGenerateWithErrors(items, generator);

    expect(results).toHaveLength(0);
    expect(errors).toHaveLength(3);
    expect(errors[0].error).toBeInstanceOf(Error);
    expect(errors.map(e => e.item)).toContain('agent1');
    expect(errors.map(e => e.item)).toContain('agent2');
    expect(errors.map(e => e.item)).toContain('agent3');
  });

  it('should split results and errors correctly for mixed success/failure', async () => {
    const items = ['success1', 'fail1', 'success2', 'fail2'];
    const generator = vi.fn((item: string) => {
      if (item.startsWith('fail')) {
        return Promise.reject(new Error(`Failed: ${item}`));
      }
      return Promise.resolve(`result-${item}`);
    });

    const { results, errors } = await parallelGenerateWithErrors(items, generator);

    expect(results).toHaveLength(2);
    expect(errors).toHaveLength(2);
    expect(results).toContain('result-success1');
    expect(results).toContain('result-success2');
    expect(errors.map(e => e.item)).toContain('fail1');
    expect(errors.map(e => e.item)).toContain('fail2');
  });

  it('should call onSuccess callback for successful items', async () => {
    const items = ['agent1', 'agent2'];
    const generator = vi.fn((item: string) => Promise.resolve(`result-${item}`));
    const onSuccess = vi.fn();

    await parallelGenerateWithErrors(items, generator, onSuccess);

    expect(onSuccess).toHaveBeenCalledTimes(2);
    expect(onSuccess).toHaveBeenCalledWith('agent1', 'result-agent1');
    expect(onSuccess).toHaveBeenCalledWith('agent2', 'result-agent2');
  });

  it('should call onError callback for failed items', async () => {
    const items = ['agent1', 'agent2'];
    const generator = vi.fn((item: string) =>
      Promise.reject(new Error(`Error for ${item}`))
    );
    const onError = vi.fn();

    await parallelGenerateWithErrors(items, generator, undefined, onError);

    expect(onError).toHaveBeenCalledTimes(2);
    const calls = onError.mock.calls;
    expect(calls.some(([item, error]) => item === 'agent1' && error.message === 'Error for agent1')).toBe(true);
    expect(calls.some(([item, error]) => item === 'agent2' && error.message === 'Error for agent2')).toBe(true);
  });
});

describe('withRetry', () => {
  it('should return result on first try when successful', async () => {
    const fn = vi.fn(() => Promise.resolve('success'));

    const result = await withRetry(fn);

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry and succeed after one failure', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(Object.assign(new Error('Rate limited'), { status: 429 }))
      .mockResolvedValueOnce('success');

    const result = await withRetry(fn, { baseDelayMs: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should retry on retryable error (429 status)', async () => {
    const error429 = Object.assign(new Error('Rate limited'), { status: 429 });
    const fn = vi.fn()
      .mockRejectedValueOnce(error429)
      .mockRejectedValueOnce(error429)
      .mockResolvedValueOnce('success');

    const result = await withRetry(fn, { baseDelayMs: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should throw immediately on non-retryable error (400 status)', async () => {
    const error400 = Object.assign(new Error('Bad request'), { status: 400 });
    const fn = vi.fn().mockRejectedValue(error400);

    await expect(withRetry(fn, { baseDelayMs: 10 })).rejects.toThrow('Bad request');
    expect(fn).toHaveBeenCalledTimes(1); // No retry
  });

  it('should throw after exceeding max retries', async () => {
    const error429 = Object.assign(new Error('Rate limited'), { status: 429 });
    const fn = vi.fn().mockRejectedValue(error429);

    await expect(withRetry(fn, { maxRetries: 2, baseDelayMs: 10 })).rejects.toThrow('Rate limited');
    expect(fn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  it('should retry on network errors (ECONNRESET)', async () => {
    const errorNetwork = new Error('ECONNRESET');
    const fn = vi.fn()
      .mockRejectedValueOnce(errorNetwork)
      .mockResolvedValueOnce('success');

    const result = await withRetry(fn, { baseDelayMs: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should respect maxRetries option', async () => {
    const error429 = Object.assign(new Error('Rate limited'), { status: 429 });
    const fn = vi.fn().mockRejectedValue(error429);

    await expect(withRetry(fn, { maxRetries: 1, baseDelayMs: 10 })).rejects.toThrow('Rate limited');
    expect(fn).toHaveBeenCalledTimes(2); // Initial + 1 retry
  });
});
