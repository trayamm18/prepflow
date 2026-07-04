const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Seeded random helper for deterministic auditing
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

async function run() {
  try {
    const problems = await prisma.problem.findMany({
      include: {
        topics: true
      }
    });

    console.log(`Total active problems: ${problems.length}`);

    // Deterministically pick 25 questions
    const pickedProblems = [];
    const totalCount = problems.length;
    const pickedIndices = new Set();
    let seed = 42; // standard audit seed

    while (pickedIndices.size < 25 && pickedIndices.size < totalCount) {
      const idx = Math.floor(seededRandom(seed++) * totalCount);
      pickedIndices.add(idx);
    }

    const indices = Array.from(pickedIndices);
    indices.forEach(idx => {
      pickedProblems.push(problems[idx]);
    });

    console.log(`--- PICKED 25 PROBLEMS FOR AUDIT ---`);
    pickedProblems.forEach((p, i) => {
      console.log(`\n=== [${i + 1}] Title: "${p.title}" ===`);
      console.log(`ID: ${p.id}`);
      console.log(`Slug: ${p.slug}`);
      console.log(`Category: ${p.category}`);
      console.log(`Difficulty: ${p.difficulty}`);
      console.log(`Problem Statement:\n${p.problemStatement}`);
      console.log(`Sample Input:\n${p.sampleInput}`);
      console.log(`Sample Output:\n${p.sampleOutput}`);
      console.log(`Hint 1 (Explanation/Youtube): ${p.hint1}`);
      console.log(`Hint 2 (Article): ${p.hint2}`);
      console.log(`Code Template:\n${p.codeTemplate}`);
      console.log(`Is Striver: ${p.isStriverSheet}`);
      console.log(`Topics: ${p.topics.map(t => t.name).join(', ')}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
