import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import os from 'os';

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('file:.')) {
    return process.env.DATABASE_URL;
  }

  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

  if (isServerless) {
    const tmpDbPath = path.join(os.tmpdir(), 'dev.db');
    try {
      if (!fs.existsSync(tmpDbPath)) {
        const srcDb = path.join(process.cwd(), 'prisma', 'dev.db');
        if (fs.existsSync(srcDb)) {
          fs.copyFileSync(srcDb, tmpDbPath);
        }
      }
    } catch (err) {
      console.warn('Could not copy SQLite database to /tmp:', err);
    }
    return `file:${tmpDbPath}`;
  }

  // Ensure SQLite always resolves to absolute path with forward slashes on Windows and Unix
  const localPrismaDb = path.resolve(process.cwd(), 'prisma', 'dev.db').replace(/\\/g, '/');
  return `file:${localPrismaDb}`;
}

const resolvedDbUrl = resolveDatabaseUrl();
process.env.DATABASE_URL = resolvedDbUrl;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolvedDbUrl,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
