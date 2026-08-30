const { PrismaClient } = require('./generated/prisma/client/client');
const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.profile.findMany({ take: 5 });
  console.log(profiles.map(p => ({ id: p.id, displayId: p.displayId })));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
