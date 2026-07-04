const fs = require('fs');
const path = require('path');

try {
  const fileContent = fs.readFileSync(path.join(__dirname, 'canonical_inventory.json'), 'utf8');
  const inventory = JSON.parse(fileContent);
  console.log(`canonical_inventory.json contains ${inventory.length} problems.`);
  if (inventory.length > 0) {
    console.log(`First problem:`, Object.keys(inventory[0]));
  }
} catch (err) {
  console.error(err);
}
