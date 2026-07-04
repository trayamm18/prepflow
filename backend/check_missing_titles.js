const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMissing() {
  try {
    const missing = [
      'Implement Stack using Queues',
      'Two Sum Problem',
      'Add Two Numbers',
      'Median of Two Sorted Arrays',
      'Zigzag Conversion',
      'Reverse Integer',
      'Merge k Sorted Lists',
      'Remove Duplicates from Sorted Array',
      'Search Insert Position',
      'Count and Say',
      'Wildcard Matching',
      'Unique Paths II',
      'Climbing Stairs',
      'Edit Distance'
    ];

    const problems = await prisma.problem.findMany({
      select: { title: true, slug: true }
    });

    console.log('=== CASING AND SLUG MATCH CHECK ===');
    for (const m of missing) {
      console.log(`\nSearching for: "${m}"`);
      const matches = problems.filter(p => p.title.toLowerCase() === m.toLowerCase());
      if (matches.length > 0) {
        console.log(`  Match found: "${matches[0].title}" (Slug: ${matches[0].slug})`);
      } else {
        // partial match
        const partials = problems.filter(p => p.title.toLowerCase().includes(m.toLowerCase().replace(/ \d+$/, '')));
        console.log(`  No exact match. Partials count: ${partials.length}`);
        partials.slice(0, 3).forEach(p => {
          console.log(`    - "${p.title}" (Slug: ${p.slug})`);
        });
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkMissing();
