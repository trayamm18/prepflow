const fs = require('fs');
const path = require('path');

const backup = JSON.parse(fs.readFileSync(path.join(__dirname, 'backup_db_json', 'problems_backup.json'), 'utf8'));

console.log(`Loaded backup with ${backup.length} problems.`);

// Let's inspect 10 random problems
const count = backup.length;
for (let i = 0; i < 10; i++) {
  const p = backup[Math.floor(Math.random() * count)];
  console.log(`\n=== "${p.title}" ===`);
  console.log(`Statement: ${p.problemStatement ? p.problemStatement.substring(0, 150) : 'null'}`);
  console.log(`Input: "${p.sampleInput}"`);
  console.log(`Output: "${p.sampleOutput}"`);
  console.log(`Template: "${p.codeTemplate ? p.codeTemplate.substring(0, 100) : 'null'}"`);
}
