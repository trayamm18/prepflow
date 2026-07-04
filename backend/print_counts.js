const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'recovery_audit_report.json'), 'utf8'));

console.log('=== SUMMARY COUNTS ===');
console.log('Phase 1 Inventory:');
console.log(`- Total Scanned Titles: ${report.phase1.totalScanCount}`);
console.log(`- Unique Recovered Titles (Canonical): ${report.phase1.uniqueCount}`);
console.log(`- Overlaps between sources: ${report.phase1.overlapsCount}`);
console.log(`- Canonical titles missing from active PG: ${report.phase1.missingCount}`);

console.log('\nPhase 2 Classifications:');
const classifications = {};
report.phase2.classifiedList.forEach(item => {
  classifications[item.classification] = (classifications[item.classification] || 0) + 1;
});
Object.keys(classifications).forEach(k => {
  console.log(`- ${k}: ${classifications[k]}`);
});

console.log('\nPhase 3 Current PostgreSQL Issues:');
console.log(`- Questions with Placeholder Descriptions: ${report.phase3.placeholderDescriptionsCount}`);
console.log(`- Questions with Incorrect/Fallback Sample Inputs: ${report.phase3.incorrectSampleInputsCount}`);
console.log(`- Questions with Incorrect/Fallback Sample Outputs: ${report.phase3.incorrectSampleOutputsCount}`);
console.log(`- Questions with Generic Code Templates: ${report.phase3.genericTemplatesCount}`);
console.log(`- Questions that are Duplicate Suffix Clones: ${report.phase3.duplicateClonesCount}`);
