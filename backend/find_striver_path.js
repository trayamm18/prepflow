const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'prisma', 'striver_a2z.json'), 'utf8'));

console.log("Problems containing 'Dijkstra' in Striver A2Z sheet JSON:");
const results = [];
data.forEach(cat => {
  cat.subcategories.forEach(sub => {
    sub.problems.forEach(p => {
      if (p.problem_name.toLowerCase().includes('dijkstra') || p.problem_name.toLowerCase().includes('shortest path')) {
        results.push(p.problem_name);
      }
    });
  });
});

console.log(results);
