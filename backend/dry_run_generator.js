const fs = require('fs');
const path = require('path');

// Convert a title into a valid camelCase Java method name
function toCamelCase(title) {
  let clean = title.replace(/[^a-zA-Z0-9\s]/g, ' ');
  if (clean.toLowerCase().includes('gcd')) return 'findGCD';
  if (clean.toLowerCase().includes('lcm')) return 'findLCM';
  if (clean.toLowerCase().includes('lru')) return 'lruCache';
  if (clean.toLowerCase().includes('oop')) return 'oopConcepts';
  if (clean.toLowerCase().includes('bst')) return 'bstOperations';
  if (clean.toLowerCase().includes('fibonacci')) return 'fib';
  if (clean.toLowerCase().includes('anagram')) return 'isAnagram';
  if (clean.toLowerCase().includes('prime')) return 'isPrime';
  if (clean.toLowerCase().includes('palindrome')) return 'isPalindrome';

  let words = clean.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 'solve';
  
  let result = words[0].toLowerCase();
  for (let i = 1; i < words.length; i++) {
    result += words[i].charAt(0).toUpperCase() + words[i].slice(1).toLowerCase();
  }
  return result;
}

const LIST_NODE_DEF = `/**
 * Definition for singly-linked list.
 * public class ListNode {
 *     int val;
 *     ListNode next;
 *     ListNode() {}
 *     ListNode(int val) { this.val = val; }
 *     ListNode(int val, ListNode next) { this.val = val; this.next = next; }
 * }
 */\n`;

const TREE_NODE_DEF = `/**
 * Definition for a binary tree node.
 * public class TreeNode {
 *     int val;
 *     TreeNode left;
 *     TreeNode right;
 *     TreeNode() {}
 *     TreeNode(int val) { this.val = val; }
 *     TreeNode(int val, TreeNode left, TreeNode right) {
 *         this.val = val;
 *         this.left = left;
 *         this.right = right;
 *     }
 * }
 */\n`;

