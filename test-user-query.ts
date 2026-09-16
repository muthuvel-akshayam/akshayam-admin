import { config } from 'dotenv';
config();
async function run() {
  const { prisma } = await import('./lib/admin/db.js');
  try {
    const user = await prisma.user.findFirst({
      include: {
        profile: {
          include: {
            educations: true,
          },
        },
        family: {
          include: {
            siblings: true,
          }
        },
        expectations: true,
      },
    });
    console.log("User fetched successfully", user?.id);
  } catch (err) {
    console.error("Error fetching user:", err);
  }
}
run();
