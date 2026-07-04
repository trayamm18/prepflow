const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('Fetching all problems from PrepFlow database to export...');
    const problems = await prisma.problem.findMany({
      include: {
        topics: true
      }
    });

    console.log(`Loaded ${problems.length} problems. Formulating inventory...`);

    const inventory = problems.map(p => {
      // Map topics to simple array of names
      const topicsList = p.topics.map(t => t.name);

      return {
        title: p.title,
        slug: p.slug,
        category: p.category,
        difficulty: p.difficulty,
        problemStatement: p.problemStatement,
        sampleInput: p.sampleInput,
        sampleOutput: p.sampleOutput,
        hint1: p.hint1,
        hint2: p.hint2,
        codeTemplate: p.codeTemplate,
        isStriverSheet: p.isStriverSheet,
        striverStep: p.striverStep,
        striverTopic: p.striverTopic,
        topics: topicsList
      };
    });

    const targetPath = path.join(__dirname, 'canonical_inventory.json');
    fs.writeFileSync(targetPath, JSON.stringify(inventory, null, 2));
    console.log(`Successfully exported clean canonical inventory with ${inventory.length} problems to canonical_inventory.json.`);
  } catch (err) {
    console.error('Export failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
