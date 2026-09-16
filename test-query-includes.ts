import { config } from 'dotenv';
config();

async function run() {
  const { prisma } = await import('./lib/admin/db.js');
  try {
    const rawProfiles = await prisma.profile.findMany({
      skip: 0,
      take: 10,
      orderBy: { id: 'desc' },
      include: {
        user: { include: { family: { include: { siblings: true } } } },
        educations: true,
      },
    });
    console.log("Profiles returned:", rawProfiles.length);
  } catch (err) {
    console.error("Error querying profiles:", err);
  }
}
run();
