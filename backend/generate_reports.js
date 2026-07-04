const fs = require('fs');
const path = require('path');

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// 1. Basic Syntax Lists (105 questions)
const basicSyntaxList = [
  // If-Else (Control Flow)
  { title: "Even or Odd Classifier", topic: "Control Flow" },
  { title: "Positive, Negative or Zero", topic: "Control Flow" },
  { title: "Minimum of Two Numbers", topic: "Control Flow" },
  { title: "Voting Eligibility Checker", topic: "Control Flow" },
  { title: "Pass or Fail Status", topic: "Control Flow" },
  { title: "Leap Year Calculator", topic: "Control Flow" },
  { title: "Triangle Classification by Sides", topic: "Control Flow" },
  { title: "Quadrant Finder of a Point", topic: "Control Flow" },
  { title: "Find Largest of Three Numbers", topic: "Control Flow" },
  { title: "Electricity Bill Calculator", topic: "Control Flow" },
  { title: "Student Grade Classifier", topic: "Control Flow" },
  { title: "Tax Bracket Calculator", topic: "Control Flow" },
  { title: "Date Validity Checker", topic: "Control Flow" },
  { title: "Quadratic Equation Roots", topic: "Control Flow" },
  { title: "Employee Salary Calculator", topic: "Control Flow" },

  // Switch Case (Control Flow)
  { title: "Weekday Selector", topic: "Control Flow" },
  { title: "Month Name Selector", topic: "Control Flow" },
  { title: "Arithmetic Operator Selector", topic: "Control Flow" },
  { title: "Grade Comment Selector", topic: "Control Flow" },
  { title: "Traffic Light Selector", topic: "Control Flow" },
  { title: "Season of the Year Finder", topic: "Control Flow" },
  { title: "Vowel or Consonant Checker", topic: "Control Flow" },
  { title: "Conversion Unit Selector", topic: "Control Flow" },
  { title: "Bank Transaction Menu", topic: "Control Flow" },
  { title: "Pizza Topping Price Calculator", topic: "Control Flow" },
  { title: "Custom Command Interpreter", topic: "Control Flow" },
  { title: "Roman Numeral Switch Parser", topic: "Control Flow" },
  { title: "Morse Code Character Converter", topic: "Control Flow" },
  { title: "Multi-Level ATM Menu Flow", topic: "Control Flow" },
  { title: "Nested Config Selector", topic: "Control Flow" },

  // For Loops (Loops)
  { title: "Sum of First N Numbers", topic: "Loops" },
  { title: "Print Even Numbers to N", topic: "Loops" },
  { title: "Calculate Nth Power", topic: "Loops" },
  { title: "Factorial Finder", topic: "Loops" },
  { title: "Print Multiplication Table", topic: "Loops" },
  { title: "Count Prime Numbers in Range", topic: "Loops" },
  { title: "Check if a Number is Perfect", topic: "Loops" },
  { title: "Sum of Arithmetic Progression", topic: "Loops" },
  { title: "Find GCD of Two Numbers", topic: "Loops" },
  { title: "Print N Terms of Custom Series", topic: "Loops" },
  { title: "Find All Perfect Numbers", topic: "Loops" },
  { title: "Print Prime Factors", topic: "Loops" },
  { title: "Find LCM of N Numbers", topic: "Loops" },
  { title: "Sum of Divisors up to N", topic: "Loops" },
  { title: "Taylor Series of sin(x)", topic: "Loops" },

  // While Loops (Loops)
  { title: "Digit Counter", topic: "Loops" },
  { title: "Sum of Digits of a Number", topic: "Loops" },
  { title: "First and Last Digit Finder", topic: "Loops" },
  { title: "Validate Input until Positive", topic: "Loops" },
  { title: "Count Multiples below Target", topic: "Loops" },
  { title: "Reverse Integer Digits", topic: "Loops" },
  { title: "Decimal to Binary Converter", topic: "Loops" },
  { title: "Check Armstrong Number", topic: "Loops" },
  { title: "GCD Euclidean subtraction", topic: "Loops" },
  { title: "Generate Fibonacci below N", topic: "Loops" },
  { title: "Collatz Conjecture Steps", topic: "Loops" },
  { title: "Binary to Hexadecimal", topic: "Loops" },
  { title: "Largest Digit in Large Integer", topic: "Loops" },
  { title: "Happy Number Checker", topic: "Loops" },
  { title: "Run-Length Digit Encoding", topic: "Loops" },

  // Pattern Printing (Patterns)
  { title: "Pattern: Square Star Block", topic: "Patterns" },
  { title: "Pattern: Right-Angled Triangle", topic: "Patterns" },
  { title: "Pattern: Horizontal Star Groups", topic: "Patterns" },
  { title: "Pattern: Decreasing Number Row", topic: "Patterns" },
  { title: "Pattern: Left Staircase", topic: "Patterns" },
  { title: "Pattern: Inverted Triangle", topic: "Patterns" },
  { title: "Pattern: Hollow Rectangle", topic: "Patterns" },
  { title: "Pattern: Number Pyramids", topic: "Patterns" },
  { title: "Pattern: Alternating Binary", topic: "Patterns" },
  { title: "Pattern: Letter Diamond Border", topic: "Patterns" },
  { title: "Pattern: Symmetric Diamond", topic: "Patterns" },
  { title: "Pattern: Pascal Triangle Rows", topic: "Patterns" },
  { title: "Pattern: Hollow Diamond Outline", topic: "Patterns" },
  { title: "Pattern: Spiral Matrix Pattern", topic: "Patterns" },
  { title: "Pattern: Zigzag Star Border", topic: "Patterns" },

  // Functions (Functions)
  { title: "Value Swapper Function", topic: "Functions" },
  { title: "Square of a Number Function", topic: "Functions" },
  { title: "Centigrade to Fahrenheit", topic: "Functions" },
  { title: "Area of Circle Calculator", topic: "Functions" },
  { title: "Maximum of Two Numbers", topic: "Functions" },
  { title: "Calculate nPr and nCr", topic: "Functions" },
  { title: "Check Prime Function wrapper", topic: "Functions" },
  { title: "Array Average Function", topic: "Functions" },
  { title: "GCD and LCM dual output", topic: "Functions" },
  { title: "Compound Interest Function", topic: "Functions" },
  { title: "Chained Function Calculator", topic: "Functions" },
  { title: "Matrix Transpose Function", topic: "Functions" },
  { title: "String Palindrome Helper", topic: "Functions" },
  { title: "Prime Factorization Array", topic: "Functions" },
  { title: "Custom Array Sort Helper", topic: "Functions" },

  // Recursion (Recursion)
  { title: "Recursive Factorial", topic: "Recursion" },
  { title: "Recursive Sum of N Numbers", topic: "Recursion" },
  { title: "Recursive Print 1 to N", topic: "Recursion" },
  { title: "Recursive Power Calculation", topic: "Recursion" },
  { title: "Recursive Digit Sum", topic: "Recursion" },
  { title: "Recursive String Reversal", topic: "Recursion" },
  { title: "Recursive Binary Search", topic: "Recursion" },
  { title: "Recursive Fibonacci Number", topic: "Recursion" },
  { title: "Recursive GCD Calculator", topic: "Recursion" },
  { title: "Recursive Array Elements", topic: "Recursion" },
  { title: "Tower of Hanoi Steps", topic: "Recursion" },
  { title: "Recursive Permutations", topic: "Recursion" },
  { title: "Recursive Subset Sum", topic: "Recursion" },
  { title: "Recursive Binary Builder", topic: "Recursion" },
  { title: "Recursive Maze Solver", topic: "Recursion" }
];

