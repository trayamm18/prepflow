const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function audit() {
  try {
    const problems = await prisma.problem.findMany({
      orderBy: { title: 'asc' }
    });

    console.log(`Analyzing ${problems.length} problems...`);

    const badQuestions = [];
    const goodQuestions = [];

    for (const p of problems) {
      const reasons = [];
      const titleLower = p.title.toLowerCase();
      const statementLower = p.problemStatement.toLowerCase();
      const templateLower = p.codeTemplate.toLowerCase();
      const inputLower = p.sampleInput.toLowerCase();
      const outputLower = p.sampleOutput.toLowerCase();

      // 1. Description contains generic phrases
      const genericPhrases = [
        "implement the method",
        "array challenge",
        "tree challenge",
        "graph challenge",
        "linked list challenge",
        "optimize for o(",
        "optimize for $o("
      ];
      for (const phrase of genericPhrases) {
        if (statementLower.includes(phrase)) {
          reasons.push(`Statement contains generic phrase: "${phrase}"`);
        }
      }

      // 2. Generic sample input
      if (inputLower === "nums = [1, 2, 3]" || inputLower === "nums=[1,2,3]" || inputLower === "nums = [1,2,3]") {
        reasons.push(`Sample input is generic placeholder: "${p.sampleInput}"`);
      }

      // 3. Generic sample output
      if (p.sampleOutput.trim() === "6") {
        reasons.push(`Sample output is generic placeholder: "6"`);
      }

      // 4. Template contains generic "Write logic here" or similar
      if (
        templateLower.includes("write logic here") ||
        templateLower.includes("write query logic here") ||
        templateLower.includes("write union-find grid logic here")
      ) {
        reasons.push("Code template contains generic placeholder text like 'Write logic here'");
      }

      // 5. Template type / signature mismatches or constraints mismatch
      // Let's check some specific high-profile problems to see if their templates or examples are generic
      
      // Graph problems (e.g. Dijkstra, DFS, BFS) shouldn't take int[] nums and return int
      if (
        (titleLower.includes("dijkstra") || titleLower.includes("djisktra") || titleLower.includes("dfs") || titleLower.includes("bfs") || titleLower.includes("graph")) &&
        templateLower.includes("int[] nums") &&
        templateLower.includes("public int ")
      ) {
        reasons.push("Graph problem has generic array signature (int[] nums)");
      }

      // Tree problems (BST, Binary Tree) shouldn't take int[] nums and return int if they are not supposed to
      if (
        (titleLower.includes("binary tree") || titleLower.includes("bst") || titleLower.includes("lca")) &&
        !templateLower.includes("treenode") &&
        !titleLower.includes("array to bst") &&
        !titleLower.includes("convert sorted array")
      ) {
        // Check if template contains TreeNode
        reasons.push("Tree problem template missing TreeNode structure");
      }

      // Linked list problems (LL, DLL, LinkedList) should have ListNode or Node structure
      if (
        (titleLower.includes("linked list") || titleLower.includes(" dll") || titleLower.endsWith(" dll") || titleLower.includes(" ll") || titleLower.endsWith(" ll")) &&
        !templateLower.includes("listnode") &&
        !templateLower.includes("node")
      ) {
        reasons.push("Linked List problem template missing ListNode/Node structure");
      }

      // String problems shouldn't have int[] nums and return int
      if (
        (titleLower.includes("string") || titleLower.includes("anagram") || titleLower.includes("palindrome") || titleLower.includes("substring")) &&
        templateLower.includes("int[] nums") &&
        !titleLower.includes("array")
      ) {
        reasons.push("String problem has generic array signature (int[] nums)");
      }

      // 6. Generic constraints check
      if (
        statementLower.includes("1 <= nums.length <= 10^5") &&
        statementLower.includes("-10^9 <= nums[i] <= 10^9") &&
        (titleLower.includes("tree") || titleLower.includes("graph") || titleLower.includes("string") || titleLower.includes("dijkstra") || titleLower.includes("list"))
      ) {
        reasons.push("Problem constraints are generic array constraints, but title indicates a non-array data structure");
      }

      if (reasons.length > 0) {
        badQuestions.push({
          id: p.id,
          title: p.title,
          slug: p.slug,
          reasons: reasons
        });
      } else {
        goodQuestions.push(p);
      }
    }

    console.log(`=== AUDIT SUMMARY ===`);
    console.log(`Total problems: ${problems.length}`);
    console.log(`Total GOOD questions: ${goodQuestions.length}`);
    console.log(`Total BAD questions: ${badQuestions.length}`);
    console.log(`\nBAD QUESTIONS LIST:`);
    badQuestions.forEach((bq, index) => {
      console.log(`[${index + 1}] Title: "${bq.title}" | ID: ${bq.id} | Slug: ${bq.slug}`);
      bq.reasons.forEach(r => console.log(`  - ${r}`));
    });

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

audit();
