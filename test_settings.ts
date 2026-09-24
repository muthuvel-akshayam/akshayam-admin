import { PrismaClient } from './generated/prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const s = await prisma.siteSettings.findUnique({ where: { id: 'default_settings' } });
    console.log("Current Settings:", s);
    const updated = await prisma.siteSettings.upsert({
      where: { id: 'default_settings' },
      update: { latestUserId: 'AK200' },
      create: { id: 'default_settings', minMaleAge: 21, minFemaleAge: 18, maxPhotoSizeMb: 5, maxDocSizeMb: 10, featuredProfilesLimit: 12, maintenanceMode: false, latestUserId: 'AK200' }
    });
    console.log("Upserted:", updated);
  } catch (e) {
    console.error("Prisma Error:", e);
  }
}
main();
