const { PrismaClient } = require('./generated/prisma/client/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');

async function main() {
  const connectionString = 'postgresql://postgres.wtpbmpxwiasbnngciwye:Akshayam%40777@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true';
  const pool = new pg.Pool({ connectionString, max: 1 });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const res = await prisma.user.findMany({
      where: {
        profile: {
          is: {
            status: 'PENDING'
          }
        }
      }
    });
    console.log("Success, found:", res.length);
  } catch (e) {
    console.error("Prisma Error:", e.message);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
