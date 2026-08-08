// ==========================================
// PRISMA CLIENT SINGLETON FOR ADMIN MODULE
// ==========================================
// 
// This file exports the Prisma client instance used by the Admin module.
// Uses Prisma 7 adapter-pg to connect cleanly with Supabase poolers.

import { PrismaClient } from '../../generated/prisma/client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || '';

const prismaClientSingleton = () => {
  if (!connectionString) {
    console.warn("DATABASE_URL is not set");
  }
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobalAdmin: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobalAdmin ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobalAdmin = prisma;
