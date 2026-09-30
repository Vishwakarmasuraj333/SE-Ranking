import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 15000,
  },
  server: {
    fs: {
      allow: ['../..'],
    },
  },
  resolve: {
    alias: [
      {
        find: /^@\/components\/navigation\/ProjectSidebar$/,
        replacement: path.resolve(__dirname, './src/components/navigation/ProjectSidebar.tsx'),
      },
      {
        find: /^@\/components\/ai-tracker\/(.*)$/,
        replacement: path.resolve(__dirname, './src/components/ai-tracker/$1'),
      },
      {
        find: /^@\/components\/backlink-checker\/(.*)$/,
        replacement: path.resolve(__dirname, './src/components/backlink-checker/$1'),
      },
      {
        find: /^@\/components\/marketing-plan\/(.*)$/,
        replacement: path.resolve(__dirname, './src/components/marketing-plan/$1'),
      },
      {
        find: /^@\/components\/audit\/(.*)$/,
        replacement: path.resolve(__dirname, './src/components/audit/$1'),
      },
      {
        find: /^@\/components\/insights\/(.*)$/,
        replacement: path.resolve(__dirname, './src/components/insights/$1'),
      },
      {
        find: /^@\/data\/(.*)$/,
        replacement: path.resolve(__dirname, './src/data/$1'),
      },
      {
        find: /^@\/(.*)$/,
        replacement: path.resolve(__dirname, '../../src/$1'),
      },
      {
        find: '@internal-seo/ui',
        replacement: path.resolve(__dirname, '../../src/components/ui/internal-ui.tsx'),
      },
    ],
  },
});
