const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Pseudo-random seedable generator to make the 100-sample audit deterministic and reproducible
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

async function runAudit() {
  try {
    console.log('Fetching all problems from PrepFlow database...');
    const problems = await prisma.problem.findMany({
      include: {
        topics: true
      }
    });
    console.log(`Retrieved ${problems.length} problems.`);

    const totalCount = problems.length;
    let stats = {
      accurate: 0,
      placeholder: 0,
      generated: 0,
      corrupted: 0,
      missing: 0
    };

    const categorizedProblems = problems.map((p, idx) => {
      const title = p.title.trim();
      const statement = p.problemStatement ? p.problemStatement.trim() : '';
      const input = p.sampleInput ? p.sampleInput.trim() : '';
      const output = p.sampleOutput ? p.sampleOutput.trim() : '';
      const template = p.codeTemplate ? p.codeTemplate.trim() : '';

      const isPattern = title.toLowerCase().includes('pattern') || p.topics.some(t => t.name.toLowerCase() === 'patterns');
      const isBasicSyntax = p.topics.some(t => t.name.toLowerCase() === 'basic syntax' || t.name.toLowerCase() === 'control flow' || t.name.toLowerCase() === 'loops');

      let category = 'Accurate migration';

      // 1. Missing description
      if (!statement) {
        category = 'Missing descriptions';
        stats.missing++;
      }
      // 2. Corrupted examples / Fallbacks in pattern/syntax questions
      else if ((isPattern || isBasicSyntax) && (input.includes('nums =') || input.includes('[1, 2, 3') || output.includes('[1, 2, 3') || output.includes('Refer to editorial') || input.includes('Input parameter') || output.includes('Decision outcome'))) {
        category = 'Corrupted examples';
        stats.corrupted++;
      }
      // 3. Placeholder content
      else if (statement.includes('premium LeetCode coding challenge') || statement.includes('premium leetcode') || input.includes('Input data for') || output.includes('Expected output for') || input.includes('Refer to editorial')) {
        category = 'Placeholder content';
        stats.placeholder++;
      }
      // 4. Generated content (e.g. 3Sum 2, Two Sum 3)
      else if (/\s+\d+$/.test(title) && !title.toLowerCase().includes('ii') && !title.toLowerCase().includes('iii') && !title.toLowerCase().includes('iv')) {
        category = 'Generated content';
        stats.generated++;
      }
      // 5. Otherwise Accurate
      else {
        stats.accurate++;
      }

      return {
        id: p.id,
        title,
        difficulty: p.difficulty,
        category,
        problemStatement: statement.substring(0, 100) + (statement.length > 100 ? '...' : ''),
        sampleInput: input,
        sampleOutput: output,
        codeTemplate: template.substring(0, 100) + (template.length > 100 ? '...' : ''),
        isStriver: p.isStriverSheet,
        javafxId: p.slug
      };
    });

    console.log('\n=== GLOBAL DATABASE STATISTICS ===');
    console.log(`Total coding questions: ${totalCount}`);
    console.log(`Accurate migrations: ${stats.accurate} (${((stats.accurate/totalCount)*100).toFixed(1)}%)`);
    console.log(`Placeholder content: ${stats.placeholder} (${((stats.placeholder/totalCount)*100).toFixed(1)}%)`);
    console.log(`Generated content: ${stats.generated} (${((stats.generated/totalCount)*100).toFixed(1)}%)`);
    console.log(`Corrupted examples: ${stats.corrupted} (${((stats.corrupted/totalCount)*100).toFixed(1)}%)`);
    console.log(`Missing descriptions: ${stats.missing} (${((stats.missing/totalCount)*100).toFixed(1)}%)`);

    // Let's draw a sample of 100 questions deterministically
    console.log('\nDrawing 100 deterministic sample questions for audit...');
    const sampleSize = 100;
    const sampleIndices = new Set();
    let seed = 42;
    while (sampleIndices.size < sampleSize && sampleIndices.size < totalCount) {
      const randIdx = Math.floor(seededRandom(seed++) * totalCount);
      sampleIndices.add(randIdx);
    }

    const sampleList = Array.from(sampleIndices).map(idx => categorizedProblems[idx]);

    let sampleStats = {
      accurate: 0,
      placeholder: 0,
      generated: 0,
      corrupted: 0,
      missing: 0
    };

    sampleList.forEach(p => {
      if (p.category === 'Accurate migration') sampleStats.accurate++;
      else if (p.category === 'Placeholder content') sampleStats.placeholder++;
      else if (p.category === 'Generated content') sampleStats.generated++;
      else if (p.category === 'Corrupted examples') sampleStats.corrupted++;
      else if (p.category === 'Missing descriptions') sampleStats.missing++;
    });

    console.log('\n=== SAMPLE AUDIT (100 QUESTIONS) STATISTICS ===');
    console.log(`Accurate migrations: ${sampleStats.accurate}`);
    console.log(`Placeholder content: ${sampleStats.placeholder}`);
    console.log(`Generated content: ${sampleStats.generated}`);
    console.log(`Corrupted examples: ${sampleStats.corrupted}`);
    console.log(`Missing descriptions: ${sampleStats.missing}`);

    // Output sample list detail as JSON so we can analyze it
    const fs = require('fs');
    const path = require('path');
    const resultObj = {
      globalStats: stats,
      sampleStats: sampleStats,
      sample: sampleList
    };

    fs.writeFileSync(
      path.join(__dirname, 'audit_results.json'),
      JSON.stringify(resultObj, null, 2)
    );
    console.log('Successfully wrote audit_results.json');

  } catch (err) {
    console.error('Error running audit:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runAudit();
