import { PrismaClient } from './generated/prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const profiles = await prisma.profile.findMany({ include: { user: true } });
  let count = 0;
  for (const p of profiles) {
    if (p.user && p.userId !== p.displayId) {
      await prisma.profile.update({
        where: { id: p.id },
        data: { displayId: p.userId }
      });
      count++;
    }
  }
  console.log(`Fixed ${count} profiles`);
}
main();
