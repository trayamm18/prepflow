const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'prisma', 'striver_a2z.json'), 'utf8'));

console.log("Graph category problems in Striver sheet:");
data.forEach(cat => {
  if (cat.category_name.toLowerCase().includes('graph')) {
    cat.subcategories.forEach(sub => {
      console.log(`\nSubcategory: ${sub.subcategory_name}`);
      sub.problems.forEach(p => {
        console.log(` - "${p.problem_name}"`);
      });
    });
  }
});
