const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runRecovery() {
  try {
    console.log('=== STARTING TITLE RECOVERY ANALYSIS ===');

    // 1. Striver A2Z Source
    const striverPath = path.join(__dirname, 'prisma', 'striver_a2z.json');
    const striverData = JSON.parse(fs.readFileSync(striverPath, 'utf8'));
    const striverTitles = new Set();
    striverData.forEach(step => {
      step.subcategories.forEach(sub => {
        sub.problems.forEach(p => {
          striverTitles.add(p.problem_name.trim());
        });
      });
    });
    console.log(`Loaded ${striverTitles.size} unique titles from Striver A2Z Source.`);

    // 2. Original JavaFX database (extracted from database.sql)
    const originalDbTitles = new Set([
      'Reverse a String',
      'Prime Number Check',
      'Check for Anagrams',
      'Find the Middle of Linked List',
      'Implement Stack using Queues',
      'Two Sum Problem'
    ]);
    console.log(`Loaded ${originalDbTitles.size} titles from original JavaFX database schema.`);

    // 3. Original JavaFX basic syntax generated lists (105 questions)
    const challenge_titles = [
      // If-Else
      ["Even or Odd Classifier", "Positive, Negative or Zero", "Minimum of Two Numbers", "Voting Eligibility Checker", "Pass or Fail Status",
       "Leap Year Calculator", "Triangle Classification by Sides", "Quadrant Finder of a Point", "Find Largest of Three Numbers", "Electricity Bill Calculator",
       "Student Grade Classifier", "Tax Bracket Calculator", "Date Validity Checker", "Quadratic Equation Roots", "Employee Salary Calculator"],
      // Switch Case
      ["Weekday Selector", "Month Name Selector", "Arithmetic Operator Selector", "Grade Comment Selector", "Traffic Light Selector",
       "Season of the Year Finder", "Vowel or Consonant Checker", "Conversion Unit Selector", "Bank Transaction Menu", "Pizza Topping Price Calculator",
       "Custom Command Interpreter", "Roman Numeral Switch Parser", "Morse Code Character Converter", "Multi-Level ATM Menu Flow", "Nested Config Selector"],
      // For Loops
      ["Sum of First N Numbers", "Print Even Numbers to N", "Calculate Nth Power", "Factorial Finder", "Print Multiplication Table",
       "Count Prime Numbers in Range", "Check if a Number is Perfect", "Sum of Arithmetic Progression", "Find GCD of Two Numbers", "Print N Terms of Custom Series",
       "Find All Perfect Numbers", "Print Prime Factors", "Find LCM of N Numbers", "Sum of Divisors up to N", "Taylor Series of sin(x)"],
      // While Loops
      ["Digit Counter", "Sum of Digits of a Number", "First and Last Digit Finder", "Validate Input until Positive", "Count Multiples below Target",
       "Reverse Integer Digits", "Decimal to Binary Converter", "Check Armstrong Number", "GCD Euclidean subtraction", "Generate Fibonacci below N",
       "Collatz Conjecture Steps", "Binary to Hexadecimal", "Largest Digit in Large Integer", "Happy Number Checker", "Run-Length Digit Encoding"],
      // Pattern Printing
      ["Pattern: Square Star Block", "Pattern: Right-Angled Triangle", "Pattern: Horizontal Star Groups", "Pattern: Decreasing Number Row", "Pattern: Left Staircase",
       "Pattern: Inverted Triangle", "Pattern: Hollow Rectangle", "Pattern: Number Pyramids", "Pattern: Alternating Binary", "Pattern: Letter Diamond Border",
       "Pattern: Symmetric Diamond", "Pattern: Pascal Triangle Rows", "Pattern: Hollow Diamond Outline", "Pattern: Spiral Matrix Pattern", "Pattern: Zigzag Star Border"],
      // Functions
      ["Value Swapper Function", "Square of a Number Function", "Centigrade to Fahrenheit", "Area of Circle Calculator", "Maximum of Two Numbers",
       "Calculate nPr and nCr", "Check Prime Function wrapper", "Array Average Function", "GCD and LCM dual output", "Compound Interest Function",
       "Chained Function Calculator", "Matrix Transpose Function", "String Palindrome Helper", "Prime Factorization Array", "Custom Array Sort Helper"],
      // Recursion
      ["Recursive Factorial", "Recursive Sum of N Numbers", "Recursive Print 1 to N", "Recursive Power Calculation", "Recursive Digit Sum",
       "Recursive String Reversal", "Recursive Binary Search", "Recursive Fibonacci Number", "Recursive GCD Calculator", "Recursive Array Elements",
       "Tower of Hanoi Steps", "Recursive Permutations", "Recursive Subset Sum", "Recursive Binary Builder", "Recursive Maze Solver"]
    ].flat();
    const basicSyntaxTitles = new Set(challenge_titles.map(t => t.trim()));
    console.log(`Loaded ${basicSyntaxTitles.size} titles from original JavaFX basic syntax lists.`);

    // 4. Original JavaFX LeetCode base list (96 titles)
    const baseLeetCodeTitles = new Set([
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
    ].map(t => t.trim()));
    console.log(`Loaded ${baseLeetCodeTitles.size} unique LeetCode titles from SessionManager base list.`);

    // 5. Existing PostgreSQL database titles
    const dbProblems = await prisma.problem.findMany({
      select: { title: true }
    });
    const postgresTitles = new Set(dbProblems.map(p => p.title.trim()));
    console.log(`Loaded ${postgresTitles.size} titles from the current active PostgreSQL database.`);

    // --- PRIORITY 1: TITLE RECOVERY STATISTICS ---
    const allUniqueRecoveredTitles = new Set([
      ...striverTitles,
      ...originalDbTitles,
      ...basicSyntaxTitles,
      ...baseLeetCodeTitles
    ]);

    console.log('\n=== PRIORITY 1: TITLE RECOVERY REPORT ===');
    console.log(`Total Source Titles (Striver + FX DB + FX Basic + FX LC): ${striverTitles.size + originalDbTitles.size + basicSyntaxTitles.size + baseLeetCodeTitles.size}`);
    console.log(`Unique Recovered Titles (Canonical): ${allUniqueRecoveredTitles.size}`);

    // Analyze duplicates between sources
    // E.g. overlap between Striver and Leetcode
    const overlapStriverLC = [...striverTitles].filter(x => baseLeetCodeTitles.has(x));
    console.log(`Overlap between Striver and LeetCode base list: ${overlapStriverLC.length} titles.`);

    // Missing titles (in original sources but missing in active PG)
    const missingInPG = [...allUniqueRecoveredTitles].filter(x => !postgresTitles.has(x));
    console.log(`Canonical titles missing from current PostgreSQL: ${missingInPG.length}`);
    if (missingInPG.length > 0) {
      console.log('List of missing titles:', missingInPG);
    }

    // --- PRIORITY 2: REMOVE GENERATED CLONES STATISTICS ---
    // A generated clone title matches "/\s+\d+$/" and its base is in baseLeetCodeTitles.
    const cloneTitlesInPG = [...postgresTitles].filter(title => {
      if (/\s+\d+$/.test(title) && !title.toLowerCase().includes('ii') && !title.toLowerCase().includes('iii') && !title.toLowerCase().includes('iv')) {
        const baseTitle = title.replace(/\s+\d+$/, '').trim();
        return baseLeetCodeTitles.has(baseTitle) || striverTitles.has(baseTitle);
      }
      return false;
    });

    console.log('\n=== PRIORITY 2: DUPLICATE-CLEANUP REPORT ===');
    console.log(`Total Generated Clone Titles identified in active database: ${cloneTitlesInPG.length}`);
    console.log(`Sample of Clone Titles to be REMOVED (top 15):`);
    cloneTitlesInPG.slice(0, 15).forEach(c => console.log(`  - "${c}"`));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

runRecovery();
