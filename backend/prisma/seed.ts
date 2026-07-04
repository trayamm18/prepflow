import { PrismaClient, ProblemDifficulty, MCQDifficulty } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

import mcqsData from './mcqs.json';
import striverA2ZData from './striver_a2z.json';
import striverEnrichedData from './striver_enriched_questions.json';

const prisma = new PrismaClient();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Simulated titles array from JavaFX SessionManager
const titles = [
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
  "Unique Binary Search Trees", "Interleaving String", "Validate Binary Search Tree",
  "Recover Binary Search Tree", "Same Tree", "Symmetric Tree", "Binary Tree Level Order Traversal"
];

// Replicate JavaFX question enrichment logic
interface SeedProblem {
  title: string;
  category: string;
  difficulty: ProblemDifficulty;
  problemStatement: string;
  sampleInput: string;
  sampleOutput: string;
  hint1: string | null;
  hint2: string | null;
  codeTemplate: string;
  isStriverSheet: boolean;
  striverStep?: string | null;
  striverTopic?: string | null;
  javafxId?: number;
  striverId?: string;
  topics: string[];
  companies: string[];
}

function enrichJavaFXProblem(title: string, id: number, difficulty: ProblemDifficulty, category: string): SeedProblem {
  const normTitle = title.toLowerCase().replaceAll(/\s+\d+$/g, "").trim();
  const problem: SeedProblem = {
    title,
    category,
    difficulty,
    problemStatement: "",
    sampleInput: "",
    sampleOutput: "",
    hint1: null,
    hint2: null,
    codeTemplate: "",
    isStriverSheet: false,
    javafxId: id,
    topics: [],
    companies: []
  };

  // 1. Specific Leetcode/Striver questions
  if (normTitle.includes("two sum")) {
    problem.problemStatement = "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.";
    problem.sampleInput = "nums = [2,7,11,15], target = 9";
    problem.sampleOutput = "[0,1]\nExplanation: nums[0] + nums[1] == 9.";
    problem.hint1 = "A brute force approach is O(N^2). Can we do better using a Hash Map?";
    problem.hint2 = "Store target - nums[i] as you iterate.";
    problem.codeTemplate = "public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write code here\n        return new int[0];\n    }\n}";
    problem.topics = ["Arrays", "Hashing"];
  } else if (normTitle.includes("palindrome number")) {
    problem.problemStatement = "Given an integer x, return true if x is a palindrome, and false otherwise.";
    problem.sampleInput = "x = 121";
    problem.sampleOutput = "true";
    problem.hint1 = "Negative numbers cannot be palindromes.";
    problem.hint2 = "Can you solve it without converting the integer to a string? Try reversing the second half of the number.";
    problem.codeTemplate = "public class Solution {\n    public boolean isPalindrome(int x) {\n        return false;\n    }\n}";
    problem.topics = ["Math"];
  } else if (normTitle.includes("valid parentheses")) {
    problem.problemStatement = "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.";
    problem.sampleInput = "s = \"()[]{}\"";
    problem.sampleOutput = "true";
    problem.hint1 = "Use a Stack.";
    problem.hint2 = "Match closing brackets with popped opening brackets.";
    problem.codeTemplate = "public class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}";
    problem.topics = ["Stack", "Strings"];
  } else if (normTitle.includes("reverse integer") || normTitle.includes("reverse a number")) {
    problem.problemStatement = "Given a signed 32-bit integer x, return x with its digits reversed. If reversing x causes the value to go outside the signed 32-bit integer range, return 0.";
    problem.sampleInput = "x = 123";
    problem.sampleOutput = "321";
    problem.hint1 = "Extract digits one by one using mod 10.";
    problem.hint2 = "Check for overflow before multiplying by 10.";
    problem.codeTemplate = "public class Solution {\n    public int reverse(int x) {\n        return 0;\n    }\n}";
    problem.topics = ["Math"];
  } else if (normTitle.includes("maximum subarray") || normTitle.includes("kadane's algorithm") || normTitle.includes("maximum subarray sum")) {
    problem.problemStatement = "Given an integer array nums, find the subarray with the largest sum, and return its sum.";
    problem.sampleInput = "nums = [-2,1,-3,4,-1,2,1,-5,4]";
    problem.sampleOutput = "6\nExplanation: [4,-1,2,1] has the largest sum.";
    problem.hint1 = "Kadane's Algorithm.";
    problem.hint2 = "Reset current sum if it becomes negative.";
    problem.codeTemplate = "public class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}";
    problem.topics = ["Arrays", "Dynamic Programming"];
  } else if (normTitle.includes("stock buy and sell") || normTitle.includes("best time to buy and sell stock")) {
    problem.problemStatement = "Find the maximum profit you can achieve from buying and selling a stock on different days.";
    problem.sampleInput = "prices = [7,1,5,3,6,4]";
    problem.sampleOutput = "5";
    problem.hint1 = "Keep track of the minimum price seen so far.";
    problem.hint2 = "Calculate potential profit at each day.";
    problem.codeTemplate = "public class Solution {\n    public int maxProfit(int[] prices) {\n        return 0;\n    }\n}";
    problem.topics = ["Arrays"];
  } else if (normTitle.includes("sort colors") || normTitle.includes("sort an array of 0's 1's and 2's")) {
    problem.problemStatement = "Given an array nums with n objects colored red, white, or blue, sort them in-place in the order red, white, and blue (represented by 0, 1, and 2).";
    problem.sampleInput = "nums = [2,0,2,1,1,0]";
    problem.sampleOutput = "[0,0,1,1,2,2]";
    problem.hint1 = "Dutch National Flag algorithm.";
    problem.hint2 = "Use three pointers: low, mid, high.";
    problem.codeTemplate = "public class Solution {\n    public void sortColors(int[] nums) {\n        // In-place sort\n    }\n}";
    problem.topics = ["Arrays", "Sorting"];
  } else if (normTitle.includes("binary search") || normTitle.includes("search x in sorted array")) {
    problem.problemStatement = "Given a sorted array of integers and a target, search target in the array. Return index or -1.";
    problem.sampleInput = "nums = [-1,0,3,5,9,12], target = 9";
    problem.sampleOutput = "4";
    problem.hint1 = "Use left and right pointers.";
    problem.hint2 = "Calculate middle index at each step.";
    problem.codeTemplate = "public class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}";
    problem.topics = ["Arrays", "Sorting"];
  } else if (normTitle.includes("reverse linked list")) {
    problem.problemStatement = "Given the head of a singly linked list, reverse the list, and return the reversed list.";
    problem.sampleInput = "head = [1,2,3,4,5]";
    problem.sampleOutput = "[5,4,3,2,1]";
    problem.hint1 = "Iterative: maintain prev, curr, next pointers.";
    problem.hint2 = "Update links in-place.";
    problem.codeTemplate = "public class Solution {\n    public ListNode reverseList(ListNode head) {\n        return null;\n    }\n}";
    problem.topics = ["Linked List"];
  } else if (normTitle.includes("climbing stairs")) {
    problem.problemStatement = "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. How many distinct ways can you climb to the top?";
    problem.sampleInput = "n = 3";
    problem.sampleOutput = "3";
    problem.hint1 = "To reach step n, you must come from n-1 or n-2.";
    problem.hint2 = "Fibonacci sequence relation.";
    problem.codeTemplate = "public class Solution {\n    public int climbStairs(int n) {\n        return 0;\n    }\n}";
    problem.topics = ["Dynamic Programming", "Math"];
  } else if (normTitle.includes("check for prime") || normTitle.includes("check prime") || normTitle.includes("prime number")) {
    problem.problemStatement = "Check if a given number N is a prime number. A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.";
    problem.sampleInput = "N = 11";
    problem.sampleOutput = "true";
    problem.hint1 = "Check divisors from 2 up to sqrt(N).";
    problem.hint2 = "If any divisor is found, it is not prime.";
    problem.codeTemplate = "public class Solution {\n    public boolean isPrime(int n) {\n        return false;\n    }\n}";
    problem.topics = ["Math"];
  } else if (normTitle.includes("gcd")) {
    problem.problemStatement = "Given two integers A and B, find their Greatest Common Divisor (GCD).";
    problem.sampleInput = "A = 20, B = 15";
    problem.sampleOutput = "5";
    problem.hint1 = "Use the Euclidean algorithm (subtraction or modulo).";
    problem.hint2 = "Repeatedly apply division: gcd(a, b) = gcd(b, a % b).";
    problem.codeTemplate = "public class Solution {\n    public int findGCD(int a, int b) {\n        return 1;\n    }\n}";
    problem.topics = ["Math"];
  } else if (normTitle.includes("armstrong")) {
    problem.problemStatement = "Check if a given number N is an Armstrong number (an n-digit number that is equal to the sum of its digits each raised to the power of n).";
    problem.sampleInput = "N = 371";
    problem.sampleOutput = "true";
    problem.hint1 = "Extract each digit, count total digits, and compute the sum of powers.";
    problem.hint2 = "Compare computed sum with original number.";
    problem.codeTemplate = "public class Solution {\n    public boolean isArmstrong(int n) {\n        return false;\n    }\n}";
    problem.topics = ["Math"];
  } else if (normTitle.includes("divisors")) {
    problem.problemStatement = "Find all positive divisors of a given integer N in ascending order.";
    problem.sampleInput = "N = 12";
    problem.sampleOutput = "[1, 2, 3, 4, 6, 12]";
    problem.hint1 = "You can loop from 1 to N.";
    problem.hint2 = "Optimize by searching up to sqrt(N) and adding both i and N/i.";
    problem.codeTemplate = "public class Solution {\n    public int[] printDivisors(int n) {\n        return new int[0];\n    }\n}";
    problem.topics = ["Math"];
  } else if (normTitle.includes("count digits") || normTitle.includes("count all digits")) {
    problem.problemStatement = "Given an integer N, return the number of digits in it.";
    problem.sampleInput = "N = 12345";
    problem.sampleOutput = "5";
    problem.hint1 = "Repeatedly divide N by 10 until it becomes 0.";
    problem.hint2 = "Alternatively, use Math.log10(N) + 1.";
    problem.codeTemplate = "public class Solution {\n    public int countDigits(int n) {\n        return 0;\n    }\n}";
    problem.topics = ["Math"];
  } else if (normTitle.includes("reverse an array") || normTitle.includes("reverse array")) {
    problem.problemStatement = "Given an array of integers arr, reverse the array in-place.";
    problem.sampleInput = "arr = [1, 2, 3, 4, 5]";
    problem.sampleOutput = "[5, 4, 3, 2, 1]";
    problem.hint1 = "Use two pointers: left at start, right at end.";
    problem.hint2 = "Swap element at left and right, then move pointers closer.";
    problem.codeTemplate = "public class Solution {\n    public void reverseArray(int[] arr) {\n        // Reverse in-place\n    }\n}";
    problem.topics = ["Arrays"];
  } else if (normTitle.includes("check if string is palindrome") || normTitle.includes("palindrome string") || normTitle.includes("valid palindrome")) {
    problem.problemStatement = "Check if a given string s is a palindrome, considering only alphanumeric characters and ignoring cases.";
    problem.sampleInput = "s = \"A man, a plan, a canal: Panama\"";
    problem.sampleOutput = "true";
    problem.hint1 = "Use two pointers starting at both ends of the string.";
    problem.hint2 = "Skip non-alphanumeric characters.";
    problem.codeTemplate = "public class Solution {\n    public boolean isPalindrome(String s) {\n        return false;\n    }\n}";
    problem.topics = ["Strings"];
  } else if (normTitle.includes("fibonacci")) {
    problem.problemStatement = "Find the N-th Fibonacci number. F(0)=0, F(1)=1, F(N)=F(N-1)+F(N-2).";
    problem.sampleInput = "N = 4";
    problem.sampleOutput = "3";
    problem.hint1 = "Use recursion or simple loops.";
    problem.hint2 = "Optimize space to O(1) using variables.";
    problem.codeTemplate = "public class Solution {\n    public int fib(int n) {\n        return 0;\n    }\n}";
    problem.topics = ["Recursion", "Math"];
  } else if (normTitle.includes("majority element-ii")) {
    problem.problemStatement = "Given an integer array nums of size n, return all elements that appear more than floor(n/3) times.";
    problem.sampleInput = "nums = [3,2,3]";
    problem.sampleOutput = "[3]";
    problem.hint1 = "Use Boyer-Moore Majority Vote algorithm extended for two candidates.";
    problem.hint2 = "Validate candidates in a second pass.";
    problem.codeTemplate = "public class Solution {\n    public List<Integer> majorityElement(int[] nums) {\n        return new ArrayList<>();\n    }\n}";
    problem.topics = ["Arrays"];
  } else if (normTitle.includes("majority element")) {
    problem.problemStatement = "Given an array nums of size n, return the majority element which appears more than floor(n/2) times.";
    problem.sampleInput = "nums = [3,2,3]";
    problem.sampleOutput = "3";
    problem.hint1 = "Use Boyer-Moore Voting algorithm.";
    problem.hint2 = "Count occurrences to confirm.";
    problem.codeTemplate = "public class Solution {\n    public int majorityElement(int[] nums) {\n        return 0;\n    }\n}";
    problem.topics = ["Arrays"];
  }

  // 2. Programmatic generic generator for basic syntax challenges (10000 - 11000)
  else if (id >= 10000 && id < 11000) {
    problem.topics = ["Basic Syntax"];
    if (title.includes("Selector") || title.includes("Calculator") || title.includes("Interpreter") || title.includes("Converter") || title.includes("Parser") || title.includes("Menu")) {
      problem.topics.push("Control Flow");
      problem.problemStatement = "Implement a selector/calculator system using a Switch Case statement in Java for '" + title + "'. Ensure you handle default cases properly.";
      problem.sampleInput = "Input choice / parameter for " + title;
      problem.sampleOutput = "Calculated result or selection for " + title;
      problem.hint1 = "Use Java's switch statement.";
      problem.hint2 = "Don't forget the 'break' statement to prevent fall-through!";
      problem.codeTemplate = "public class Solution {\n    public String handleSelection(int choice) {\n        // Write switch-case block here\n        return \"\";\n    }\n}";
    } else if (title.includes("Pattern:")) {
      problem.topics.push("Patterns");
      problem.problemStatement = "Write a program to print the following geometric pattern using nested loops: '" + title + "'. Output a single String representing the printed grid.";
      problem.sampleInput = "N = 4";
      problem.sampleOutput = "Printed pattern for " + title;
      problem.hint1 = "Use nested for loops.";
      problem.hint2 = "The outer loop handles rows, while the inner loop handles columns or characters.";
      problem.codeTemplate = "public class Solution {\n    public String printPattern(int n) {\n        StringBuilder sb = new StringBuilder();\n        // Write nested loops\n        return sb.toString();\n    }\n}";
    } else if (title.includes("Recursive") || title.includes("Recursion") || title.includes("Tower of Hanoi") || title.includes("Maze Solver")) {
      problem.topics.push("Recursion");
      problem.problemStatement = "Solve '" + title + "' using a recursive approach in Java. Ensure you define a correct base case to prevent stack overflow.";
      problem.sampleInput = "Input value N for recursion";
      problem.sampleOutput = "Recursive result for " + title;
      problem.hint1 = "Define your base case first.";
      problem.hint2 = "Break the problem down into a smaller sub-problem and make a recursive call.";
      problem.codeTemplate = "public class Solution {\n    public int solveRecursive(int n) {\n        // Define base case and recursive call\n        return 0;\n    }\n}";
    } else if (title.includes("Loop") || title.includes("Counter") || title.includes("Sum of") || title.includes("Prime") || title.includes("Perfect") || title.includes("GCD") || title.includes("LCM")) {
      problem.topics.push("Loops");
      problem.problemStatement = "Write an algorithm to solve '" + title + "' using a loop (for/while) in Java.";
      problem.sampleInput = "Input value N";
      problem.sampleOutput = "Calculated result for " + title;
      problem.hint1 = "Use a for or while loop.";
      problem.hint2 = "Maintain accumulator or state variable inside the loop.";
      problem.codeTemplate = "public class Solution {\n    public int computeValue(int n) {\n        // Write loop here\n        return 0;\n    }\n}";
    } else if (title.includes("Function") || title.includes("Calculator") || title.includes("Helper") || title.includes("Swapper") || title.includes("Average")) {
      problem.topics.push("Functions");
      problem.problemStatement = "Implement a reusable function/method in Java to solve '" + title + "'. Focus on passing arguments correctly and returning the appropriate data type.";
      problem.sampleInput = "Parameters for " + title;
      problem.sampleOutput = "Return value for " + title;
      problem.hint1 = "Define clear method parameters.";
      problem.hint2 = "Ensure correct return statement.";
      problem.codeTemplate = "public class Solution {\n    public double performHelperCalculation(double val) {\n        // Write logic here\n        return 0.0;\n    }\n}";
    } else {
      problem.topics.push("Control Flow");
      problem.problemStatement = "Solve the decision-making coding challenge: '" + title + "' using conditional statements (if-else) in Java.";
      problem.sampleInput = "Input parameter";
      problem.sampleOutput = "Decision outcome";
      problem.hint1 = "Use if-else statements.";
      problem.hint2 = "Analyze multiple conditions carefully.";
      problem.codeTemplate = "public class Solution {\n    public String makeDecision(int value) {\n        // Write if-else block here\n        return \"\";\n    }\n}";
    }
  }

  // 3. Generic simulated questions fallback
  else {
    problem.topics = ["Arrays"];
    problem.problemStatement = "This is a premium LeetCode coding challenge (" + title + "). Build an efficient algorithm in Java. Ensure your solution complies with the time and space complexity requirements.";
    problem.sampleInput = "Input data for " + title;
    problem.sampleOutput = "Expected output for " + title;
    problem.hint1 = "Think about reducing complexity to O(N log N) or O(N).";
    problem.hint2 = "Utilize appropriate data structures (e.g. Map, Set, or Stack).";
    problem.codeTemplate = "public class Solution {\n    // Write your solution method here\n}";
  }

  return problem;
}

