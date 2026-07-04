const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const allP = await prisma.problem.findMany({
      select: { title: true }
    });
    console.log("Problems containing 'Dijkstra':");
    allP.filter(p => p.title.toLowerCase().includes('dijkstra')).forEach(p => console.log(` - "${p.title}"`));

    console.log("\nProblems containing 'occurrences':");
    allP.filter(p => p.title.toLowerCase().includes('occurrences')).forEach(p => console.log(` - "${p.title}"`));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}
run();