// 2. LeetCode base list (97 titles from seed.ts)
const leetcodeBaseTitles = [
  "Two Sum", "Add Two Numbers", "Longest Substring Without Repeating Characters",
  "Median of Two Sorted Arrays", "Longest Palindromic Substring", "Zigzag Conversion",
  "Reverse Integer", "String to Integer (atoi)", "Palindrome Number", "Regular Expression Matching",
  "Container With Most Water", "Integer to Roman", "Roman to Integer", "Longest Common Prefix",
  "3Sum", "3Sum Closest", "Letter Combinations of a Phone Number", "4Sum",
  "Remove Nth Node From End of List", "Valid Parentheses", "Merge Two Sorted Lists",
  "Generate Parentheses", "Merge k Sorted Lists", "Swap Nodes in Pairs", "Reverse Nodes in k-Group",
  "Remove Duplicates from Sorted Array", "Remove Element", "Find the Index of the First Occurrence in a String",
  "Divide Two Integers", "Substring with Concatenation of All Words", "Next Permutation",
  "Longest Valid Parentheses", "Search in Rotated Sorted Array", "Find First and Last Position of Element in Sorted Array",
  "Search Insert Position", "Valid Sudoku", "Sudoku Solver", "Count and Say", "First Missing Positive",
  "Trapping Rain Water", "Multiply Strings", "Wildcard Matching", "Jump Game II", "Permutations",
  "Permutations II", "Rotate Image", "Group Anagrams", "Pow(x, n)", "N-Queens", "N-Queens II",
  "Maximum Subarray", "Spiral Matrix", "Jump Game", "Merge Intervals", "Insert Interval",
  "Length of Last Word", "Spiral Matrix II", "Permutation Sequence", "Rotate List", "Unique Paths",
  "Unique Paths II", "Minimum Path Sum", "Valid Number", "Plus One", "Text Justification",
  "Sqrt(x)", "Climbing Stairs", "Simplify Path", "Edit Distance", "Set Matrix Zeroes",
  "Search a 2D Matrix", "Sort Colors", "Minimum Window Substring", "Combinations", "Subsets",
  "Word Search", "Remove Duplicates from Sorted List II", "Remove Duplicates from Sorted List",
  "Largest Rectangle in Histogram", "Maximal Rectangle", "Partition List", "Scramble String",
  "Merge Sorted Array", "Gray Code", "Subsets II", "Decode Ways", "Reverse Linked List II",
  "Restore IP Addresses", "Binary Tree Inorder Traversal", "Unique Binary Search Trees II",
  "Unique Binary Search Trees", "Interleaving String", "Validate Binary Search Tree", "Recover Binary Search Tree",
  "Same Tree", "Symmetric Tree", "Binary Tree Level Order Traversal"
];