// 22 Patterns Map (Striver and basic syntax printing patterns)
const patternsMap = {
  "Pattern 1": {
    statement: "Print a square star pattern of size N.\nExample: N = 3\n* * *\n* * *\n* * *",
    input: "n = 5",
    output: "* * * * *\n* * * * *\n* * * * *\n* * * * *\n* * * * *",
    template: `public class Solution {\n    public void printSquare(int n) {\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n; j++) {\n                System.out.print("* ");\n            }\n            System.out.println();\n        }\n    }\n}`
  },
  "Pattern 2": {
    statement: "Print a right-angled triangle star pattern of size N.\nExample: N = 3\n*\n* *\n* * *",
    input: "n = 5",
    output: "*\n* *\n* * *\n* * * *\n* * * * *",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= i; j++) {\n                System.out.print("* ");\n            }\n            System.out.println();\n        }\n    }\n}`
  },
  "Pattern 3": {
    statement: "Print a right-angled triangle pattern of consecutive numbers starting from 1.\nExample: N = 3\n1\n1 2\n1 2 3",
    input: "n = 5",
    output: "1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= i; j++) {\n                System.out.print(j + " ");\n            }\n            System.out.println();\n        }\n    }\n}`
  },
  "Pattern 4": {
    statement: "Print a right-angled triangle pattern where each row contains the row number.\nExample: N = 3\n1\n2 2\n3 3 3",
    input: "n = 5",
    output: "1\n2 2\n3 3 3\n4 4 4 4\n5 5 5 5 5",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        for (int i = 1; i <= n; i++) {\n            for (int j = 1; j <= i; j++) {\n                System.out.print(i + " ");\n            }\n            System.out.println();\n        }\n    }\n}`
  },
  "Pattern 5": {
    statement: "Print an inverted right-angled triangle star pattern of size N.\nExample: N = 3\n* * *\n* *\n*",
    input: "n = 5",
    output: "* * * * *\n* * * *\n* * *\n* *\n*",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        for (int i = n; i >= 1; i--) {\n            for (int j = 1; j <= i; j++) {\n                System.out.print("* ");\n            }\n            System.out.println();\n        }\n    }\n}`
  },
  "Pattern 6": {
    statement: "Print an inverted right-angled triangle pattern of numbers.\nExample: N = 3\n1 2 3\n1 2\n1",
    input: "n = 5",
    output: "1 2 3 4 5\n1 2 3 4\n1 2 3\n1 2\n1",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        for (int i = n; i >= 1; i--) {\n            for (int j = 1; j <= i; j++) {\n                System.out.print(j + " ");\n            }\n            System.out.println();\n        }\n    }\n}`
  },
  "Pattern 7": {
    statement: "Print a star pyramid of height N.\nExample: N = 3\n  *  \n *** \n*****",
    input: "n = 5",
    output: "    *    \n   ***   \n  *****  \n ******* \n*********",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        for (int i = 0; i < n; i++) {\n            for (int j = 0; j < n - i - 1; j++) System.out.print(" ");\n            for (int j = 0; j < 2 * i + 1; j++) System.out.print("*");\n            System.out.println();\n        }\n    }\n}`
  },
  "Pattern 8": {
    statement: "Print an inverted star pyramid of height N.\nExample: N = 3\n*****\n *** \n  *  ",
    input: "n = 5",
    output: "*********\n ******* \n  *****  \n   ***   \n    *    ",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        for (int i = n; i >= 1; i--) {\n            for (int j = 0; j < n - i; j++) System.out.print(" ");\n            for (int j = 0; j < 2 * i - 1; j++) System.out.print("*");\n            System.out.println();\n        }\n    }\n}`
  },
  "Pattern 9": {
    statement: "Print a diamond star pattern of height 2N.\nExample: N = 3\n  *  \n *** \n*****\n*****\n *** \n  *  ",
    input: "n = 5",
    output: "    *    \n   ***   \n  *****  \n ******* \n*********\n*********\n ******* \n  *****  \n   ***   \n    *    ",
    template: `public class Solution {\n    public void printDiamond(int n) {\n        // Diamond pattern loops\n    }\n}`
  },
  "Pattern 10": {
    statement: "Print a half diamond star pattern of width N.\nExample: N = 3\n*\n**\n***\n**\n*",
    input: "n = 5",
    output: "*\n**\n***\n****\n*****\n****\n***\n**\n*",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        // Half diamond\n    }\n}`
  },
  "Pattern 11": {
    statement: "Print a binary number triangle pattern of height N.\nExample: N = 3\n1\n0 1\n1 0 1",
    input: "n = 5",
    output: "1\n0 1\n1 0 1\n0 1 0 1\n1 0 1 0 1",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        // Binary numbers\n    }\n}`
  },
  "Pattern 12": {
    statement: "Print a number crown pattern of height N.\nExample: N = 3\n1    1\n12  21\n123321",
    input: "n = 4",
    output: "1      1\n12    21\n123  321\n12344321",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        // Number crown\n    }\n}`
  },
  "Pattern 13": {
    statement: "Print an increasing number triangle pattern of height N.\nExample: N = 3\n1\n2 3\n4 5 6",
    input: "n = 5",
    output: "1\n2 3\n4 5 6\n7 8 9 10\n11 12 13 14 15",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        // Increasing numbers\n    }\n}`
  },
  "Pattern 14": {
    statement: "Print an increasing letter triangle pattern of height N starting from 'A'.\nExample: N = 3\nA\nA B\nA B C",
    input: "n = 5",
    output: "A\nA B\nA B C\nA B C D\nA B C D E",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        // Increasing letters\n    }\n}`
  },
  "Pattern 15": {
    statement: "Print an inverted letter triangle pattern of height N starting from 'A'.\nExample: N = 3\nA B C\nA B\nA",
    input: "n = 5",
    output: "A B C D E\nA B C D\nA B C\nA B\nA",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        // Inverted letters\n    }\n}`
  },
  "Pattern 16": {
    statement: "Print a letter triangle pattern of height N where each row contains the same letter.\nExample: N = 3\nA\nB B\nC C C",
    input: "n = 5",
    output: "A\nB B\nC C C\nD D D D\nE E E E E",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        // Row letter pattern\n    }\n}`
  },
  "Pattern 17": {
    statement: "Print an Alpha-Hill letter pyramid of height N.\nExample: N = 3\n  A  \n ABA \nABCBA",
    input: "n = 4",
    output: "   A   \n  ABA  \n ABCBA \nABCDCBA",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        // Alpha-hill pyramid\n    }\n}`
  },
  "Pattern 18": {
    statement: "Print an Alpha-Triangle pattern starting from the N-th character of the alphabet.\nExample: N = 3\nC\nB C\nA B C",
    input: "n = 5",
    output: "E\nD E\nC D E\nB C D E\nA B C D E",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        // Alpha-triangle\n    }\n}`
  },
  "Pattern 19": {
    statement: "Print a symmetric void pattern of size N.\nExample: N = 3\n******\n**  **\n*    *\n*    *\n**  **\n******",
    input: "n = 5",
    output: "**********\n****  ****\n***    ***\n**      **\n*        *\n*        *\n**      **\n***    ***\n****  ****\n**********",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        // Symmetric void\n    }\n}`
  },
  "Pattern 20": {
    statement: "Print a butterfly star pattern of size N.\nExample: N = 3\n*    *\n**  **\n******\n**  **\n*    *",
    input: "n = 5",
    output: "*        *\n**      **\n***    ***\n****  ****\n**********\n****  ****\n***    ***\n**      **\n*        *",
    template: `public class Solution {\n    public void printTriangle(int n) {\n        // Butterfly\n    }\n}`
  },
  "Pattern 21": {
    statement: "Print a hollow square star pattern of size N.\nExample: N = 4\n****\n*  *\n*  *\n****",
    input: "n = 5",
    output: "*****\n*   *\n*   *\n*   *\n*****",
    template: `public class Solution {\n    public void printSquare(int n) {\n        // Hollow square\n    }\n}`
  },
  "Pattern 22": {
    statement: "Print a concentric number square pattern of size 2N-1.\nExample: N = 3\n3 3 3 3 3\n3 2 2 2 3\n3 2 1 2 3\n3 2 2 2 3\n3 3 3 3 3",
    input: "n = 4",
    output: "4 4 4 4 4 4 4\n4 3 3 3 3 3 4\n4 3 2 2 2 3 4\n4 3 2 1 2 3 4\n4 3 2 2 2 3 4\n4 3 3 3 3 3 4\n4 4 4 4 4 4 4",
    template: `public class Solution {\n    public void printSquare(int n) {\n        // Concentric square\n    }\n}`
  }
};

// Map basic syntax pattern names to Striver ones
const basicSyntaxPatternMappings = {
  "Pattern: Square Star Block": "Pattern 1",
  "Pattern: Right-Angled Triangle": "Pattern 2",
  "Pattern: Inverted Triangle": "Pattern 5",
  "Pattern: Number Pyramids": "Pattern 7",
  "Pattern: Alternating Binary": "Pattern 11",
  "Pattern: Letter Diamond Border": "Pattern 17",
  "Pattern: Symmetric Diamond": "Pattern 9",
  "Pattern: Hollow Diamond Outline": "Pattern 19",
  "Pattern: Spiral Matrix Pattern": "Pattern 22",
  "Pattern: Left Staircase": "Pattern 2", // approximation
  "Pattern: Hollow Rectangle": "Pattern 21", // approximation
  "Pattern: Decreasing Number Row": "Pattern 6",
  "Pattern: Horizontal Star Groups": "Pattern 1",
  "Pattern: Pascal Triangle Rows": "Pattern 7",
  "Pattern: Zigzag Star Border": "Pattern 9"
};

