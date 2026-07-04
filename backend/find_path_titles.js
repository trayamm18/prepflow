const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const allP = await prisma.problem.findMany({
      select: { title: true }
    });
    console.log("Problems containing 'path':");
    allP.filter(p => p.title.toLowerCase().includes('path')).forEach(p => console.log(` - "${p.title}"`));

    console.log("\nProblems containing 'shortest':");
    allP.filter(p => p.title.toLowerCase().includes('shortest')).forEach(p => console.log(` - "${p.title}"`));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