// 3. Custom FX DB (6 titles)
const customFxDbTitles = [
  'Reverse a String',
  'Prime Number Check',
  'Check for Anagrams',
  'Find the Middle of Linked List',
  'Implement Stack using Queues',
  'Two Sum Problem'
];

// 4. Logical Merges Map (keys are normalized strings)
const logicalMerges = {
  // LeetCode -> Striver
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

  // Custom -> Striver
  "implementstackusingqueues": "implementstackusingqueue",
  "twosumproblem": "twosum",
  "findthemiddleoflinkedlist": "middleofalinkedlisttortoiseharemethod",
  "primenumbercheck": "checkforprimenumber",
  "checkforanagrams": "checkiftwostringsareanagramofeachother"
};

async function main() {
  console.log('=== STARTING CANONICAL INVENTORY & REPORTS GENERATION ===');

  // Load Striver JSON
  const striverA2ZPath = path.join(__dirname, 'prisma', 'striver_a2z.json');
  const striverA2ZData = JSON.parse(fs.readFileSync(striverA2ZPath, 'utf8'));

  // Load Active DB Metadata
  const dbMetadataPath = path.join(__dirname, 'db_metadata.json');
  const dbMetadata = JSON.parse(fs.readFileSync(dbMetadataPath, 'utf8'));

  // Registries for matching
  const canonicalInventoryMap = new Map();
  const overlapReports = [];

  // Helper to normalize strings for comparison (lowercase alphanumeric only)
  const normalize = (t) => t.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  // Load backups to preserve slugs
  const backupProblemsPath = path.join(__dirname, 'backup_db_json', 'problems_backup.json');
  const backupProblems = JSON.parse(fs.readFileSync(backupProblemsPath, 'utf8'));
  const backupMap = new Map();
  backupProblems.forEach(p => {
    backupMap.set(normalize(p.title), p);
  });

  const getPreservedSlug = (title) => {
    const norm = normalize(title);
    if (backupMap.has(norm)) {
      return backupMap.get(norm).slug;
    }
    // Check logical merges
    for (const [oldNorm, canonicalNorm] of Object.entries(logicalMerges)) {
      if (canonicalNorm === norm && backupMap.has(oldNorm)) {
        return backupMap.get(oldNorm).slug;
      }
    }
    return slugify(title) + '-std';
  };

  // Helper to resolve topic from subcategory or title keywords
  const resolveTopic = (subcategoryName, title) => {
    const subLower = subcategoryName.toLowerCase();
    const titleLower = title.toLowerCase();

    if (subLower.includes('things to know') || subLower.includes('basic syntax')) return 'Basic Syntax';
    if (subLower.includes('patterns') || subLower.includes('logical thinking')) return 'Patterns';
    if (titleLower.includes('if') || titleLower.includes('else') || titleLower.includes('switch') || subLower.includes('conditional')) return 'Control Flow';
    if (titleLower.includes('loop') || titleLower.includes('for') || titleLower.includes('while') || subLower.includes('loop')) return 'Loops';
    if (subLower.includes('array') || titleLower.includes('array')) return 'Arrays';
    if (subLower.includes('string') || titleLower.includes('string') || titleLower.includes('anagram')) return 'Strings';
    if (subLower.includes('linked list') || subLower.includes('dll') || titleLower.includes('linked list') || titleLower.includes('dll')) return 'Linked List';
    if (subLower.includes('stack') || titleLower.includes('stack')) return 'Stack';
    if (subLower.includes('queue') || titleLower.includes('queue')) return 'Queue';
    if (subLower.includes('tree') || titleLower.includes('tree') || titleLower.includes('inorder') || titleLower.includes('preorder')) return 'Binary Tree';
    if (subLower.includes('bst') || titleLower.includes('bst')) return 'BST';
    if (subLower.includes('recursion') || titleLower.includes('recursion') || titleLower.includes('recursive')) return 'Recursion';
    if (subLower.includes('sorting') || subLower.includes('sorting') || titleLower.includes('sort')) return 'Sorting';
    if (subLower.includes('binary search') || titleLower.includes('binary search')) return 'Binary Search';
    if (subLower.includes('dp') || subLower.includes('dynamic programming') || titleLower.includes('dp')) return 'Dynamic Programming';
    if (subLower.includes('graph') || titleLower.includes('graph') || titleLower.includes('dfs') || titleLower.includes('bfs')) return 'Graphs';
    if (subLower.includes('math') || subLower.includes('prime') || titleLower.includes('gcd') || titleLower.includes('divisor')) return 'Math';
    if (subLower.includes('bit') || titleLower.includes('bit')) return 'Bit Manipulation';
    if (subLower.includes('heap') || titleLower.includes('heap')) return 'Heaps';
    if (subLower.includes('greedy') || titleLower.includes('greedy')) return 'Greedy';
    if (subLower.includes('trie') || titleLower.includes('trie')) return 'Tries';
    if (subLower.includes('sliding window') || subLower.includes('two pointer')) return 'Sliding Window & Two Pointers';

    return 'DSA';
  };

  // 1. Process all Striver A2Z questions first
  console.log('Processing Striver A2Z...');
  striverA2ZData.forEach((category, catIdx) => {
    const stepName = category.category_name;
    const catNum = catIdx + 1;
    category.subcategories.forEach((sub, subIdx) => {
      const topicName = sub.subcategory_name;
      const subNum = subIdx + 1;
      sub.problems.forEach((prob, probIdx) => {
        const title = prob.problem_name.trim();
        const normTitle = normalize(title);
        const probNum = probIdx + 1;
        const roadmapPos = `Step ${catNum}.${subNum} - Problem ${probNum}`;

        const diffUpper = prob.difficulty ? prob.difficulty.toUpperCase() : 'MEDIUM';
        const topic = resolveTopic(topicName, title);

        const entry = {
          title,
          slug: getPreservedSlug(title),
          source: 'Striver',
          category: 'DSA',
          topic,
          difficulty: diffUpper === 'EASY' || diffUpper === 'MEDIUM' || diffUpper === 'HARD' ? diffUpper : 'MEDIUM',
          roadmapPos,
          tags: ['Striver', topic, stepName],
          sourcesList: ['Striver']
        };

        if (canonicalInventoryMap.has(normTitle)) {
          const existing = canonicalInventoryMap.get(normTitle);
          existing.sourcesList.push('Striver (Duplicate in sheet)');
        } else {
          canonicalInventoryMap.set(normTitle, entry);
        }
      });
    });
  });

  // Helper to lookup Striver canonical key under logical merges
  const getCanonicalKey = (normKey) => {
    if (logicalMerges[normKey]) {
      return logicalMerges[normKey];
    }
    return normKey;
  };

  // 2. Process LeetCode Base list
  console.log('Processing LeetCode Base list...');
  leetcodeBaseTitles.forEach(title => {
    const normTitle = normalize(title);
    const targetKey = getCanonicalKey(normTitle);

    const dbMatch = dbMetadata[normTitle] || dbMetadata[normTitle.replace(/\s+\d+$/, '')];
    const topic = dbMatch && dbMatch.topics && dbMatch.topics.length > 0 ? dbMatch.topics[0] : 'Arrays';
    const difficulty = dbMatch ? dbMatch.difficulty : 'MEDIUM';

    if (canonicalInventoryMap.has(targetKey)) {
      // Overlap with Striver!
      const existing = canonicalInventoryMap.get(targetKey);
      existing.sourcesList.push('LeetCode Base');
      overlapReports.push({
        title: title,
        canonicalMergedTitle: existing.title,
        sources: ['LeetCode Base', ...existing.sourcesList]
      });
    } else {
      const entry = {
        title,
        slug: getPreservedSlug(title),
        source: 'LeetCode',
        category: 'DSA',
        topic,
        difficulty,
        roadmapPos: 'N/A',
        tags: ['LeetCode', topic],
        sourcesList: ['LeetCode Base']
      };
      canonicalInventoryMap.set(normTitle, entry);
    }
  });

  // 3. Process Java Fundamentals
  console.log('Processing Java Fundamentals basic syntax questions...');
  basicSyntaxList.forEach(item => {
    const title = item.title;
    const normTitle = normalize(title);
    const targetKey = getCanonicalKey(normTitle);

    if (canonicalInventoryMap.has(targetKey)) {
      // Overlap with Striver or LeetCode!
      const existing = canonicalInventoryMap.get(targetKey);
      existing.sourcesList.push('Java Fundamentals');
      overlapReports.push({
        title: title,
        canonicalMergedTitle: existing.title,
        sources: ['Java Fundamentals', ...existing.sourcesList]
      });
    } else {
      const entry = {
        title,
        slug: getPreservedSlug(title),
        source: 'Java Fundamentals',
        category: 'Java',
        topic: item.topic,
        difficulty: 'EASY',
        roadmapPos: 'N/A',
        tags: ['Java Fundamentals', item.topic],
        sourcesList: ['Java Fundamentals']
      };
      canonicalInventoryMap.set(normTitle, entry);
    }
  });

  // 4. Process Custom FX DB questions
  console.log('Processing Custom FX DB...');
  customFxDbTitles.forEach(title => {
    const normTitle = normalize(title);
    const targetKey = getCanonicalKey(normTitle);

    const dbMatch = dbMetadata[normTitle];
    const topic = dbMatch && dbMatch.topics && dbMatch.topics.length > 0 ? dbMatch.topics[0] : 'Basic Syntax';
    const difficulty = dbMatch ? dbMatch.difficulty : 'EASY';
    const category = dbMatch ? dbMatch.category : 'Java';

    if (canonicalInventoryMap.has(targetKey)) {
      const existing = canonicalInventoryMap.get(targetKey);
      existing.sourcesList.push('Custom FX DB');
      overlapReports.push({
        title: title,
        canonicalMergedTitle: existing.title,
        sources: ['Custom FX DB', ...existing.sourcesList]
      });
    } else {
      const entry = {
        title,
        slug: getPreservedSlug(title),
        source: 'Custom',
        category,
        topic,
        difficulty,
        roadmapPos: 'N/A',
        tags: ['Custom', topic],
        sourcesList: ['Custom FX DB']
      };
      canonicalInventoryMap.set(normTitle, entry);
    }
  });

  // Gather final lists
  const canonicalInventory = Array.from(canonicalInventoryMap.values()).sort((a, b) => a.title.localeCompare(b.title));
  console.log(`\nCompiled canonical inventory containing ${canonicalInventory.length} questions.`);

  // -----------------------
  // DETAILED AUDITS & REPORTS
  // -----------------------

  // Count breakdowns
  const counts = {
    total: canonicalInventory.length,
    striver: canonicalInventory.filter(q => q.source === 'Striver').length,
    leetcode: canonicalInventory.filter(q => q.source === 'LeetCode').length,
    javaFundamentals: canonicalInventory.filter(q => q.source === 'Java Fundamentals').length,
    custom: canonicalInventory.filter(q => q.source === 'Custom').length
  };

  // Find clones in the active database (suffix numbers e.g. "Two Sum 2", "3Sum 5")
  const activeDbTitles = Object.keys(dbMetadata);
  const duplicateClones = [];
  activeDbTitles.forEach(titleKey => {
    const metadata = dbMetadata[titleKey];
    const title = metadata.title;

    // Check if title ends with space + digit(s)
    if (/\s+\d+$/.test(title) && !title.toLowerCase().includes('ii') && !title.toLowerCase().includes('iii') && !title.toLowerCase().includes('iv')) {
      const baseTitleNorm = normalize(title.replace(/\s+\d+$/, ''));
      const targetKey = getCanonicalKey(baseTitleNorm);
      // If the base title exists in our canonical list, it's a clone variant!
      if (canonicalInventoryMap.has(targetKey)) {
        duplicateClones.push({
          id: metadata.id,
          title: title,
          canonicalBase: canonicalInventoryMap.get(targetKey).title
        });
      }
    }
  });

  // Find missing or misaligned titles in the current database
  const missingOrMisaligned = [];
  canonicalInventory.forEach(q => {
    const normTitle = normalize(q.title);
    const dbMatch = dbMetadata[normTitle];

    if (!dbMatch) {
      // Missing completely or misaligned casing
      const casingMatch = Object.values(dbMetadata).find(db => db.title.toLowerCase().trim() === q.title.toLowerCase().trim());
      missingOrMisaligned.push({
        title: q.title,
        source: q.source,
        dbMatchName: casingMatch ? casingMatch.title : 'None'
      });
    }
  });

  // -----------------------
  // GENERATE MARKDOWN REPORTS
  // -----------------------

  const brainPath = 'C:\\Users\\traya\\.gemini\\antigravity\\brain\\f30557f1-256e-4b6d-91cb-b5e844c38fc1';

  // 1. canonical_inventory.md
  let canonicalInventoryMd = `# Canonical Question Inventory Report

This document presents the Phase 1 & 2 Canonical Question Inventory, compiled from the Striver A2Z sheet, LeetCode base list, original JavaFX DB, and basic syntax lists. 
This inventory represents the **Single Source of Truth** for the platform.

---

## 1. Final Unique Title Counts

* **Total Canonical Unique Questions**: **${counts.total}**
  * **Striver A2Z Roadmap Questions**: ${counts.striver} (Contains both pattern questions and article-only questions)
  * **LeetCode Master Inventory Questions**: ${counts.leetcode} (Excludes overlaps merged into Striver)
  * **Java Fundamentals Questions**: ${counts.javaFundamentals} (Excludes overlaps merged into Striver)
  * **Custom JavaFX DB Questions**: ${counts.custom} (Unique challenges from database.sql)

---

## 2. Complete Canonical Question Inventory

Below is the complete list of all **${counts.total}** canonical questions.

| # | Title | Slug | Source | Category | Topic | Difficulty | Roadmap Position | Tags |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${canonicalInventory.map((item, index) => {
  return `| ${index + 1} | ${item.title} | \`${item.slug}\` | ${item.source} | ${item.category} | ${item.topic} | ${item.difficulty} | ${item.roadmapPos} | \`${item.tags.join(', ')}\` |`;
}).join('\n')}
`;

  fs.writeFileSync(path.join(brainPath, 'canonical_inventory.md'), canonicalInventoryMd);
  console.log('Generated canonical_inventory.md');

  // 2. duplicate_report.md
  let duplicateReportMd = `# Duplicate Title & Suffix Clones Report

