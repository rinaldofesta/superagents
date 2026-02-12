import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'html', 'json'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/index.ts',
        'src/templates/**',
        'src/types/**',
        'src/**/index.ts',
        'src/cli/banner.ts',
        'src/cli/colors.ts',
        'src/cli/display-names.ts',
        'src/cli/exit-codes.ts',
        'src/prompts/**',
        '**/*.d.ts',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 55,
        statements: 60,
      },
      perFile: true,
      all: true,
      clean: true,
      reportsDirectory: './coverage',
    },
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    testTimeout: 10000,
    isolate: false,
  },
});