// High-fidelity DSA registry mapping (for top common questions)
const dsaRegistry = {
  "twosum": {
    statement: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
    input: "nums = [2,7,11,15], target = 9",
    output: "[0,1]",
    explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    template: `import java.util.*;\n\npublic class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`
  },
  "addtwonumbers": {
    statement: "You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.\n\nYou may assume the two numbers do not contain any leading zero, except the number 0 itself.",
    constraints: "The number of nodes in each linked list is in the range [1, 100].\n0 <= Node.val <= 9\nIt is guaranteed that the list represents a number that does not have leading zeros.",
    input: "l1 = [2,4,3], l2 = [5,6,4]",
    output: "[7,0,8]",
    explanation: "342 + 465 = 807.",
    template: LIST_NODE_DEF + `import java.util.*;\n\npublic class Solution {\n    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {\n        ListNode dummyHead = new ListNode(0);\n        ListNode p = l1, q = l2, curr = dummyHead;\n        int carry = 0;\n        while (p != null || q != null) {\n            int x = (p != null) ? p.val : 0;\n            int y = (q != null) ? q.val : 0;\n            int sum = carry + x + y;\n            carry = sum / 10;\n            curr.next = new ListNode(sum % 10);\n            curr = curr.next;\n            if (p != null) p = p.next;\n            if (q != null) q = q.next;\n        }\n        if (carry > 0) {\n            curr.next = new ListNode(carry);\n        }\n        return dummyHead.next;\n    }\n}`
  },
  "reversestring": {
    statement: "Write a Java method `reverseString(String str)` that takes a string as input and returns it reversed. Do NOT use built-in library functions such as `StringBuilder.reverse()`. The method must process characters manually.",
    constraints: "1 <= str.length() <= 10^5\nstr contains printable ASCII characters.",
    input: "str = \"hello\"",
    output: "\"olleh\"",
    explanation: "Reversing 'hello' results in 'olleh'.",
    template: `import java.util.*;\n\npublic class Solution {\n    public String reverseString(String str) {\n        char[] chars = str.toCharArray();\n        int left = 0, right = chars.length - 1;\n        while (left < right) {\n            char temp = chars[left];\n            chars[left] = chars[right];\n            chars[right] = temp;\n            left++;\n            right--;\n        }\n        return new String(chars);\n    }\n}`
  },
  "reverseastring": {
    statement: "Write a Java method `reverseString(String str)` that takes a string as input and returns it reversed. Do NOT use built-in library functions such as `StringBuilder.reverse()`. The method must process characters manually.",
    constraints: "1 <= str.length() <= 10^5\nstr contains printable ASCII characters.",
    input: "str = \"hello\"",
    output: "\"olleh\"",
    explanation: "Reversing 'hello' results in 'olleh'.",
    template: `import java.util.*;\n\npublic class Solution {\n    public String reverseString(String str) {\n        char[] chars = str.toCharArray();\n        int left = 0, right = chars.length - 1;\n        while (left < right) {\n            char temp = chars[left];\n            chars[left] = chars[right];\n            chars[right] = temp;\n            left++;\n            right--;\n        }\n        return new String(chars);\n    }\n}`
  },
  "climbingstairs": {
    statement: "You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
    constraints: "1 <= n <= 45",
    input: "n = 3",
    output: "3",
    explanation: "There are three ways to climb to the top:\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step",
    template: `import java.util.*;\n\npublic class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int first = 1, second = 2;\n        for (int i = 3; i <= n; i++) {\n            int third = first + second;\n            first = second;\n            second = third;\n        }\n        return second;\n    }\n}`
  },
  "reverselinkedlist": {
    statement: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    constraints: "The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000",
    input: "head = [1,2,3,4,5]",
    output: "[5,4,3,2,1]",
    explanation: "The reversed linked list contains elements in backward order.",
    template: LIST_NODE_DEF + `import java.util.*;\n\npublic class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode nextTemp = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nextTemp;\n        }\n        return prev;\n    }\n}`
  },
  "mergetwosortedlists": {
    statement: "You are given the heads of two sorted linked lists `list1` and `list2`.\n\nMerge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.\n\nReturn the head of the merged linked list.",
    constraints: "The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order.",
    input: "list1 = [1,2,4], list2 = [1,3,4]",
    output: "[1,1,2,3,4,4]",
    explanation: "Splicing together yields a single sorted linked list.",
    template: LIST_NODE_DEF + `import java.util.*;\n\npublic class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        if (list1 == null) return list2;\n        if (list2 == null) return list1;\n        if (list1.val < list2.val) {\n            list1.next = mergeTwoLists(list1.next, list2);\n            return list1;\n        } else {\n            list2.next = mergeTwoLists(list1, list2.next);\n            return list2;\n        }\n    }\n}`
  },
  "validparentheses": {
    statement: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    constraints: "1 <= s.length <= 10^4\ns consists of parentheses characters only '()[]{}'.",
    input: "s = \"()[]{}\"",
    output: "true",
    explanation: "All brackets are properly matched and nested.",
    template: `import java.util.*;\n\npublic class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(' || c == '{' || c == '[') {\n                stack.push(c);\n            } else {\n                if (stack.isEmpty()) return false;\n                char open = stack.pop();\n                if (c == ')' && open != '(') return false;\n                if (c == '}' && open != '{') return false;\n                if (c == ']' && open != '[') return false;\n            }\n        }\n        return stack.isEmpty();\n    }\n}`
  },
  "maximumsubarray": {
    statement: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
    constraints: "1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4\nFollow up: If you have figured out the O(N) solution, try coding another solution using the divide and conquer approach, which is more subtle.",
    input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
    output: "6",
    explanation: "The subarray [4,-1,2,1] has the largest sum = 6.",
    template: `import java.util.*;\n\npublic class Solution {\n    public int maxSubArray(int[] nums) {\n        int maxSoFar = nums[0];\n        int currMax = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            currMax = Math.max(nums[i], currMax + nums[i]);\n            maxSoFar = Math.max(maxSoFar, currMax);\n        }\n        return maxSoFar;\n    }\n}`
  },
  "searchinrotatedsortedarray": {
    statement: "There is an integer array `nums` sorted in ascending order (with distinct values).\n\nPrior to being passed to your function, `nums` is possibly rotated at an unknown pivot index `k` ($1 \\le k < \\text{nums.length}$) such that the resulting array is `[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]` (0-indexed).\n\nGiven the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or -1 if it is not in `nums`.\n\nYou must write an algorithm with $O(\\log N)$ runtime complexity.",
    constraints: "1 <= nums.length <= 5000\n-10^4 <= nums[i] <= 10^4\nAll values of nums are unique.\nnums is an ascending array that is possibly rotated.\n-10^4 <= target <= 10^4",
    input: "nums = [4,5,6,7,0,1,2], target = 0",
    output: "4",
    explanation: "The target 0 is located at index 4 in the array.",
    template: `import java.util.*;\n\npublic class Solution {\n    public int search(int[] nums, int target) {\n        int left = 0, right = nums.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[left] <= nums[mid]) {\n                if (nums[left] <= target && target < nums[mid]) right = mid - 1;\n                else left = mid + 1;\n            } else {\n                if (nums[mid] < target && target <= nums[right]) left = mid + 1;\n                else right = mid - 1;\n            }\n        }\n        return -1;\n    }\n}`
  },
  "medianoftwosortedarrays": {
    statement: "Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be $O(\\log(m+n))$.",
    constraints: "nums1.length == m\nnums2.length == n\n0 <= m <= 1000\n0 <= n <= 1000\n1 <= m + n <= 2000\n-10^6 <= nums1[i], nums2[i] <= 10^6",
    input: "nums1 = [1,3], nums2 = [2]",
    output: "2.00000",
    explanation: "The merged sorted array is [1, 2, 3] and its median is 2.0.",
    template: `import java.util.*;\n\npublic class Solution {\n    public double findMedianSortedArrays(int[] nums1, int[] nums2) {\n        // Write logic here\n        return 0.0;\n    }\n}`
  },
  "mergeintervals": {
    statement: "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    constraints: "1 <= intervals.length <= 10^4\nintervals[i].length == 2\n0 <= start_i <= end_i <= 10^4",
    input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
    output: "[[1,6],[8,10],[15,18]]",
    explanation: "Intervals [1,3] and [2,6] overlap, and they are merged into [1,6].",
    template: `import java.util.*;\n\npublic class Solution {\n    public int[][] merge(int[][] intervals) {\n        if (intervals.length <= 1) return intervals;\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> result = new ArrayList<>();\n        int[] curr = intervals[0];\n        result.add(curr);\n        for (int[] interval : intervals) {\n            if (interval[0] <= curr[1]) {\n                curr[1] = Math.max(curr[1], interval[1]);\n            } else {\n                curr = interval;\n                result.add(curr);\n            }\n        }\n        return result.toArray(new int[result.size()][]);\n    }\n}`
  },
  "validatebinarysearchtree": {
    statement: "Given the root of a binary tree, determine if it is a valid binary search tree (BST).\n\nA valid BST is defined as follows:\n- The left subtree of a node contains only nodes with keys less than the node's key.\n- The right subtree of a node contains only nodes with keys greater than the node's key.\n- Both the left and right subtrees must also be binary search trees.",
    constraints: "The number of nodes in the tree is in the range [1, 10^4].\n-2^31 <= Node.val <= 2^31 - 1",
    input: "root = [2,1,3]",
    output: "true",
    explanation: "All nodes satisfy the binary search tree properties.",
    template: TREE_NODE_DEF + `import java.util.*;\n\npublic class Solution {\n    public boolean isValidBST(TreeNode root) {\n        return validate(root, null, null);\n    }\n    private boolean validate(TreeNode node, Integer low, Integer high) {\n        if (node == null) return true;\n        if ((low != null && node.val <= low) || (high != null && node.val >= high)) return false;\n        return validate(node.left, low, node.val) && validate(node.right, node.val, high);\n    }\n}`
  }
};