// Generate the full list of 1005 questions
function generateJavaFXQuestions(): SeedProblem[] {
  const db_questions: SeedProblem[] = [
    {
      title: "Reverse a String",
      category: "Java",
      difficulty: ProblemDifficulty.EASY,
      problemStatement: "Write a Java method `reverseString(String str)` that takes a string as input and returns it reversed. Do NOT use built-in library functions such as `StringBuilder.reverse()`. The method must process characters manually.",
      sampleInput: "hello",
      sampleOutput: "olleh",
      hint1: "Convert the input String into a character array using str.toCharArray().",
      hint2: "Use a loop with two pointers (one at the start and one at the end) swapping characters until they meet in the middle.",
      codeTemplate: "public class Solution {\n    public String reverseString(String str) {\n        // Write your solution here\n        return \"\";\n    }\n}",
      isStriverSheet: false,
      javafxId: 1,
      topics: ["Strings"],
      companies: []
    },
    {
      title: "Find the Middle of Linked List",
      category: "DSA",
      difficulty: ProblemDifficulty.EASY,
      problemStatement: "Given the head of a singly linked list, find and return the middle node. If there are two middle nodes, return the second middle node.",
      sampleInput: "1 -> 2 -> 3 -> 4 -> 5",
      sampleOutput: "Node with value 3",
      hint1: "Use the two-pointer approach, also known as the Hare and Tortoise algorithm.",
      hint2: "Move one pointer by one step and the other by two steps.",
      codeTemplate: "public class Solution {\n    public ListNode findMiddle(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}",
      isStriverSheet: false,
      javafxId: 2,
      topics: ["Linked List"],
      companies: []
    }
  ];

  const basic_syntax_topics = ["If-Else", "Switch Case", "For Loops", "While Loops", "Pattern Printing", "Functions", "Recursion"];
  const challenge_titles = [
    [
      ["Even or Odd Classifier", "Positive, Negative or Zero", "Minimum of Two Numbers", "Voting Eligibility Checker", "Pass or Fail Status"],
      ["Leap Year Calculator", "Triangle Classification by Sides", "Quadrant Finder of a Point", "Find Largest of Three Numbers", "Electricity Bill Calculator"],
      ["Student Grade Classifier", "Tax Bracket Calculator", "Date Validity Checker", "Quadratic Equation Roots", "Employee Salary Calculator"]
    ],
    [
      ["Weekday Selector", "Month Name Selector", "Arithmetic Operator Selector", "Grade Comment Selector", "Traffic Light Selector"],
      ["Season of the Year Finder", "Vowel or Consonant Checker", "Conversion Unit Selector", "Bank Transaction Menu", "Pizza Topping Price Calculator"],
      ["Custom Command Interpreter", "Roman Numeral Switch Parser", "Morse Code Character Converter", "Multi-Level ATM Menu Flow", "Nested Config Selector"]
    ],
    [
      ["Sum of First N Numbers", "Print Even Numbers to N", "Calculate Nth Power", "Factorial Finder", "Print Multiplication Table"],
      ["Count Prime Numbers in Range", "Check if a Number is Perfect", "Sum of Arithmetic Progression", "Find GCD of Two Numbers", "Print N Terms of Custom Series"],
      ["Find All Perfect Numbers", "Print Prime Factors", "Find LCM of N Numbers", "Sum of Divisors up to N", "Taylor Series of sin(x)"]
    ],
    [
      ["Digit Counter", "Sum of Digits of a Number", "First and Last Digit Finder", "Validate Input until Positive", "Count Multiples below Target"],
      ["Reverse Integer Digits", "Decimal to Binary Converter", "Check Armstrong Number", "GCD Euclidean subtraction", "Generate Fibonacci below N"],
      ["Collatz Conjecture Steps", "Binary to Hexadecimal", "Largest Digit in Large Integer", "Happy Number Checker", "Run-Length Digit Encoding"]
    ],
    [
      ["Pattern: Square Star Block", "Pattern: Right-Angled Triangle", "Pattern: Horizontal Star Groups", "Pattern: Decreasing Number Row", "Pattern: Left Staircase"],
      ["Pattern: Inverted Triangle", "Pattern: Hollow Rectangle", "Pattern: Number Pyramids", "Pattern: Alternating Binary", "Pattern: Letter Diamond Border"],
      ["Pattern: Symmetric Diamond", "Pattern: Pascal Triangle Rows", "Pattern: Hollow Diamond Outline", "Pattern: Spiral Matrix Pattern", "Pattern: Zigzag Star Border"]
    ],
    [
      ["Value Swapper Function", "Square of a Number Function", "Centigrade to Fahrenheit", "Area of Circle Calculator", "Maximum of Two Numbers"],
      ["Calculate nPr and nCr", "Check Prime Function wrapper", "Array Average Function", "GCD and LCM dual output", "Compound Interest Function"],
      ["Chained Function Calculator", "Matrix Transpose Function", "String Palindrome Helper", "Prime Factorization Array", "Custom Array Sort Helper"]
    ],
    [
      ["Recursive Factorial", "Recursive Sum of N Numbers", "Recursive Print 1 to N", "Recursive Power Calculation", "Recursive Digit Sum"],
      ["Recursive String Reversal", "Recursive Binary Search", "Recursive Fibonacci Number", "Recursive GCD Calculator", "Recursive Array Elements"],
      ["Tower of Hanoi Steps", "Recursive Permutations", "Recursive Subset Sum", "Recursive Binary Builder", "Recursive Maze Solver"]
    ]
  ];

  const basic_questions: SeedProblem[] = [];
  let basicId = 10000;
  for (let t = 0; t < basic_syntax_topics.length; t++) {
    for (let d = 0; d < 3; d++) {
      const difficulty = d === 0 ? ProblemDifficulty.EASY : d === 1 ? ProblemDifficulty.MEDIUM : ProblemDifficulty.HARD;
      for (let q = 0; q < 5; q++) {
        const title = challenge_titles[t][d][q];
        basic_questions.push(enrichJavaFXProblem(title, basicId++, difficulty, "DSA"));
      }
    }
  }

  const simulated_questions: SeedProblem[] = [];
  const javafx_total_target = 1005;
  let current_size = db_questions.length + basic_questions.length;
  let id_val = 7;
  while (current_size < javafx_total_target) {
    const base_title = titles[id_val % titles.length];
    const title = base_title + (id_val > titles.length ? " " + (Math.floor(id_val / titles.length) + 1) : "");
    const category = id_val % 2 === 0 ? "DSA" : "Java";
    const difficulty = id_val % 3 === 0 ? ProblemDifficulty.HARD : id_val % 3 === 1 ? ProblemDifficulty.EASY : ProblemDifficulty.MEDIUM;
    simulated_questions.push(enrichJavaFXProblem(title, id_val, difficulty, category));
    current_size++;
    id_val++;
  }

  return [...db_questions, ...basic_questions, ...simulated_questions];
}

