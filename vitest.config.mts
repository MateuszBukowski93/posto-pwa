import path from 'node:path';
import { defineConfig } from 'vitest/config';

// Testy dat liczone są w polskiej strefie, żeby sprawdzić zmianę czasu (DST).
process.env.TZ = 'Europe/Warsaw';

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\//, replacement: `${path.resolve(import.meta.dirname)}/` }],
  },
  test: {
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
});
