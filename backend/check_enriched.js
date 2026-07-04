const fs = require('fs');
const path = require('path');

const enrichedPath = path.join(__dirname, 'prisma', 'striver_enriched_questions.json');
const enrichedData = JSON.parse(fs.readFileSync(enrichedPath, 'utf8'));

console.log(`Total questions in enriched: ${enrichedData.length}`);

const patterns = enrichedData.filter(q => q.title.toLowerCase().includes('pattern'));
console.log(`Patterns in enriched: ${patterns.length}`);
patterns.forEach(p => {
  console.log(`- Title: "${p.title}"`);
  console.log(`  Input: "${p.sampleInput}"`);
  console.log(`  Output: "${p.sampleOutput}"`);
});
