const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Original basic syntax list (105 questions)
const basicSyntaxTitles = [
  // If-Else
  "Even or Odd Classifier", "Positive, Negative or Zero", "Minimum of Two Numbers", "Voting Eligibility Checker", "Pass or Fail Status",
  "Leap Year Calculator", "Triangle Classification by Sides", "Quadrant Finder of a Point", "Find Largest of Three Numbers", "Electricity Bill Calculator",
  "Student Grade Classifier", "Tax Bracket Calculator", "Date Validity Checker", "Quadratic Equation Roots", "Employee Salary Calculator",
  // Switch Case
  "Weekday Selector", "Month Name Selector", "Arithmetic Operator Selector", "Grade Comment Selector", "Traffic Light Selector",
  "Season of the Year Finder", "Vowel or Consonant Checker", "Conversion Unit Selector", "Bank Transaction Menu", "Pizza Topping Price Calculator",
  "Custom Command Interpreter", "Roman Numeral Switch Parser", "Morse Code Character Converter", "Multi-Level ATM Menu Flow", "Nested Config Selector",
  // For Loops
  "Sum of First N Numbers", "Print Even Numbers to N", "Calculate Nth Power", "Factorial Finder", "Print Multiplication Table",
  "Count Prime Numbers in Range", "Check if a Number is Perfect", "Sum of Arithmetic Progression", "Find GCD of Two Numbers", "Print N Terms of Custom Series",
  "Find All Perfect Numbers", "Print Prime Factors", "Find LCM of N Numbers", "Sum of Divisors up to N", "Taylor Series of sin(x)",
  // While Loops
  "Digit Counter", "Sum of Digits of a Number", "First and Last Digit Finder", "Validate Input until Positive", "Count Multiples below Target",
  "Reverse Integer Digits", "Decimal to Binary Converter", "Check Armstrong Number", "GCD Euclidean subtraction", "Generate Fibonacci below N",
  "Collatz Conjecture Steps", "Binary to Hexadecimal", "Largest Digit in Large Integer", "Happy Number Checker", "Run-Length Digit Encoding",
  // Pattern Printing
  "Pattern: Square Star Block", "Pattern: Right-Angled Triangle", "Pattern: Horizontal Star Groups", "Pattern: Decreasing Number Row", "Pattern: Left Staircase",
  "Pattern: Inverted Triangle", "Pattern: Hollow Rectangle", "Pattern: Number Pyramids", "Pattern: Alternating Binary", "Pattern: Letter Diamond Border",
  "Pattern: Symmetric Diamond", "Pattern: Pascal Triangle Rows", "Pattern: Hollow Diamond Outline", "Pattern: Spiral Matrix Pattern", "Pattern: Zigzag Star Border",
  // Functions
  "Value Swapper Function", "Square of a Number Function", "Centigrade to Fahrenheit", "Area of Circle Calculator", "Maximum of Two Numbers",
  "Calculate nPr and nCr", "Check Prime Function wrapper", "Array Average Function", "GCD and LCM dual output", "Compound Interest Function",
  "Chained Function Calculator", "Matrix Transpose Function", "String Palindrome Helper", "Prime Factorization Array", "Custom Array Sort Helper",
  // Recursion
  "Recursive Factorial", "Recursive Sum of N Numbers", "Recursive Print 1 to N", "Recursive Power Calculation", "Recursive Digit Sum",
  "Recursive String Reversal", "Recursive Binary Search", "Recursive Fibonacci Number", "Recursive GCD Calculator", "Recursive Array Elements",
  "Tower of Hanoi Steps", "Recursive Permutations", "Recursive Subset Sum", "Recursive Binary Builder", "Recursive Maze Solver"
].map(t => t.trim());

// Original Leetcode base list (95 titles)
const baseLeetCodeTitles = [
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
  "Length of Last Word", "Spiral Matrix II", "Unique Paths", "Unique Paths II", "Minimum Path Sum",
  "Valid Number", "Plus One", "Text Justification", "Sqrt(x)", "Climbing Stairs",
  "Simplify Path", "Edit Distance", "Set Matrix Zeroes", "Search a 2D Matrix", "Sort Colors",
  "Minimum Window Substring", "Combinations", "Subsets", "Word Search", "Remove Duplicates from Sorted List II",
  "Remove Duplicates from Sorted List", "Largest Rectangle in Histogram", "Maximal Rectangle", "Partition List",
  "Scramble String", "Merge Sorted Array", "Gray Code", "Subsets II", "Decode Ways",
  "Reverse Linked List II", "Restore IP Addresses", "Binary Tree Inorder Traversal", "Unique Binary Search Trees II",
  "Unique Binary Search Trees", "Interleaving String", "Validate Binary Search Tree", "Recover Binary Search Tree",
  "Same Tree", "Symmetric Tree", "Binary Tree Level Order Traversal"
].map(t => t.trim());