async function main() {
  console.log('Starting migration seed...');

  // Hash passwords
  const userPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // Clear data
  console.log('Clearing database...');
  await prisma.submission.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.problemProgress.deleteMany({});
  await prisma.mockAttempt.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.userSettings.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.problem.deleteMany({});
  await prisma.topic.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.mCQQuestion.deleteMany({});
  console.log('Database cleared.');

  // Create Admin
  const admin = await prisma.admin.create({
    data: {
      email: 'admin@prepflow.com',
      passwordHash: adminPasswordHash,
    },
  });
  console.log('Admin seeded:', admin.email);

  // Create User
  const user = await prisma.user.create({
    data: {
      name: 'Test Student',
      username: 'teststudent',
      email: 'test@gmail.com',
      passwordHash: userPasswordHash,
      settings: {
        create: {
          darkMode: true,
          preferredLanguage: 'Java',
        },
      },
    },
  });
  console.log('Default test user seeded:', user.email);

  // Seed MCQs (143 questions)
  console.log(`Seeding ${mcqsData.length} MCQs...`);
  for (const mcq of mcqsData) {
    let diff: MCQDifficulty = MCQDifficulty.EASY;
    if (mcq.difficulty === 'MEDIUM') diff = MCQDifficulty.MEDIUM;
    if (mcq.difficulty === 'HARD') diff = MCQDifficulty.HARD;

    await prisma.mCQQuestion.create({
      data: {
        category: mcq.category,
        difficulty: diff,
        text: mcq.text,
        optionA: mcq.optionA,
        optionB: mcq.optionB,
        optionC: mcq.optionC,
        optionD: mcq.optionD,
        correctOption: mcq.correctOption,
        explanation: mcq.explanation,
      },
    });
  }
  console.log('MCQs seeded successfully.');

  // Seed default Topics & Companies
  const defaultTopics = [
    'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue', 'Binary Tree',
    'BST', 'Dynamic Programming', 'Graphs', 'Sorting', 'Recursion', 'Hashing', 'Math', 'Bit Manipulation',
    'Basic Syntax', 'Control Flow', 'Loops', 'Patterns'
  ];
  const createdTopics: { [key: string]: any } = {};
  for (const topicName of defaultTopics) {
    const topic = await prisma.topic.create({
      data: { name: topicName },
    });
    createdTopics[topicName.toLowerCase()] = topic;
  }

  const defaultCompanies = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Apple', 'Adobe', 'Uber'];
  const createdCompanies: { [key: string]: any } = {};
  for (const companyName of defaultCompanies) {
    const company = await prisma.company.create({
      data: { name: companyName },
    });
    createdCompanies[companyName.toLowerCase()] = company;
  }

  // Enriched Questions Lookup Map from JSON
  const enrichedMap: { [key: string]: typeof striverEnrichedData[0] } = {};
  for (const eq of striverEnrichedData) {
    enrichedMap[eq.title.toLowerCase().trim()] = eq;
  }

  // Build the Problems Registry map to merge duplicates
  const finalProblemsMap = new Map<string, SeedProblem>();

  // 1. Process all Striver A2Z sheet problems first
  console.log('Processing Striver A2Z sheet problems...');
  for (const category of striverA2ZData) {
    const stepName = category.category_name;
    for (const subcategory of category.subcategories) {
      const topicName = subcategory.subcategory_name;
      for (const prob of subcategory.problems) {
        const title = prob.problem_name;
        const enriched = enrichedMap[title.toLowerCase().trim()];

        let difficulty: ProblemDifficulty = ProblemDifficulty.EASY;
        if (prob.difficulty?.toUpperCase() === 'MEDIUM') difficulty = ProblemDifficulty.MEDIUM;
        if (prob.difficulty?.toUpperCase() === 'HARD') difficulty = ProblemDifficulty.HARD;

        const problemStatement = enriched?.problemStatement || `Solve the challenge for '${title}' in Java. Maintain efficiency and proper complexity bounds.`;
        const sampleInput = enriched?.sampleInput || "Refer to editorial or takeuforward sheet.";
        const sampleOutput = enriched?.sampleOutput || "Refer to editorial or takeuforward sheet.";
        const hint1 = enriched?.hint1 || prob.article || null;
        const hint2 = enriched?.hint2 || prob.youtube || null;
        const codeTemplate = enriched?.codeTemplate || `public class Solution {\n    public int solve(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}`;

        // Tag topic categories
        const topics: string[] = [];
        const lowerTopic = topicName.toLowerCase();
        const lowerTitle = title.toLowerCase();

        if (lowerTopic.includes('things to know') || lowerTopic.includes('basic syntax')) topics.push('Basic Syntax');
        if (lowerTopic.includes('patterns') || lowerTopic.includes('logical thinking')) topics.push('Patterns');
        if (lowerTitle.includes('if') || lowerTitle.includes('else') || lowerTitle.includes('switch')) topics.push('Control Flow');
        if (lowerTitle.includes('loop') || lowerTitle.includes('for') || lowerTitle.includes('while')) topics.push('Loops');
        if (lowerTopic.includes('array')) topics.push('Arrays');
        if (lowerTopic.includes('string')) topics.push('Strings');
        if (lowerTopic.includes('linked list')) topics.push('Linked List');
        if (lowerTopic.includes('stack')) topics.push('Stack');
        if (lowerTopic.includes('queue')) topics.push('Queue');
        if (lowerTopic.includes('tree')) topics.push('Binary Tree');
        if (lowerTopic.includes('recursion')) topics.push('Recursion');
        if (lowerTopic.includes('sorting')) topics.push('Sorting');
        if (lowerTopic.includes('binary search')) topics.push('Sorting');
        if (lowerTopic.includes('dp') || lowerTopic.includes('dynamic programming')) topics.push('Dynamic Programming');
        if (lowerTopic.includes('graph')) topics.push('Graphs');
        if (lowerTopic.includes('math')) topics.push('Math');

        const key = title.toLowerCase().trim();
        finalProblemsMap.set(key, {
          title,
          category: 'DSA',
          difficulty,
          problemStatement,
          sampleInput,
          sampleOutput,
          hint1,
          hint2,
          codeTemplate,
          isStriverSheet: true,
          striverStep: stepName,
          striverTopic: topicName,
          striverId: prob.problem_id,
          topics,
          companies: []
        });
      }
    }
  }

  // 2. Process all JavaFX original questions (1005) with Merge & Deduplication rules
  console.log('Processing JavaFX questions...');
  const javafxQuestions = generateJavaFXQuestions();
  
  let totalImported = 0;
  let totalMerged = 0;
  let duplicatesAvoided = 0;

  for (const jq of javafxQuestions) {
    const key = jq.title.toLowerCase().trim();
    const existing = finalProblemsMap.get(key);

    if (existing) {
      // DUPLICATE DETECTED - MERGE METADATA
      duplicatesAvoided++;
      totalMerged++;

      // Keep richer description
      if (jq.problemStatement.length > existing.problemStatement.length && !jq.problemStatement.includes("This is a premium LeetCode")) {
        existing.problemStatement = jq.problemStatement;
      }
      // Keep richer template
      if (jq.codeTemplate.length > existing.codeTemplate.length && !jq.codeTemplate.includes("// Write your solution method here")) {
        existing.codeTemplate = jq.codeTemplate;
      }
      // Keep richer samples
      if (jq.sampleInput && jq.sampleInput !== "Refer to editorial or takeuforward sheet." && !jq.sampleInput.includes("Input data for")) {
        existing.sampleInput = jq.sampleInput;
        existing.sampleOutput = jq.sampleOutput;
      }
      // Merge topics
      jq.topics.forEach(t => {
        if (!existing.topics.includes(t)) {
          existing.topics.push(t);
        }
      });
      // Keep JavaFX ID for stable tracking
      existing.javafxId = jq.javafxId;
    } else {
      // NEW CANONICAL QUESTION
      totalImported++;
      finalProblemsMap.set(key, jq);
    }
  }

  // Standalone additions (Prime Check & Anagram Check)
  const standalones = [
    {
      title: 'Prime Number Check',
      problemStatement: 'Implement a Java method `isPrime(int n)` that returns `true` if a number is prime and `false` otherwise. Optimize it to run in better than O(N) time complexity.',
      sampleInput: '17',
      sampleOutput: 'true',
      difficulty: ProblemDifficulty.EASY,
      category: 'Java',
      hint1: 'If the number is less than or equal to 1, it is not prime. If it is 2, it is prime.',
      hint2: 'You only need to check divisibility of n by numbers up to the square root of n (i.e. i * i <= n).',
      codeTemplate: 'public class Solution {\n    public boolean isPrime(int n) {\n        // Write your solution here\n        return false;\n    }\n}',
      topics: ['Math'],
      companies: []
    },
    {
      title: 'Check for Anagrams',
      problemStatement: 'Write a Java method `areAnagrams(String str1, String str2)` that checks whether two input strings are anagrams of each other. Anagrams contain the same characters in any order (case-insensitive).',
      sampleInput: 'listen, silent',
      sampleOutput: 'true',
      difficulty: ProblemDifficulty.MEDIUM,
      category: 'Java',
      hint1: 'Convert both strings to lowercase, clean up whitespaces, and convert them to character arrays.',
      hint2: 'Sort both character arrays. If they are equal, then the strings are anagrams. Alternatively, use a character frequency table (HashMap or array).',
      codeTemplate: 'public class Solution {\n    public boolean areAnagrams(String str1, String str2) {\n        // Write your solution here\n        return false;\n    }\n}',
      topics: ['Strings', 'Hashing'],
      companies: []
    }
  ];

  for (const s of standalones) {
    const key = s.title.toLowerCase().trim();
    if (!finalProblemsMap.has(key)) {
      finalProblemsMap.set(key, {
        ...s,
        isStriverSheet: false,
        topics: s.topics,
        companies: s.companies
      });
      totalImported++;
    }
  }

  console.log(`\n=== MIGRATION MERGE SUMMARY ===`);
  console.log(`  Striver Problems base: ${striverA2ZData.map(c=>c.subcategories.map(s=>s.problems.length).reduce((a,b)=>a+b, 0)).reduce((a,b)=>a+b, 0)}`);
  console.log(`  JavaFX Problems evaluated: ${javafxQuestions.length}`);
  console.log(`  Merged / Duplicates Avoided: ${duplicatesAvoided}`);
  console.log(`  New Problems Imported: ${totalImported}`);
  console.log(`  Total Unique Coding Challenges to seed: ${finalProblemsMap.size}\n`);

  // Write all unique problems into database
  console.log('Writing unique challenges to database...');
  let count = 0;
  for (const [key, p] of finalProblemsMap) {
    const topicConnect = p.topics
      .filter(t => createdTopics[t.toLowerCase()] !== undefined)
      .map(t => ({ id: createdTopics[t.toLowerCase()].id }));

    // Generate stable slug
    const suffix = p.striverId ? p.striverId : p.javafxId ? String(p.javafxId) : 'std';
    const slug = slugify(p.title) + '-' + suffix;

    await prisma.problem.create({
      data: {
        title: p.title,
        slug,
        category: p.category,
        difficulty: p.difficulty,
        problemStatement: p.problemStatement,
        sampleInput: p.sampleInput,
        sampleOutput: p.sampleOutput,
        hint1: p.hint1,
        hint2: p.hint2,
        codeTemplate: p.codeTemplate,
        isStriverSheet: p.isStriverSheet,
        striverStep: p.striverStep,
        striverTopic: p.striverTopic,
        topics: {
          connect: topicConnect
        }
      }
    });
    count++;
    if (count % 200 === 0) {
      console.log(`Seeded ${count} problems...`);
    }
  }

  console.log(`Seed completed successfully! Seeded ${count} total unique coding problems.`);
}

main()
  .catch((e) => {
    console.error('Seed execution failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
