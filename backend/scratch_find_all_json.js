const fs = require('fs');
const path = require('path');

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const fullPath = path.join(dir, f);
    if (f === 'node_modules' || f === '.git' || f === 'bin' || f === 'target' || f === '.metadata' || f === '.settings') {
      return;
    }
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else {
      const ext = path.extname(f);
      if (ext === '.json' || ext === '.txt' || ext === '.xml' || ext === '.csv') {
        console.log(`Found file: ${fullPath} (${stat.size} bytes)`);
      }
    }
  });
}

console.log('--- RECURSIVE FILE SEARCH ---');
searchDir('e:/java interview projwct');