// Generates reconstructed properties for a problem
function generateProperties(p) {
  const title = p.title.trim();
  const tLower = title.toLowerCase();
  const normTitle = title.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  let statement = '';
  let constraints = 'Constraints:\n1 <= N <= 10^5\nAll inputs will fit within appropriate range boundaries.';
  let sampleInput = 'n = 5';
  let sampleOutput = '5';
  let template = '';
  let hint1 = 'Analyze the constraints and pick the optimal algorithm.';
  let hint2 = 'Consider trade-offs between time and space complexity.';

  // Helper check variables
  let topicsArr = [];
  if (Array.isArray(p.topics)) {
    topicsArr = p.topics.map(t => typeof t === 'string' ? t : t.name);
  } else if (p.topic) {
    topicsArr.push(p.topic);
  }
  if (Array.isArray(p.tags)) {
    topicsArr = topicsArr.concat(p.tags);
  }
  let hasTopic = (topicName) => topicsArr.some(t => t.toLowerCase() === topicName.toLowerCase() || t.toLowerCase() === topicName.toLowerCase() + 's');

  let isPattern = tLower.includes('pattern') || topicsArr.some(t => t.toLowerCase() === 'patterns' || t.toLowerCase() === 'pattern printing');
  let isGraph = tLower.includes('graph') || tLower.includes('bfs') || tLower.includes('dfs') || tLower.includes('dijkstra') || tLower.includes('bellman') || tLower.includes('floyd') || tLower.includes('kruskal') || tLower.includes('prim') || tLower.includes('bipartite') || tLower.includes('topological') || tLower.includes('alien dictionary') || tLower.includes('islands') || topicsArr.some(t => t.toLowerCase().includes('graph') || t.toLowerCase().includes('network') || t.toLowerCase().includes('disjoint') || t.toLowerCase().includes('mst'));
  let isTree = !isGraph && (tLower.includes('tree') || tLower.includes('bst') || tLower.includes('inorder') || tLower.includes('preorder') || tLower.includes('postorder') || tLower.includes('traversal') || tLower.includes('same tree') || tLower.includes('symmetric tree') || hasTopic('Binary Tree') || hasTopic('BST') || hasTopic('Tree'));
  let isLinkedList = !isGraph && !isTree && (tLower.includes('linked list') || tLower.includes('list node') || tLower.includes('intersection of two') || tLower.includes('reverse linked list') || tLower.includes('middle of') || tLower.includes('list cycle') || tLower.includes('remove duplicates from sorted list') || tLower.includes('merge two sorted lists') || hasTopic('Linked List'));
  let isMatrix = tLower.includes('matrix') || tLower.includes('grid') || tLower.includes('spiral') || tLower.includes('sudoku') || tLower.includes('rotate image') || hasTopic('Matrix') || hasTopic('2d array');
  let isString = !isTree && !isLinkedList && !isGraph && (tLower.includes('string') || tLower.includes('char') || tLower.includes('anagram') || tLower.includes('parenthes') || tLower.includes('bracket') || tLower.includes('roman') || tLower.includes('prefix') || tLower.includes('morse') || tLower.includes('sentence') || tLower.includes('word') || hasTopic('Strings'));
  let isMath = tLower.includes('math') || tLower.includes('gcd') || tLower.includes('lcm') || tLower.includes('prime') || tLower.includes('divisor') || tLower.includes('armstrong') || tLower.includes('fibonacci') || tLower.includes('factorial') || tLower.includes('power') || tLower.includes('digits') || tLower.includes('bit') || hasTopic('Math') || hasTopic('Bit Manipulation');
  let isBasicSyntax = p.category === 'Java' || hasTopic('Basic Syntax') || hasTopic('Control Flow') || hasTopic('Loops') || hasTopic('Functions') || hasTopic('Recursion');

  // Rule 1: check dsaRegistry
  if (dsaRegistry[normTitle]) {
    const reg = dsaRegistry[normTitle];
    statement = reg.statement + `\n\nConstraints:\n${reg.constraints}`;
    sampleInput = reg.input;
    sampleOutput = reg.output;
    template = reg.template;
    if (reg.explanation) hint1 = reg.explanation;
  }
  // Rule 2: Pattern check
  else if (isPattern) {
    let basePattern = title;
    if (basicSyntaxPatternMappings[title]) {
      basePattern = basicSyntaxPatternMappings[title];
    } else {
      // Find digit in pattern name e.g. "Pattern: Number Pyramids"
      const match = title.match(/Pattern\s+(\d+)/i);
      if (match) basePattern = `Pattern ${match[1]}`;
    }
    const pat = patternsMap[basePattern] || patternsMap["Pattern 1"];
    statement = `Print a geometric pattern corresponding to '${title}' using nested loops. Make sure to match the layout exactly.\n\n${pat.statement}\n\nConstraints:\n1 <= N <= 20`;
    sampleInput = pat.input;
    sampleOutput = pat.output;
    template = pat.template;
  }
  // Rule 3: Graph (put first!)
  else if (isGraph) {
    const method = toCamelCase(title);
    statement = `Implement a graph operations method \`${method}\` for the challenge: '${title}'. The graph is represented by V vertices and an adjacency list representation adj.\n\nConstraints:\n1 <= V <= 5000\n0 <= E <= 10^4\nGraph may contain cycles or disconnected components.`;
    sampleInput = "V = 4, adj = [[1, 2], [2, 3]]";
    sampleOutput = "[0, 1, 2, 3]";
    template = `import java.util.*;\n\npublic class Solution {\n    public List<Integer> ${method}(int V, List<List<Integer>> adj) {\n        List<Integer> res = new ArrayList<>();\n        // Write graph algorithm here\n        return res;\n    }\n}`;
  }
  // Rule 4: Tree
  else if (isTree) {
    const method = toCamelCase(title);
    statement = `Given the root node of a binary tree/BST, implement the method \`${method}\` to solve the challenge: '${title}'. Consider traversal ordering or specific node validation rules.\n\nConstraints:\nThe number of nodes in the tree is in range [0, 10^4].\n-1000 <= Node.val <= 1000`;
    sampleInput = "root = [1,null,2,3]";
    
    if (tLower.includes('traversal')) {
      sampleOutput = "[1,3,2]";
      template = TREE_NODE_DEF + `import java.util.*;\n\npublic class Solution {\n    public List<Integer> ${method}(TreeNode root) {\n        List<Integer> res = new ArrayList<>();\n        // Write traversal here\n        return res;\n    }\n}`;
    } else if (tLower.includes('validate') || tLower.includes('same') || tLower.includes('symmetric') || tLower.includes('check')) {
      sampleOutput = "true";
      template = TREE_NODE_DEF + `public class Solution {\n    public boolean ${method}(TreeNode root) {\n        // Write logic here\n        return true;\n    }\n}`;
    } else {
      sampleOutput = "3";
      template = TREE_NODE_DEF + `public class Solution {\n    public int ${method}(TreeNode root) {\n        // Write query logic here\n        return 0;\n    }\n}`;
    }
  }
  // Rule 5: Linked List
  else if (isLinkedList) {
    const method = toCamelCase(title);
    statement = `Given the head node of a singly linked list representing the structure, implement the method \`${method}\` to solve the challenge: '${title}'. Solve the problem efficiently and handle edge cases such as empty lists or single node lists.\n\nConstraints:\nThe number of nodes in the list is in range [0, 10^5].\n-10^9 <= Node.val <= 10^9`;
    
    if (tLower.includes('intersection') || tLower.includes('merge') || tLower.includes('add two')) {
      sampleInput = "l1 = [4,1,8,4,5], l2 = [5,6,1,8,4,5]";
      sampleOutput = "[8,4,5]";
      template = LIST_NODE_DEF + `public class Solution {\n    public ListNode ${method}(ListNode l1, ListNode l2) {\n        // Write logic here\n        return null;\n    }\n}`;
    } else {
      sampleInput = "head = [1,2,3,4,5]";
      sampleOutput = "[5,4,3,2,1]";
      template = LIST_NODE_DEF + `public class Solution {\n    public ListNode ${method}(ListNode head) {\n        // Write logic here\n        return head;\n    }\n}`;
    }
  }
  // Rule 6: Matrix
  else if (isMatrix) {
    const method = toCamelCase(title);
    statement = `Solve the 2D grid/matrix coding challenge: '${title}'. Perform updates in-place or compute the target outcome as described by the method signature \`${method}\`.\n\nConstraints:\nm == matrix.length, n == matrix[i].length\n1 <= m, n <= 200\n-10^9 <= matrix[i][j] <= 10^9`;
    sampleInput = "matrix = [[1,2],[3,4]]";
    sampleOutput = "[[3,1],[4,2]]";
    template = `public class Solution {\n    public void ${method}(int[][] matrix) {\n        // Write in-place grid logic here\n    }\n}`;
  }
  // Rule 7: String
  else if (isString) {
    const method = toCamelCase(title);
    statement = `Write a string processing method \`${method}\` for the challenge: '${title}'. Pay attention to edge cases such as empty strings, casing, whitespaces, and punctuation.\n\nConstraints:\n1 <= s.length <= 10^5\ns contains printable ASCII characters.`;
    
    if (tLower.includes('anagram') || tLower.includes('palindrome') || tLower.includes('valid') || tLower.includes('check')) {
      sampleInput = "s = \"anagram\", t = \"nagaram\"";
      sampleOutput = "true";
      template = `public class Solution {\n    public boolean ${method}(String s, String t) {\n        // Write verification here\n        return false;\n    }\n}`;
    } else if (tLower.includes('reverse')) {
      sampleInput = "s = \"hello\"";
      sampleOutput = "\"olleh\"";
      template = `public class Solution {\n    public String ${method}(String s) {\n        // Write reverse logic here\n        return s;\n    }\n}`;
    } else {
      sampleInput = "s = \"hello\"";
      sampleOutput = "5";
      template = `public class Solution {\n    public int ${method}(String s) {\n        // Write parsing logic here\n        return 0;\n    }\n}`;
    }
  }
  // Rule 8: Math
  else if (isMath) {
    const method = toCamelCase(title);
    statement = `Implement a mathematical helper function \`${method}\` for: '${title}'. Make sure your solution is optimized for time complexity (e.g. O(log N) or O(sqrt N)) and prevents integer overflow.\n\nConstraints:\n0 <= N <= 10^9\nInputs fit within typical boundaries of primitive data types.`;
    sampleInput = "n = 12";
    sampleOutput = "28";
    
    if (tLower.includes('prime') || tLower.includes('palindrome') || tLower.includes('perfect') || tLower.includes('check') || tLower.includes('armstrong')) {
      sampleOutput = "true";
      template = `public class Solution {\n    public boolean ${method}(int n) {\n        // Write checks here\n        return false;\n    }\n}`;
    } else if (tLower.includes('gcd') || tLower.includes('lcm') || tLower.includes('min') || tLower.includes('max')) {
      sampleInput = "a = 20, b = 15";
      sampleOutput = "5";
      template = `public class Solution {\n    public int ${method}(int a, int b) {\n        // Write math here\n        return 1;\n    }\n}`;
    } else {
      template = `public class Solution {\n    public int ${method}(int n) {\n        // Write computation here\n        return 0;\n    }\n}`;
    }
  }
  // Rule 9: Basic Syntax
  else if (isBasicSyntax) {
    const method = toCamelCase(title);
    statement = `Write a clean and educational beginner-friendly Java method \`${method}\` for the challenge: '${title}'. Ensure it handles edge boundary inputs correctly.\n\nConstraints:\nInputs will be within standard integer or decimal boundaries.\n1 <= N <= 10^5`;
    
    if (tLower.includes('even') || tLower.includes('odd') || tLower.includes('positive') || tLower.includes('negative') || tLower.includes('eligible') || tLower.includes('status')) {
      sampleInput = "n = 10";
      sampleOutput = "true";
      template = `public class Solution {\n    public boolean ${method}(int n) {\n        // Write verification here\n        return false;\n    }\n}`;
    } else if (tLower.includes('salary') || tLower.includes('tax') || tLower.includes('bill') || tLower.includes('interest') || tLower.includes('calculator')) {
      sampleInput = "val = 150";
      sampleOutput = "325.50";
      template = `public class Solution {\n    public double ${method}(double val) {\n        // Write calculation here\n        return 0.0;\n    }\n}`;
    } else if (tLower.includes('weekday') || tLower.includes('month') || tLower.includes('selector') || tLower.includes('comment') || tLower.includes('name')) {
      sampleInput = "selection = 3";
      sampleOutput = "\"Option C\"";
      template = `public class Solution {\n    public String ${method}(int selection) {\n        // Write selection here\n        return \"\";\n    }\n}`;
    } else {
      sampleInput = "n = 5";
      sampleOutput = "120";
      template = `public class Solution {\n    public int ${method}(int n) {\n        // Write loop or basic logic here\n        return n;\n    }\n}`;
    }
  }
  // Rule 10: Array / Fallback DSA
  else {
    const method = toCamelCase(title);
    statement = `Given an array of integers \`nums\`, implement the method \`${method}\` to solve the challenge: '${title}'. Optimize for $O(N)$ runtime complexity and $O(1)$ auxiliary space if possible.\n\nConstraints:\n1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9`;
    
    if (tLower.includes('search') || tLower.includes('find') || tLower.includes('index')) {
      sampleInput = "nums = [1, 2, 3, 4, 5], target = 3";
      sampleOutput = "2";
      template = `public class Solution {\n    public int ${method}(int[] nums, int target) {\n        // Write search here\n        return -1;\n    }\n}`;
    } else if (tLower.includes('sort')) {
      sampleInput = "nums = [5, 2, 8, 1, 9]";
      sampleOutput = "[1, 2, 5, 8, 9]";
      template = `public class Solution {\n    public void ${method}(int[] nums) {\n        // Write sort here\n    }\n}`;
    } else if (tLower.includes('subsets') || tLower.includes('permutations')) {
      sampleInput = "nums = [1, 2]";
      sampleOutput = "[[], [1], [2], [1, 2]]";
      template = `import java.util.*;\n\npublic class Solution {\n    public List<List<Integer>> ${method}(int[] nums) {\n        List<List<Integer>> res = new ArrayList<>();\n        // Write collection logic here\n        return res;\n    }\n}`;
    } else {
      sampleInput = "nums = [1, 2, 3]";
      sampleOutput = "6";
      template = `public class Solution {\n    public int ${method}(int[] nums) {\n        // Write logic here\n        return 0;\n    }\n}`;
    }
  }

  // Double check that template has correct Solution class wraps
  if (!template.includes('public class Solution')) {
    template = `public class Solution {\n    ${template.trim().replace(/^/gm, '    ')}\n}`;
  }

  return {
    problemStatement: statement,
    sampleInput,
    sampleOutput,
    codeTemplate: template,
    hint1,
    hint2
  };
}

