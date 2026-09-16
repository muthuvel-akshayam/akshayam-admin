import { config } from 'dotenv';
config();

async function run() {
  const { prisma } = await import('./lib/admin/db.js');
  try {
    const total = await prisma.profile.count();
    console.log("Total profiles:", total);
  } catch (err) {
    console.error("Error querying profiles:", err);
  }
}
run();
