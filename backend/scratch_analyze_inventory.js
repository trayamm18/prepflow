const fs = require('fs');
const path = require('path');

const inventory = JSON.parse(fs.readFileSync(path.join(__dirname, 'canonical_inventory.json'), 'utf8'));
console.log(`Total inventory items: ${inventory.length}`);

const categoryCounts = {};
const sourceCounts = {};
const topicCounts = {};

inventory.forEach(item => {
  categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1;
  
  const topics = item.topics || [];
  topics.forEach(t => {
    topicCounts[t] = (topicCounts[t] || 0) + 1;
  });
});

console.log('\nCategories:', categoryCounts);
console.log('Sources:', sourceCounts);
console.log('Top Topics (first 30):', Object.entries(topicCounts).sort((a,b) => b[1] - a[1]).slice(0, 30));