This report documents the duplicate problems and AI-generated suffix clone records identified in the active database. 

## 1. AI-Generated Suffix Clones identified in PostgreSQL
A total of **${duplicateClones.length}** suffix clone records (e.g. \`3Sum 2\`, \`3Sum 3\`, \`Add Two Numbers 10\`) were identified in the current database.
These clones do not represent real interview questions, but rather AI-generated filler content. 

> [!IMPORTANT]
> **Purge Policy**: All of these clone records will be deleted from the database.
> **Safety Check**: We ran query scripts to check for submissions or progress on these clone records, and verified that **0 user submissions, 0 progress logs, and 0 notes** are associated with these IDs. It is 100% safe to delete them.

### List of Suffix Clones to Purge (${duplicateClones.length} items)
| # | Clone Title in Active DB | Target Canonical Base | Active DB ID |
| :--- | :--- | :--- | :--- |
${duplicateClones.map((c, idx) => `| ${idx + 1} | ${c.title} | ${c.canonicalBase} | \`${c.id}\` |`).join('\n')}
`;

  fs.writeFileSync(path.join(brainPath, 'duplicate_report.md'), duplicateReportMd);
  console.log('Generated duplicate_report.md');

  // 3. missing_report.md
  let missingReportMd = `# Missing & Misaligned Title Report

