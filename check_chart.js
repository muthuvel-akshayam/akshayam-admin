const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
async function main() { 
  const profiles = await prisma.profile.findMany({ select: { jathagamData: true, rasiGrid: true } }); 
  for (let p of profiles) { 
    if (p.jathagamData?.rasiChart) console.log('rasiChart:', JSON.stringify(p.jathagamData.rasiChart)); 
    if (p.jathagamData?.rasiGrid) console.log('rasiGrid:', JSON.stringify(p.jathagamData.rasiGrid)); 
    if (p.rasiGrid) console.log('root rasiGrid:', JSON.stringify(p.rasiGrid)); 
  } 
} 
main().catch(console.error).finally(() => prisma.$disconnect());
