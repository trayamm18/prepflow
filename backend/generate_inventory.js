const fs = require('fs');
const path = require('path');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'recovery_audit_report.json'), 'utf8'));
const backupProblems = JSON.parse(fs.readFileSync(path.join(__dirname, 'backup_db_json', 'problems_backup.json'), 'utf8'));

function normalize(t) {
  return t.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

const backupMap = new Map();
backupProblems.forEach(p => {
  backupMap.set(normalize(p.title), p);
});

const logicalMerges = {
  "climbingstairs": "climbingstairs",
  "countandsay": "countandsay",
  "searchinsertposition": "searchinsertposition",
  "wildcardmatching": "wildcardmatching",
  "mergeintervals": "mergeoverlappingsubintervals",
  "sametree": "checkiftwotreesareidenticalornot",
  "validatebinarysearchtree": "checkifatreeisabstornot",
  "medianoftwosortedarrays": "medianoftwosortedarraysofdifferentsizes",
  "reverseinteger": "reverseanumber",
  "symmetrictree": "symmetrictree",
  "mergeksortedlists": "mergeksortedlists",
  "removeduplicatesfromsortedarray": "removeduplicatesfromsortedarray",
  "uniquepathsii": "uniquepathsii",
  "3sum": "3sum",
  "4sum": "4sum",
  "implementstackusingqueues": "implementstackusingqueue",
  "twosumproblem": "twosum",
  "findthemiddleoflinkedlist": "middleofalinkedlisttortoiseharemethod",
  "primenumbercheck": "checkforprimenumber",
  "checkforanagrams": "checkiftwostringsareanagramofeachother"
};

// Re-read classifications and build the canonical inventory list
const inventory = report.phase2.classifiedList.map(item => {
  const title = item.title;
  let source = 'LeetCode';
  let category = 'DSA';
  let topic = 'Arrays';
  let difficulty = 'MEDIUM';

  // Determine source
  if (item.classification === 'Striver') {
    source = 'Striver';
  } else if (item.classification === 'Basic Syntax') {
    source = 'Java Fundamentals';
    category = 'Java';
    topic = 'Basic Syntax';
    difficulty = 'EASY';
  } else if (item.classification === 'Custom JavaFX') {
    source = 'Custom';
    category = 'Java';
    topic = 'Strings';
    difficulty = 'EASY';
  }

  // Set topic based on keywords in title for inventory cleanliness
  const tLower = title.toLowerCase();
  if (tLower.includes('tree') || tLower.includes('bst') || tLower.includes('inorder') || tLower.includes('root') || tLower.includes('node')) {
    topic = 'Binary Tree';
    if (tLower.includes('bst')) topic = 'BST';
  } else if (tLower.includes('linked list') || tLower.includes('list') || tLower.includes('middle') || tLower.includes('reverse list')) {
    topic = 'Linked List';
  } else if (tLower.includes('graph') || tLower.includes('bfs') || tLower.includes('dfs') || tLower.includes('path') || tLower.includes('shortest') || tLower.includes('dijkstra')) {
    topic = 'Graphs';
  } else if (tLower.includes('string') || tLower.includes('char') || tLower.includes('anagram') || tLower.includes('parenthes')) {
    topic = 'Strings';
  } else if (tLower.includes('prime') || tLower.includes('gcd') || tLower.includes('lcm') || tLower.includes('math') || tLower.includes('divisor') || tLower.includes('number') || tLower.includes('integer') || tLower.includes('roman')) {
    topic = 'Math';
  } else if (tLower.includes('pattern:')) {
    topic = 'Patterns';
    difficulty = 'EASY';
  } else if (tLower.includes('recursive') || tLower.includes('recursion') || tLower.includes('hanoi')) {
    topic = 'Recursion';
    difficulty = 'EASY';
  } else if (tLower.includes('loop') || tLower.includes('while') || tLower.includes('for') || tLower.includes('factorial') || tLower.includes('counter')) {
    topic = 'Loops';
    difficulty = 'EASY';
  } else if (tLower.includes('even') || tLower.includes('odd') || tLower.includes('positive') || tLower.includes('negative') || tLower.includes('grade') || tLower.includes('selector') || tLower.includes('weekday') || tLower.includes('switch') || tLower.includes('if')) {
    topic = 'Control Flow';
    difficulty = 'EASY';
  } else if (tLower.includes('function') || tLower.includes('helper') || tLower.includes('swapper')) {
    topic = 'Functions';
    difficulty = 'EASY';
  }

  // Set difficulty from database if present (to preserve historical ratings)
  const dbMatch = report.phase3.duplicateClonesSample.find(d => d.title.replace(/\s+\d+$/, '').trim().toLowerCase() === title.toLowerCase());
  if (dbMatch && dbMatch.difficulty) {
    difficulty = dbMatch.difficulty;
  }

  const normTitle = normalize(title);
  let slug = slugify(title) + '-std'; // default for new
  if (backupMap.has(normTitle)) {
    slug = backupMap.get(normTitle).slug;
  } else {
    for (const [oldNorm, canonicalNorm] of Object.entries(logicalMerges)) {
      if (canonicalNorm === normTitle && backupMap.has(oldNorm)) {
        slug = backupMap.get(oldNorm).slug;
        break;
      }
    }
  }

  return {
    title,
    slug,
    source,
    category,
    topic,
    difficulty
  };
});

let md = `# Canonical Question Inventory Report

This document presents the Phase 1 & 2 Canonical Question Inventory, compiled from the Striver A2Z sheet, LeetCode base list, original JavaFX DB, and basic syntax lists. No database modifications, question deletions, or content generations have been performed.

---

## 1. Final Unique Title Counts

* **Total Canonical Questions**: **${inventory.length}**
  * **Striver A2Z Sheet Questions**: ${inventory.filter(i => i.source === 'Striver').length}
  * **LeetCode Master Inventory Questions**: ${inventory.filter(i => i.source === 'LeetCode').length}
  * **Java Fundamentals Questions**: ${inventory.filter(i => i.source === 'Java Fundamentals').length}
  * **Custom JavaFX DB Questions**: ${inventory.filter(i => i.source === 'Custom').length}

---

## 2. Source Overlap Report (20 Titles)
These titles overlap between different sources and have been merged into single canonical records:
${report.phase1.overlapsList.map(o => `- **${o.title}** (Overlap: ${o.sources.join(' & ')})`).join('\n')}

---

## 3. Duplicate Title Purge Report
A total of **${report.phase3.duplicateClonesCount}** suffix duplicate clone records (e.g. \`3Sum 2\`, \`3Sum 3\`, \`Add Two Numbers 10\`) were identified in the current PostgreSQL database. 
* **Purge Policy**: These clone records will be deleted upon migration approval to keep only the canonical entries.
* **Relations Verified**: Verified that **0 submissions, 0 notes, and 0 progress records** are associated with these duplicate clone IDs.

---

## 4. Missing / Misaligned Title Report
A total of **${report.phase1.missingCount}** canonical titles are currently missing or misaligned (e.g. due to casing) in the database:
${report.phase1.missingList.map(m => `- **${m.title}** (Casing match in active DB: \`${m.caseInsensitiveMatch}\`)`).join('\n')}

---

## 5. Complete Canonical Question Inventory

The table below lists all **${inventory.length}** canonical questions. This inventory will serve as the single source of truth for the entire platform once approved.

| # | Title | Slug | Source | Category | Topic | Difficulty |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${inventory.map((item, index) => `| ${index + 1} | ${item.title} | \`${item.slug}\` | ${item.source} | ${item.category} | ${item.topic} | ${item.difficulty} |`).join('\n')}
`;

const artifactPath = path.join('C:', 'Users', 'traya', '.gemini', 'antigravity', 'brain', 'f30557f1-256e-4b6d-91cb-b5e844c38fc1', 'canonical_inventory.md');
fs.writeFileSync(artifactPath, md);
console.log('Successfully generated canonical_inventory.md');
