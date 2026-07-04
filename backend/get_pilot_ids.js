const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getIds() {
  try {
    const titles = [
      "Two Sum",
      "3 Sum",
      "Kadane's Algorithm",
      "Reverse words in a given string",
      "Check if a tree is a BST or not", // Check if this is the correct title
      "LCA in BST",
      "Diameter of Binary Tree",
      "Djisktra's Algorithm",
      "Number of islands II",
      "Course Schedule I",
      "Reverse Nodes in k-Group",
      "LRU Cache",
      "Add two numbers in Linked List",
      "Delete all occurrences of a key in DLL",
      "Climbing Stairs",
      "Coin Change 2 (DP - 22)",
      "Longest Common Subsequence",
      "Pattern 1",
      "Pattern 6",
      "Pattern 16"
    ];

    for (const title of titles) {
      const p = await prisma.problem.findFirst({
        where: { title: { equals: title, mode: 'insensitive' } }
      });
      if (p) {
        console.log(`Found: "${p.title}" | ID: ${p.id} | Slug: ${p.slug}`);
      } else {
        console.log(`NOT Found: "${title}"`);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

getIds();
