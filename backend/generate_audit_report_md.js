const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateReport() {
  try {
    const problems = await prisma.problem.findMany({
      orderBy: { title: 'asc' }
    });

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
          reasons.push(`Statement contains generic phrase: *"${phrase}"*`);
        }
      }

      // 2. Generic sample input
      if (inputLower === "nums = [1, 2, 3]" || inputLower === "nums=[1,2,3]" || inputLower === "nums = [1,2,3]") {
        reasons.push(`Sample input is generic placeholder: *"${p.sampleInput}"*`);
      }

      // 3. Generic sample output
      if (p.sampleOutput.trim() === "6") {
        reasons.push(`Sample output is generic placeholder: *"${p.sampleOutput}"*`);
      }

      // 4. Template contains generic "Write logic here" or similar
      if (
        templateLower.includes("write logic here") ||
        templateLower.includes("write query logic here") ||
        templateLower.includes("write union-find grid logic here")
      ) {
        reasons.push("Code template contains generic placeholder text like *'Write logic here'*");
      }

      // 5. Template type / signature mismatches or constraints mismatch
      if (
        (titleLower.includes("dijkstra") || titleLower.includes("djisktra") || titleLower.includes("dfs") || titleLower.includes("bfs") || titleLower.includes("graph")) &&
        templateLower.includes("int[] nums") &&
        templateLower.includes("public int ")
      ) {
        reasons.push("Graph problem has generic array signature *(int[] nums)*");
      }

      if (
        (titleLower.includes("binary tree") || titleLower.includes("bst") || titleLower.includes("lca")) &&
        !templateLower.includes("treenode") &&
        !titleLower.includes("array to bst") &&
        !titleLower.includes("convert sorted array")
      ) {
        reasons.push("Tree problem template missing *TreeNode* structure");
      }

      if (
        (titleLower.includes("linked list") || titleLower.includes(" dll") || titleLower.endsWith(" dll") || titleLower.includes(" ll") || titleLower.endsWith(" ll")) &&
        !templateLower.includes("listnode") &&
        !templateLower.includes("node")
      ) {
        reasons.push("Linked List problem template missing *ListNode/Node* structure");
      }

      if (
        (titleLower.includes("string") || titleLower.includes("anagram") || titleLower.includes("palindrome") || titleLower.includes("substring")) &&
        templateLower.includes("int[] nums") &&
        !titleLower.includes("array")
      ) {
        reasons.push("String problem has generic array signature *(int[] nums)*");
      }

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

    const reportPath = 'C:\\Users\\traya\\.gemini\\antigravity\\brain\\f30557f1-256e-4b6d-91cb-b5e844c38fc1\\generic_content_audit_report.md';
    let md = `# Generic/Generated Content Audit Report\n\n`;
    md += `This report lists the questions in the active database that still contain placeholder or generic patterns.\n\n`;
    md += `## Summary\n\n`;
    md += `* **Total Good Questions**: ${goodQuestions.length}\n`;
    md += `* **Total Bad Questions**: ${badQuestions.length}\n`;
    md += `* **Total Questions Audited**: ${problems.length}\n\n`;
    md += `## Bad Questions List\n\n`;

    badQuestions.forEach((bq, index) => {
      md += `### [${index + 1}] ${bq.title}\n`;
      md += `* **Database ID**: \`${bq.id}\`\n`;
      md += `* **Slug**: \`${bq.slug}\`\n`;
      md += `* **Reasons Flagged**:\n`;
      bq.reasons.forEach(r => {
        md += `  * ${r}\n`;
      });
      md += `\n---\n\n`;
    });

    fs.writeFileSync(reportPath, md);
    console.log(`Successfully generated audit report at ${reportPath}`);

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

generateReport();