// Dry run audit validation logic
function auditOne(p, rebuilt) {
  const title = p.title.trim();
  const statement = rebuilt.problemStatement.trim();
  const input = rebuilt.sampleInput.trim();
  const output = rebuilt.sampleOutput.trim();
  const template = rebuilt.codeTemplate.trim();
  const tLower = title.toLowerCase();
  const sLower = statement.toLowerCase();
  const iLower = input.toLowerCase();
  const oLower = output.toLowerCase();

  let topicsArr = [];
  if (Array.isArray(p.topics)) {
    topicsArr = p.topics.map(t => typeof t === 'string' ? t : t.name);
  } else if (p.topic) {
    topicsArr.push(p.topic);
  }
  if (Array.isArray(p.tags)) {
    topicsArr = topicsArr.concat(p.tags);
  }
  let hasTopic = (topicName) => topicsArr.some(t => t.toLowerCase() === topicName.toLowerCase() || t.toLowerCase() === topicName.toLowerCase() + 's');

  let isPattern = tLower.includes('pattern') || topicsArr.some(t => t.toLowerCase() === 'patterns' || t.toLowerCase() === 'pattern printing');
  let isGraph = tLower.includes('graph') || tLower.includes('bfs') || tLower.includes('dfs') || tLower.includes('dijkstra') || tLower.includes('bellman') || tLower.includes('floyd') || tLower.includes('kruskal') || tLower.includes('prim') || tLower.includes('bipartite') || tLower.includes('topological') || tLower.includes('alien dictionary') || tLower.includes('islands') || topicsArr.some(t => t.toLowerCase().includes('graph') || t.toLowerCase().includes('network') || t.toLowerCase().includes('disjoint') || t.toLowerCase().includes('mst'));
  let isTree = !isGraph && (tLower.includes('tree') || tLower.includes('bst') || tLower.includes('inorder') || tLower.includes('preorder') || tLower.includes('postorder') || tLower.includes('traversal') || tLower.includes('same tree') || tLower.includes('symmetric tree') || hasTopic('Binary Tree') || hasTopic('BST') || hasTopic('Tree'));
  let isLinkedList = !isGraph && !isTree && (tLower.includes('linked list') || tLower.includes('list node') || tLower.includes('intersection of two') || tLower.includes('reverse linked list') || tLower.includes('middle of') || tLower.includes('list cycle') || tLower.includes('remove duplicates from sorted list') || tLower.includes('merge two sorted lists') || hasTopic('Linked List'));
  let isMatrix = tLower.includes('matrix') || tLower.includes('grid') || tLower.includes('spiral') || tLower.includes('sudoku') || tLower.includes('rotate image') || hasTopic('Matrix') || hasTopic('2d array');
  let isString = !isTree && !isLinkedList && !isGraph && (tLower.includes('string') || tLower.includes('char') || tLower.includes('anagram') || tLower.includes('parenthes') || tLower.includes('bracket') || tLower.includes('roman') || tLower.includes('prefix') || tLower.includes('morse') || tLower.includes('sentence') || tLower.includes('word') || hasTopic('Strings'));
  let isMath = tLower.includes('math') || tLower.includes('gcd') || tLower.includes('lcm') || tLower.includes('prime') || tLower.includes('divisor') || tLower.includes('armstrong') || tLower.includes('fibonacci') || tLower.includes('factorial') || tLower.includes('power') || tLower.includes('digits') || tLower.includes('bit') || hasTopic('Math') || hasTopic('Bit Manipulation');
  let isBasicSyntax = p.category === 'Java' || hasTopic('Basic Syntax') || hasTopic('Control Flow') || hasTopic('Loops') || hasTopic('Functions') || hasTopic('Recursion');

  // 1. Placeholder Check
  if (!statement || sLower.includes('premium leetcode') || sLower.includes('premium coding challenge') || sLower.includes('coding challenge for') || sLower.includes('description will be enriched') || statement.includes('To be provided')) {
    return 'Placeholder description present';
  }
  if (!input || iLower.includes('input parameter') || iLower.includes('input choice') || iLower.includes('input data') || iLower.includes('refer to editorial') || input.includes('To be provided')) {
    return 'Placeholder or generic input present';
  }
  if (!output || oLower.includes('expected output') || oLower.includes('calculated result') || oLower.includes('decision outcome') || oLower.includes('recursive result') || oLower.includes('success') || output.includes('To be provided')) {
    return 'Placeholder or generic output present';
  }

  // 2. Title <=> Description Match
  if (isPattern && !sLower.includes('pattern') && !sLower.includes('loop')) {
    return 'Pattern title but description does not match';
  }
  if (isLinkedList && !sLower.includes('list') && !sLower.includes('head') && !sLower.includes('node')) {
    return 'Linked List title but description does not match';
  }
  if (isTree && !sLower.includes('tree') && !sLower.includes('root') && !sLower.includes('bst') && !sLower.includes('node')) {
    return 'Tree title but description does not match';
  }
  if (isGraph && !sLower.includes('graph') && !sLower.includes('vertex') && !sLower.includes('edge') && !sLower.includes('path') && !sLower.includes('bfs') && !sLower.includes('dfs')) {
    return 'Graph title but description does not match';
  }

  // 3. Description <=> Examples Match & Generic Array Fallback check
  if (isTree && !iLower.includes('root =')) {
    return 'Tree problem but sample input does not have root';
  }
  if (isLinkedList && !iLower.includes('head =') && !iLower.includes('l1 =') && !iLower.includes('list1 =')) {
    return 'Linked List problem but sample input does not have head, l1 or list1';
  }
  if (isPattern && (iLower.includes('nums =') || iLower.includes('[1, 2, 3') || oLower.includes('[1, 2, 3'))) {
    return 'Pattern problem has array input/output fallback';
  }
  if (isBasicSyntax && !isPattern && (iLower.includes('nums =') || iLower.includes('[1, 2, 3') || oLower.includes('[1, 2, 3')) && !tLower.includes('array') && !tLower.includes('elements') && !tLower.includes('sort')) {
    return 'Basic syntax problem has generic array fallback';
  }
  if (isString && iLower.includes('nums =')) {
    return 'String problem has array input fallback';
  }
  if (isMath && iLower.includes('nums =') && !tLower.includes('array') && !tLower.includes('subsets') && !tLower.includes('primes')) {
    return 'Math problem has array input fallback';
  }

  // 4. Template <=> Problem Type Match & Generic solve(int[] nums) templates
  if (isLinkedList && !template.includes('ListNode')) {
    return 'Linked List problem template does not define/use ListNode';
  }
  if (isTree && !template.includes('TreeNode')) {
    return 'Tree problem template does not define/use TreeNode';
  }
  if (isPattern && template.includes('int[] nums')) {
    return 'Pattern problem template has generic int[] nums parameter';
  }
  if (isBasicSyntax && !isPattern && template.includes('int[] nums') && !tLower.includes('array') && !tLower.includes('elements') && !tLower.includes('sort')) {
    return 'Basic syntax template has generic int[] nums parameter';
  }
  if (template.includes('public int solve(int[] nums)') && !tLower.includes('array') && !isLinkedList && !isTree && !tLower.includes('nums') && !tLower.includes('sort') && !tLower.includes('subarray')) {
    return 'Generic solve(int[] nums) template used';
  }

  // 5. Constraints Present
  if (!sLower.includes('constraints') && !sLower.includes('boundary') && !sLower.includes('bounds') && !sLower.includes('limit') && !statement.includes('1 <=') && !statement.includes('0 <=') && !statement.includes('-10^') && !statement.includes('Constraints:')) {
    return 'Constraints section is missing from problem statement';
  }

  return null;
}