// Original DB titles
const originalDbTitles = [
  'Reverse a String',
  'Prime Number Check',
  'Check for Anagrams',
  'Find the Middle of Linked List',
  'Implement Stack using Queues',
  'Two Sum Problem'
].map(t => t.trim());

async function runRecoveryFirst() {
  try {
    console.log('Running recovery-first data audit...');

    // 1. Recover titles from Striver A2Z JSON
    const striverPath = path.join(__dirname, 'prisma', 'striver_a2z.json');
    const striverData = JSON.parse(fs.readFileSync(striverPath, 'utf8'));
    const striverTitlesList = [];
    striverData.forEach(step => {
      step.subcategories.forEach(sub => {
        sub.problems.forEach(p => {
          striverTitlesList.push(p.problem_name.trim());
        });
      });
    });
    const striverTitlesUnique = Array.from(new Set(striverTitlesList));

    // 2. Load other sources
    const fxDbTitlesUnique = Array.from(new Set(originalDbTitles));
    const fxBasicTitlesUnique = Array.from(new Set(basicSyntaxTitles));
    const fxLcTitlesUnique = Array.from(new Set(baseLeetCodeTitles));

    // 3. Load active PostgreSQL database problems
    const dbProblems = await prisma.problem.findMany({
      include: { topics: true }
    });
    const pgTitles = dbProblems.map(p => p.title.trim());
    const pgTitlesUnique = Array.from(new Set(pgTitles));

    // Inventory of all unique titles across sources
    const allUniqueRecoveredTitles = Array.from(new Set([
      ...striverTitlesUnique,
      ...fxDbTitlesUnique,
      ...fxBasicTitlesUnique,
      ...fxLcTitlesUnique
    ])).sort();

    // Find duplicates/overlaps between sources
    const striverSet = new Set(striverTitlesUnique);
    const fxDbSet = new Set(fxDbTitlesUnique);
    const fxBasicSet = new Set(fxBasicTitlesUnique);
    const fxLcSet = new Set(fxLcTitlesUnique);
    const pgSet = new Set(pgTitlesUnique);

    // Overlap details
    const overlapList = [];
    allUniqueRecoveredTitles.forEach(t => {
      const sources = [];
      if (striverSet.has(t)) sources.push('Striver');
      if (fxDbSet.has(t)) sources.push('JavaFX DB');
      if (fxBasicSet.has(t)) sources.push('JavaFX Basic');
      if (fxLcSet.has(t)) sources.push('JavaFX LC Base');
      if (sources.length > 1) {
        overlapList.push({ title: t, sources });
      }
    });

    // Missing titles (canonical ones not matching exactly in PG, ignoring casing/punctuation for overlap checks)
    const missingTitles = [];
    allUniqueRecoveredTitles.forEach(t => {
      const existsExact = pgSet.has(t);
      const existsCaseInsensitive = dbProblems.some(p => p.title.trim().toLowerCase() === t.toLowerCase());
      if (!existsExact) {
        missingTitles.push({
          title: t,
          caseInsensitiveMatch: existsCaseInsensitive ? dbProblems.find(p => p.title.trim().toLowerCase() === t.toLowerCase()).title : 'None'
        });
      }
    });

    // Phase 2 Classification of canonical unique recovered titles
    const classifiedInventory = allUniqueRecoveredTitles.map(t => {
      let classification = 'LeetCode';
      if (striverSet.has(t)) {
        classification = 'Striver';
      } else if (fxBasicSet.has(t)) {
        classification = 'Basic Syntax';
      } else if (fxDbSet.has(t)) {
        classification = 'Custom JavaFX';
      }
      return { title: t, classification };
    });

    // Phase 3 Scan active PG DB for issues
    const issuesReport = {
      placeholderDescriptions: [],
      incorrectSampleInputs: [],
      incorrectSampleOutputs: [],
      genericTemplates: [],
      duplicateClones: []
    };

    dbProblems.forEach(p => {
      const title = p.title.trim();
      const statement = p.problemStatement ? p.problemStatement.trim() : '';
      const input = p.sampleInput ? p.sampleInput.trim() : '';
      const output = p.sampleOutput ? p.sampleOutput.trim() : '';
      const template = p.codeTemplate ? p.codeTemplate.trim() : '';

      const isPattern = title.toLowerCase().includes('pattern') || p.topics.some(t => t.name.toLowerCase() === 'patterns');
      const isBasicSyntax = p.topics.some(t => t.name.toLowerCase() === 'basic syntax' || t.name.toLowerCase() === 'control flow' || t.name.toLowerCase() === 'loops');

      // 1. Placeholder Descriptions
      if (statement.includes('premium LeetCode coding challenge') || statement.includes('premium leetcode') || statement.includes('This is a coding challenge for') || statement.includes('Solve the challenge for')) {
        issuesReport.placeholderDescriptions.push({ id: p.id, title, statement: statement.substring(0, 100) + '...' });
      }

      // 2. Incorrect Sample Inputs
      if (input.includes('Input parameter') || input.includes('Input data for') || input.includes('Input choice') || input.includes('Refer to editorial')) {
        issuesReport.incorrectSampleInputs.push({ id: p.id, title, input });
      }
      else if ((isPattern || isBasicSyntax) && (input.includes('nums =') || input.includes('[1, 2, 3') || input.includes('prices =') || input.includes('matrix =') || input.includes('head ='))) {
        issuesReport.incorrectSampleInputs.push({ id: p.id, title, input, reason: 'Array fallback in pattern/syntax' });
      }

      // 3. Incorrect Sample Outputs
      if (output.includes('Expected output') || output.includes('Decision outcome') || output.includes('Calculated result') || output.includes('Refer to editorial')) {
        issuesReport.incorrectSampleOutputs.push({ id: p.id, title, output });
      }
      else if ((isPattern || isBasicSyntax) && (output.includes('[1, 2, 3') || output.includes('[0, 0, 1') || output.includes('Explanation:'))) {
        issuesReport.incorrectSampleOutputs.push({ id: p.id, title, output, reason: 'Array fallback in pattern/syntax' });
      }

      // 4. Generic Templates
      if (template.includes('// Write your solution method here') || template.includes('public int solve(int[] nums) {\n        // Write your solution here\n        return 0;\n    }')) {
        if (!title.toLowerCase().includes('two sum') && !title.toLowerCase().includes('hashing') && !title.toLowerCase().includes('subsequences')) {
          issuesReport.genericTemplates.push({ id: p.id, title, template: template.substring(0, 80) + '...' });
        }
      }

      // 5. Duplicate Clones
      if (/\s+\d+$/.test(title) && !title.toLowerCase().includes('ii') && !title.toLowerCase().includes('iii') && !title.toLowerCase().includes('iv')) {
        issuesReport.duplicateClones.push({ id: p.id, title });
      }
    });

    const finalReport = {
      phase1: {
        totalScanCount: striverTitlesList.length + originalDbTitles.length + basicSyntaxTitles.length + baseLeetCodeTitles.length,
        uniqueCount: allUniqueRecoveredTitles.length,
        overlapsCount: overlapList.length,
        overlapsList: overlapList,
        missingCount: missingTitles.length,
        missingList: missingTitles,
        allTitles: allUniqueRecoveredTitles
      },
      phase2: {
        classifiedCount: classifiedInventory.length,
        classifiedList: classifiedInventory
      },
      phase3: {
        placeholderDescriptionsCount: issuesReport.placeholderDescriptions.length,
        placeholderDescriptionsSample: issuesReport.placeholderDescriptions,
        incorrectSampleInputsCount: issuesReport.incorrectSampleInputs.length,
        incorrectSampleInputsSample: issuesReport.incorrectSampleInputs,
        incorrectSampleOutputsCount: issuesReport.incorrectSampleOutputs.length,
        incorrectSampleOutputsSample: issuesReport.incorrectSampleOutputs,
        genericTemplatesCount: issuesReport.genericTemplates.length,
        genericTemplatesSample: issuesReport.genericTemplates,
        duplicateClonesCount: issuesReport.duplicateClones.length,
        duplicateClonesSample: issuesReport.duplicateClones
      }
    };

    fs.writeFileSync(
      path.join(__dirname, 'recovery_audit_report.json'),
      JSON.stringify(finalReport, null, 2)
    );
    console.log('Successfully wrote recovery_audit_report.json');

  } catch (err) {
    console.error('Error running recovery-first audit:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runRecoveryFirst();
