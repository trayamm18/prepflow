const fs = require('fs');
const path = require('path');

const auditResults = JSON.parse(fs.readFileSync(path.join(__dirname, 'audit_results.json'), 'utf8'));

const categories = [
  'Accurate migration',
  'Placeholder content',
  'Generated content',
  'Corrupted examples',
  'Missing descriptions'
];

console.log('=== REPRESENTATIVE EXAMPLES FOR QUALITY AUDIT ===\n');

categories.forEach(cat => {
  console.log(`Category: ${cat}`);
  const items = auditResults.sample.filter(p => p.category === cat);
  console.log(`Found ${items.length} items of this category in the sample.`);
  
  items.slice(0, 3).forEach((item, index) => {
    console.log(`\n  Example ${index + 1}:`);
    console.log(`    Title: ${item.title}`);
    console.log(`    Difficulty: ${item.difficulty}`);
    console.log(`    Statement: ${item.problemStatement}`);
    console.log(`    Sample Input: ${item.sampleInput}`);
    console.log(`    Sample Output: ${item.sampleOutput}`);
    console.log(`    Code Template: ${item.codeTemplate.replace(/\n/g, '\\n')}`);
  });
  console.log('\n----------------------------------------\n');
});
