import { prisma } from './lib/admin/db';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const profiles = await prisma.profile.findMany({ select: { name: true, jathakamUrl: true } });
  console.log(profiles);
}

main().catch(console.error).finally(() => prisma.$disconnect());
