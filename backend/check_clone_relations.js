const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCloneRelations() {
  try {
    console.log('Fetching all problems and scan for suffix clones...');
    const problems = await prisma.problem.findMany();
    const clones = problems.filter(p => {
      const title = p.title.trim();
      if (/\s+\d+$/.test(title) && !title.toLowerCase().includes('ii') && !title.toLowerCase().includes('iii') && !title.toLowerCase().includes('iv')) {
        return true;
      }
      return false;
    });

    console.log(`Found ${clones.length} duplicate suffix clones.`);
    const cloneIds = clones.map(c => c.id);

    // Check relations
    const submissionsCount = await prisma.submission.count({
      where: { problemId: { in: cloneIds } }
    });
    const progressCount = await prisma.problemProgress.count({
      where: { problemId: { in: cloneIds } }
    });
    const notesCount = await prisma.note.count({
      where: { problemId: { in: cloneIds } }
    });

    console.log(`\n=== SUFFIX CLONE RELATIONS ===`);
    console.log(`Active submissions on clones: ${submissionsCount}`);
    console.log(`Active progress records on clones: ${progressCount}`);
    console.log(`Active notes on clones: ${notesCount}`);

    if (submissionsCount > 0 || progressCount > 0 || notesCount > 0) {
      console.log('\nWarning: Suffix clones contain user data! We must migrate them.');
    } else {
      console.log('\nSafe: Suffix clones do not have any user data. They can be safely deleted.');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkCloneRelations();