function runDryRun() {
  const canonical = JSON.parse(fs.readFileSync(path.join(__dirname, 'canonical_inventory.json'), 'utf8'));
  console.log(`Loaded ${canonical.length} canonical problems from inventory.`);

  let passed = 0;
  let failed = 0;
  const failures = [];

  canonical.forEach(p => {
    const rebuilt = generateProperties(p);
    const err = auditOne(p, rebuilt);
    if (err) {
      failed++;
      failures.push({
        title: p.title,
        category: p.category,
        issue: err,
        input: rebuilt.sampleInput,
        output: rebuilt.sampleOutput,
        template: rebuilt.codeTemplate.substring(0, 100) + '...'
      });
    } else {
      passed++;
    }
  });

  console.log(`\n=== DRY RUN VALIDATION RESULTS ===`);
  console.log(`Passed: ${passed} / ${canonical.length} (${((passed/canonical.length)*100).toFixed(1)}%)`);
  console.log(`Failed: ${failed} / ${canonical.length} (${((failed/canonical.length)*100).toFixed(1)}%)`);

  if (failed > 0) {
    console.log('\nSample Failures:');
    failures.slice(0, 20).forEach((f, idx) => {
      console.log(`[${idx+1}] Title: "${f.title}" | Issue: "${f.issue}"`);
      console.log(`   Input: "${f.input}"`);
      console.log(`   Output: "${f.output}"`);
      console.log(`   Template: "${f.template}"`);
    });
  }
}

runDryRun();
