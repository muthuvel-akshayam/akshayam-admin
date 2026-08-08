const { PrismaClient } = require('./generated/prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.profile.findMany({ select: { name: true, jathakamUrl: true } });
  console.log(profiles);
}

main().catch(console.error).finally(() => prisma.$disconnect());
