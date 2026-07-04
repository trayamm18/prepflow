const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const probs = await prisma.problem.findMany({
      select: { title: true, slug: true }
    });
    console.log(`Total database problems: ${probs.length}`);
    const suffixClones = probs.filter(p => {
      const title = p.title.trim();
      return /\s+\d+$/.test(title) && !title.toLowerCase().includes('ii') && !title.toLowerCase().includes('iii') && !title.toLowerCase().includes('iv');
    });
    console.log(`Found ${suffixClones.length} suffix clones in database:`);
    suffixClones.forEach(c => console.log(` - "${c.title}" (slug: "${c.slug}")`));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
