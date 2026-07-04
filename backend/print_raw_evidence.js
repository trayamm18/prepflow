const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const titles = [
      "Pattern 1",
      "Pattern 6",
      "Pattern 16",
      "Aggressive Cows",
      "Number of islands II",
      "Reverse Nodes in k-Group",
      "Assign Cookies",
      "Largest BST in Binary Tree",
      "3 Sum",
      "3Sum Closest",
      "Two Sum",
      "LRU Cache",
      "Djisktra's Algorithm",
      "Delete all occurrences of a key in DLL",
      "Rotate a LL"
    ];

    console.log("=== RAW EVIDENCE FROM ACTIVE POSTGRESQL DATABASE ===");
    for (const title of titles) {
      const p = await prisma.problem.findFirst({
        where: { title: { equals: title, mode: 'insensitive' } }
      });
      if (!p) {
        console.log(`\n-------------------------------------------`);
        console.log(`PROBLEM NOT FOUND: "${title}"`);
        console.log(`-------------------------------------------`);
        continue;
      }
      console.log(`\n-------------------------------------------`);
      console.log(`DATABASE ID:       ${p.id}`);
      console.log(`SLUG:              ${p.slug}`);
      console.log(`TITLE:             ${p.title}`);
      console.log(`PROBLEM STATEMENT:\n${p.problemStatement}`);
      console.log(`SAMPLE INPUT:      ${p.sampleInput}`);
      console.log(`SAMPLE OUTPUT:     ${p.sampleOutput}`);
      console.log(`EXPLANATION/HINTS:\nHint 1: ${p.hint1}\nHint 2: ${p.hint2}`);
      console.log(`CODE TEMPLATE:\n${p.codeTemplate}`);
      console.log(`-------------------------------------------`);
    }

    // Part 2: Scan all problems for forbidden placeholders
    const allProblems = await prisma.problem.findMany();
    const forbiddenStrings = [
      "To be provided",
      "premium LeetCode",
      "coding challenge for",
      "Description and details will be enriched",
      "Write your solution method here",
      "Method stub to be generated"
    ];

    console.log("\n=== FORBIDDEN STRINGS SCAN REPORT ===");
    let totalMatches = 0;
    const matchesList = [];

    for (const p of allProblems) {
      const textToSearch = [
        p.title,
        p.problemStatement,
        p.sampleInput,
        p.sampleOutput,
        p.codeTemplate,
        p.hint1 || '',
        p.hint2 || ''
      ].join(' ').toLowerCase();

      const matchedStrings = [];
      for (const fs of forbiddenStrings) {
        if (textToSearch.includes(fs.toLowerCase())) {
          matchedStrings.push(fs);
        }
      }

      if (matchedStrings.length > 0) {
        totalMatches++;
        matchesList.push({
          title: p.title,
          slug: p.slug,
          matched: matchedStrings
        });
      }
    }

    console.log(`Total problems containing forbidden placeholders: ${totalMatches}`);
    if (totalMatches > 0) {
      console.log("Details of matching problems:");
      matchesList.forEach((m, idx) => {
        console.log(`[${idx + 1}] Title: "${m.title}" (slug: "${m.slug}") | Matched: ${JSON.stringify(m.matched)}`);
      });
    } else {
      console.log("SUCCESS: 0 problems contain forbidden placeholder strings.");
    }

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
