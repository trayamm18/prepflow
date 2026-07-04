const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findReverse() {
  try {
    const list = await prisma.problem.findMany({
      where: { title: { contains: 'reverse', mode: 'insensitive' } }
    });
    list.forEach(p => console.log(`Title: "${p.title}" | Slug: "${p.slug}"`));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

findReverse();
