const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCorrupted() {
  try {
    const problems = await prisma.problem.findMany();
    const corrupted = problems.filter(p => 
      p.sampleInput && p.sampleInput.includes('nums = [1, 2, 3, 4, 5]')
    );
    console.log(`Found ${corrupted.length} problems with array fallback inputs.`);
    
    // Group by Striver vs Standalone
    const striverCorrupted = corrupted.filter(p => p.isStriverSheet);
    const standaloneCorrupted = corrupted.filter(p => !p.isStriverSheet);
    console.log(`Striver: ${striverCorrupted.length}`);
    console.log(`Standalone: ${standaloneCorrupted.length}`);

    // Print top 20 titles of corrupted Striver problems
    console.log('\nTop 20 Striver problems with fallback details:');
    striverCorrupted.slice(0, 20).forEach(p => {
      console.log(`- ${p.title} (Slug: ${p.slug})`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkCorrupted();
