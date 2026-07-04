const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runVerify() {
  try {
    console.log('Fetching all problems from PrepFlow database for audit...');
    const problems = await prisma.problem.findMany({
      include: { topics: true }
    });
    console.log(`Loaded ${problems.length} problems for audit.`);

    let passedCount = 0;
    let failedCount = 0;
    const failures = [];

    for (const p of problems) {
      const title = p.title.trim();
      const statement = p.problemStatement ? p.problemStatement.trim() : '';
      const input = p.sampleInput ? p.sampleInput.trim() : '';
      const output = p.sampleOutput ? p.sampleOutput.trim() : '';
      const template = p.codeTemplate ? p.codeTemplate.trim() : '';
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

      let isPattern = tLower.startsWith('pattern') || tLower.includes('pattern:') || topicsArr.some(t => t.toLowerCase() === 'patterns' || t.toLowerCase() === 'pattern printing');
      
      let isGraph = tLower.includes('graph') || tLower.includes('bfs') || tLower.includes('dfs') || 
                    tLower.includes('dijkstra') || tLower.includes('bellman') || tLower.includes('floyd') || 
                    tLower.includes('kruskal') || tLower.includes('prim') || tLower.includes('bipartite') || 
                    tLower.includes('topological') || tLower.includes('alien dictionary') || tLower.includes('islands') || 
                    tLower.includes('island') || tLower.includes('province') || tLower.includes('provinces') || 
                    tLower.includes('disjoint') || /\bmst\b/.test(tLower) || tLower.includes('cheapest flights') || 
                    tLower.includes('shortest path') || tLower.includes('word ladder') || tLower.includes('surrounded regions') || 
                    tLower.includes('strongly connected') || tLower.includes('tarjan') ||
                    topicsArr.some(t => t.toLowerCase().includes('graph') || t.toLowerCase().includes('network') || t.toLowerCase().includes('disjoint') || /\bmst\b/.test(t.toLowerCase()) || t.toLowerCase().includes('union find'));
      
      let isTree = !isGraph && (
                    tLower.includes('tree') || tLower.includes('bst') || tLower.includes('inorder') || 
                    tLower.includes('preorder') || tLower.includes('postorder') || tLower.includes('traversal') || 
                    tLower.includes('same tree') || tLower.includes('symmetric tree') || tLower.includes('lca') || 
                    tLower.includes('ancestor') || (tLower.includes('root') && !tLower.includes('square root') && !tLower.includes('cube root')) ||
                    hasTopic('Binary Tree') || hasTopic('BST') || hasTopic('Tree')
                  );
      
      let isLinkedList = !isGraph && !isTree && (
                          tLower.includes('linked list') || tLower.includes('list node') || 
                          tLower.includes('intersection of two') || tLower.includes('reverse linked list') || 
                          tLower.includes('middle of') || tLower.includes('list cycle') || 
                          tLower.includes('remove duplicates from sorted list') || tLower.includes('merge two sorted lists') || 
                          /\bll\b/.test(tLower) || /\bdll\b/.test(tLower) || tLower.includes('head node') ||
                          tLower.includes('node in a list') || tLower.includes('nodes in k-group') ||
                          tLower.includes('lru cache') || tLower.includes('lfu cache') ||
                          tLower.includes('flattening a linked') || tLower.includes('flatten list') ||
                          hasTopic('Linked List')
                        );
      
      let isMatrix = tLower.includes('matrix') || tLower.includes('grid') || tLower.includes('spiral') || 
                     tLower.includes('sudoku') || tLower.includes('rotate image') || tLower.includes('set matrix zeroes') || 
                     tLower.includes('search a 2d matrix') || tLower.includes('row with max 1s') || 
                     hasTopic('Matrix') || hasTopic('2d array') || hasTopic('grid');
      
      let isString = !isTree && !isLinkedList && !isGraph && (
                      tLower.includes('string') || tLower.includes('char') || tLower.includes('anagram') || 
                      tLower.includes('parenthes') || tLower.includes('bracket') || tLower.includes('roman') || 
                      tLower.includes('prefix') || tLower.includes('morse') || tLower.includes('sentence') || 
                      tLower.includes('word') || tLower.includes('reverse words') || tLower.includes('substring') || 
                      tLower.includes('longest common prefix') || tLower.includes('atoi') || tLower.includes('strstr') || 
                      tLower.includes('isomorphic') || hasTopic('Strings') || hasTopic('string')
                    );
      
      let isMath = tLower.includes('math') || tLower.includes('gcd') || tLower.includes('lcm') || 
                   tLower.includes('prime') || tLower.includes('divisor') || tLower.includes('armstrong') || 
                   tLower.includes('fibonacci') || tLower.includes('factorial') || tLower.includes('power') || 
                   tLower.includes('digits') || tLower.includes('bit') || tLower.includes('number of digits') || 
                   tLower.includes('power of two') || tLower.includes('count primes') || tLower.includes('sum of two') || 
                   tLower.includes('ncr') || tLower.includes('npr') || tLower.includes("pascal's triangle") || 
                   tLower.includes('happy number') || hasTopic('Math') || hasTopic('Bit Manipulation');
      
      let isBasicSyntax = p.category === 'Java' || hasTopic('Basic Syntax') || hasTopic('Control Flow') || 
                          hasTopic('Loops') || hasTopic('Functions') || hasTopic('Recursion');

      let issue = null;

      // 1. Placeholder Check
      if (!statement || sLower.includes('premium leetcode') || sLower.includes('premium coding challenge') || sLower.includes('coding challenge for') || sLower.includes('description will be enriched') || statement.includes('To be provided')) {
        issue = 'Placeholder description present';
      }
      else if (!input || iLower.includes('input parameter') || iLower.includes('input choice') || iLower.includes('input data') || iLower.includes('refer to editorial') || input.includes('To be provided')) {
        issue = 'Placeholder or generic input present';
      }
      else if (!output || oLower.includes('expected output') || oLower.includes('calculated result') || oLower.includes('decision outcome') || oLower.includes('recursive result') || oLower.includes('success') || output.includes('To be provided')) {
        issue = 'Placeholder or generic output present';
      }

      // 2. Title <=> Description Match
      else if (isPattern && !sLower.includes('pattern') && !sLower.includes('loop')) {
        issue = 'Pattern title but description does not match';
      }
      else if (isLinkedList && !sLower.includes('list') && !sLower.includes('head') && !sLower.includes('node')) {
        issue = 'Linked List title but description does not match';
      }
      else if (isTree && !sLower.includes('tree') && !sLower.includes('root') && !sLower.includes('bst') && !sLower.includes('node')) {
        issue = 'Tree title but description does not match';
      }
      else if (isGraph && !sLower.includes('graph') && !sLower.includes('vertex') && !sLower.includes('edge') && !sLower.includes('path') && !sLower.includes('bfs') && !sLower.includes('dfs')) {
        issue = 'Graph title but description does not match';
      }

      // 3. Description <=> Examples Match & Generic Array Fallback check
      else if (isTree && !iLower.includes('root =')) {
        issue = 'Tree problem but sample input does not have root';
      }
      else if (isLinkedList && !tLower.includes('cache') && !iLower.includes('head =') && !iLower.includes('l1 =') && !iLower.includes('list1 =')) {
        issue = 'Linked List problem but sample input does not have head, l1 or list1';
      }
      else if (isPattern && (iLower.includes('nums =') || iLower.includes('[1, 2, 3') || oLower.includes('[1, 2, 3'))) {
        issue = 'Pattern problem has array input/output fallback';
      }
      else if (isBasicSyntax && !isPattern && (iLower.includes('nums =') || iLower.includes('[1, 2, 3') || oLower.includes('[1, 2, 3')) && !tLower.includes('array') && !tLower.includes('elements') && !tLower.includes('sort')) {
        issue = 'Basic syntax problem has generic array fallback';
      }
      else if (isString && iLower.includes('nums =')) {
        issue = 'String problem has array input fallback';
      }
      else if (isMath && iLower.includes('nums =') && !tLower.includes('array') && !tLower.includes('subsets') && !tLower.includes('primes')) {
        issue = 'Math problem has array input fallback';
      }

      // 4. Template <=> Problem Type Match & Generic solve(int[] nums) templates
      else if (isLinkedList && !template.includes('ListNode')) {
        issue = 'Linked List problem template does not define/use ListNode';
      }
      else if (isTree && !template.includes('TreeNode')) {
        issue = 'Tree problem template does not define/use TreeNode';
      }
      else if (isPattern && template.includes('int[] nums')) {
        issue = 'Pattern problem template has generic int[] nums parameter';
      }
      else if (isBasicSyntax && !isPattern && template.includes('int[] nums') && !tLower.includes('array') && !tLower.includes('elements') && !tLower.includes('sort')) {
        issue = 'Basic syntax template has generic int[] nums parameter';
      }
      else if (template.includes('public int solve(int[] nums)') && !tLower.includes('array') && !isLinkedList && !isTree && !tLower.includes('nums') && !tLower.includes('sort') && !tLower.includes('subarray')) {
        issue = 'Generic solve(int[] nums) template used';
      }

      // 5. Constraints Present
      else if (!sLower.includes('constraints') && !sLower.includes('boundary') && !sLower.includes('bounds') && !sLower.includes('limit') && !p.problemStatement.includes('1 <=') && !p.problemStatement.includes('0 <=') && !p.problemStatement.includes('-10^') && !p.problemStatement.includes('Constraints:')) {
        issue = 'Constraints section is missing from problem statement';
      }

      if (issue) {
        failedCount++;
        failures.push({
          id: p.id,
          title: p.title,
          slug: p.slug,
          category: p.category,
          issue,
          input,
          output,
          template: template.substring(0, 100) + '...'
        });
      } else {
        passedCount++;
      }
    }

    console.log('\n=== AUDIT RESULTS ===');
    console.log(`Passed: ${passedCount} (${((passedCount/problems.length)*100).toFixed(1)}%)`);
    console.log(`Failed: ${failedCount} (${((failedCount/problems.length)*100).toFixed(1)}%)`);

    if (failedCount > 0) {
      console.log('\nTop 20 Failures:');
      failures.slice(0, 20).forEach((f, idx) => {
        console.log(`[${idx+1}] Title: "${f.title}" (${f.category}) | Issue: "${f.issue}"`);
        console.log(`   Input:  "${f.input}"`);
        console.log(`   Output: "${f.output}"`);
        console.log(`   Template: "${f.template}"`);
      });
    }

    const fs = require('fs');
    const path = require('path');
    fs.writeFileSync(path.join(__dirname, 'audit_results.json'), JSON.stringify(failures, null, 2));

  } catch (err) {
    console.error('Audit failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

runVerify();