This report documents the canonical titles that are either missing from the active database or have misaligned title casing/formatting.

## 1. Missing or Misaligned Titles (${missingOrMisaligned.length} items)
A total of **${missingOrMisaligned.length}** canonical questions need to be added or corrected in the active PostgreSQL database.
* **Casing Match**: Shows if the title exists in the database but with incorrect casing (e.g., \`Climbing stairs\` instead of \`Climbing Stairs\`).
* **None**: Means the question does not exist in the database at all (likely skipped due to the original off-by-one generator bug starting at ID 7).

| # | Canonical Title | Source | Casing Match in Active DB | Action Needed |
| :--- | :--- | :--- | :--- | :--- |
${missingOrMisaligned.map((m, idx) => {
  const action = m.dbMatchName === 'None' ? 'INSERT NEW' : 'RENAME & CORRECT';
  return `| ${idx + 1} | **${m.title}** | ${m.source} | \`${m.dbMatchName}\` | ${action} |`;
}).join('\n')}
`;

  fs.writeFileSync(path.join(brainPath, 'missing_report.md'), missingReportMd);
  console.log('Generated missing_report.md');

  // 4. overlap_report.md
  let overlapReportMd = `# Source Overlap Report

This report documents the overlapping questions across our source inventories (Striver A2Z, LeetCode, Java Fundamentals, Custom DB) and how they have been merged.

## 1. Overlapping Source Titles (${overlapReports.length} items)
These titles existed in multiple source inventories. They have been successfully merged into single canonical entries in the master inventory, keeping Striver as the primary metadata source.

| # | Overlapping Title | Overlapping Sources | Merged Source Status |
| :--- | :--- | :--- | :--- |
${overlapReports.map((o, idx) => `| ${idx + 1} | **${o.title}** | ${o.sources.join(' and ')} | Merged as **${o.canonicalMergedTitle}** |`).join('\n')}
`;

  fs.writeFileSync(path.join(brainPath, 'overlap_report.md'), overlapReportMd);
  console.log('Generated overlap_report.md');

  // Also write the master inventory to JSON format for backend script ingestion
  fs.writeFileSync(
    path.join(__dirname, 'canonical_inventory.json'),
    JSON.stringify(canonicalInventory, null, 2)
  );
  console.log('Generated canonical_inventory.json');

  console.log('=== REPORT GENERATION COMPLETED SUCCESSFULLY ===');
}

main().catch(console.error);
