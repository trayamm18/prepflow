const fs = require('fs');
const path = require('path');

function normalize(t) {
  return t.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

const backupPath = path.join(__dirname, 'backup_db_json', 'problems_backup.json');
const backupProblems = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

const dbMetadata = {};

backupProblems.forEach(p => {
  const normKey = normalize(p.title);
  dbMetadata[normKey] = {
    id: p.id,
    title: p.title,
    difficulty: p.difficulty,
    category: p.category,
    topics: p.topics ? p.topics.map(t => t.name) : []
  };
});

fs.writeFileSync(path.join(__dirname, 'db_metadata.json'), JSON.stringify(dbMetadata, null, 2));
console.log('Successfully generated db_metadata.json containing ' + Object.keys(dbMetadata).length + ' entries.');
