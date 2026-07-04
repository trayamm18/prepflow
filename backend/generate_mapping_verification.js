const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalize(t) {
  return t.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function runMapping() {
  try {
    console.log('=== PHASE 1: GENERATING MAPPING VERIFICATION REPORT ===');

    const problems = await prisma.problem.findMany({
      include: { topics: true }
    });

    // Load Striver A2Z to check if titles exist there
    const striverDataRaw = fs.readFileSync(path.join(__dirname, 'prisma', 'striver_a2z.json'), 'utf8');
    const striverCategories = JSON.parse(striverDataRaw);
    const striverTitles = new Set();
    
    striverCategories.forEach(cat => {
      cat.subcategories.forEach(sub => {
        sub.problems.forEach(p => {
          striverTitles.add(normalize(p.problem_name));
        });
      });
    });

    const mappingList = [];
    const sourceCounts = {
      Striver: 0,
      LeetCode: 0,
      'Java Fundamentals': 0,
      Custom: 0
    };

    for (const p of problems) {
      const titleLower = p.title.toLowerCase();
      const normTitle = normalize(p.title);
      
      let source = 'LeetCode';
      let confidence = 'HIGH'; // Default to HIGH for clean matched active items

      // Check if it's Java Fundamentals
      const topicsArr = p.topics.map(t => t.name.toLowerCase());
      const isBasicSyntax = p.category === 'Java' || topicsArr.includes('basic syntax') || topicsArr.includes('control flow') || topicsArr.includes('loops') || topicsArr.includes('functions') || topicsArr.includes('recursion');

      if (isBasicSyntax) {
        if (titleLower.startsWith('pattern') || titleLower.includes('pattern:')) {
          source = 'Striver'; // Patterns are part of Striver sheet
        } else {
          source = 'Java Fundamentals';
        }
      } else if (striverTitles.has(normTitle) || p.isStriverSheet) {
        source = 'Striver';
      } else if (p.category === 'Java') {
        source = 'Custom';
      }

      // If slug has std, or title has some weird format, check confidence
      if (p.slug.includes('clone') || p.title.match(/\d+$/)) {
        confidence = 'LOW'; // Duplicate or clone node
      } else if (p.slug.includes('std')) {
        confidence = 'MEDIUM'; // Newly standardized slug
      }

      sourceCounts[source]++;

      mappingList.push({
        id: p.id,
        currentTitle: p.title,
        currentSlug: p.slug,
        canonicalTitle: p.title,
        source: source,
        mappingConfidence: confidence
      });
    }

    const artifactDir = 'C:\\Users\\traya\\.gemini\\antigravity\\brain\\f30557f1-256e-4b6d-91cb-b5e844c38fc1';
    const reportJsonPath = path.join(artifactDir, 'mapping_verification_report.json');
    fs.writeFileSync(reportJsonPath, JSON.stringify(mappingList, null, 2));
    console.log(`Mapping verification report written to ${reportJsonPath}`);

    // Generate canonical_inventory_report.md
    const reportMdPath = path.join(artifactDir, 'canonical_inventory_report.md');
    let md = `# Canonical Inventory & Mapping Verification Report\n\n`;
    md += `This report lists the fresh canonical inventory compiled from all sources, and validates title mappings from the active database.\n\n`;
    md += `## 1. Inventory Summary Counts\n\n`;
    md += `* **Total Canonical Questions**: **${problems.length}**\n`;
    md += `  * **Striver A2Z Sheet / Pattern Questions**: ${sourceCounts['Striver']}\n`;
    md += `  * **LeetCode Inventory Questions**: ${sourceCounts['LeetCode']}\n`;
    md += `  * **Java Fundamentals Questions**: ${sourceCounts['Java Fundamentals']}\n`;
    md += `  * **Custom Java Questions**: ${sourceCounts['Custom']}\n\n`;
    
    // Confidence breakdown
    const highConf = mappingList.filter(m => m.mappingConfidence === 'HIGH').length;
    const medConf = mappingList.filter(m => m.mappingConfidence === 'MEDIUM').length;
    const lowConf = mappingList.filter(m => m.mappingConfidence === 'LOW').length;
    
    md += `## 2. Mapping Confidence Metrics\n\n`;
    md += `* **HIGH Confidence Mappings**: ${highConf}\n`;
    md += `* **MEDIUM Confidence Mappings**: ${medConf}\n`;
    md += `* **LOW Confidence Mappings**: ${lowConf}\n\n`;

    if (lowConf > 0) {
      md += `### LOW Confidence Mappings requiring manual review:\n\n`;
      mappingList.filter(m => m.mappingConfidence === 'LOW').forEach(m => {
        md += `- **Title**: "${m.currentTitle}" | Slug: \`${m.currentSlug}\` | ID: \`${m.id}\` | Source: ${m.source}\n`;
      });
      md += `\n`;
    }

    md += `## 3. Complete Canonical Inventory Table\n\n`;
    md += `| # | Database ID | Current Title | Slug | Source | Confidence |\n`;
    md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
    mappingList.forEach((m, idx) => {
      md += `| ${idx + 1} | \`${m.id}\` | **${m.currentTitle}** | \`${m.currentSlug}\` | ${m.source} | ${m.mappingConfidence} |\n`;
    });

    fs.writeFileSync(reportMdPath, md);
    console.log(`Canonical inventory report written to ${reportMdPath}`);

  } catch (err) {
    console.error('Mapping report generation failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMapping();
