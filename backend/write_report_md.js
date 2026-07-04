const fs = require('fs');
const path = require('path');

const report = JSON.parse(fs.readFileSync(path.join(__dirname, 'recovery_audit_report.json'), 'utf8'));

let md = `# Content Recovery & Database Quality Audit Report

This report presents the Phase 1, 2, and 3 recovery-first inventory results. No modifications have been made to the database, and no seeding or deletion has occurred.

---

## Original JavaFX Metadata Verification

We inspected the original JavaFX codebase:
1. **Database Schema (\`database.sql\`):** Confirmed to contain only 6 unique coding challenges.
2. **Resources (\`src/main/resources/frontend\`):** Contains FXML views and Striver JSON data lists, but does not contain any richer coding question metadata.
3. **Source Code (\`SessionManager.java\` / \`StriverManager.java\`):** Confirmed that the original application simulated the 1,005 questions dynamically by appending suffix integers (e.g. \`3Sum 2\`) and using generic template fallbacks.

**Conclusion:** The original JavaFX project does not contain any richer metadata than what we have extracted.

---

## Phase 1: Title Recovery Inventory

* **Total Scanned Titles (All Sources):** ${report.phase1.totalScanCount}
* **Unique Recovered Titles (Canonical):** ${report.phase1.uniqueCount}
* **Overlaps between Sources:** ${report.phase1.overlapsCount}
* **Canonical Titles Missing/Misaligned in PostgreSQL:** ${report.phase1.missingCount}

### Source Overlaps (20 Titles)
These titles exist in multiple sources and will be merged into single canonical records:
${report.phase1.overlapsList.map(o => `- **${o.title}** (Found in: ${o.sources.join(', ')})`).join('\n')}

### Canonical Titles Missing / Misaligned in current PostgreSQL (14 Titles)
These titles represent casing misalignments or skipped indexes (off-by-one index starting bug at ID 7 in original FX generator):
${report.phase1.missingList.map(m => `- **${m.title}** (Case-aligned match in PG: \`${m.caseInsensitiveMatch}\`)`).join('\n')}

---

## Phase 2: Classification of Canonical Titles

Out of the **${report.phase1.uniqueCount}** canonical titles, the breakdown by origin is:
* **Striver A2Z Sheet:** 473 titles
* **LeetCode Base List:** 76 titles
* **Basic Syntax List:** 104 titles
* **Custom JavaFX DB:** 6 titles

<details>
<summary><b>Click to expand the full list of 659 Canonical Titles and Classifications</b></summary>

| Title | Classification |
| :--- | :--- |
${report.phase2.classifiedList.map(item => `| ${item.title} | ${item.classification} |`).join('\n')}

</details>

---

## Phase 3: Current PostgreSQL Database Quality Issues

A scan of the **1,454** active problems in the PostgreSQL database revealed the following quality issues:

* **Questions with Placeholder Descriptions:** ${report.phase3.placeholderDescriptionsCount}
* **Questions with Incorrect/Fallback Sample Inputs:** ${report.phase3.incorrectSampleInputsCount}
* **Questions with Incorrect/Fallback Sample Outputs:** ${report.phase3.incorrectSampleOutputsCount}
* **Questions with Generic Code Templates:** ${report.phase3.genericTemplatesCount}
* **Questions that are Duplicate Suffix Clones:** ${report.phase3.duplicateClonesCount}

### Samples of Duplicate Clones to be Deleted (Top 15)
${report.phase3.duplicateClonesSample.slice(0, 15).map(d => `- \`${d.title}\` (ID: ${d.id})`).join('\n')}

### Samples of Placeholder Descriptions to be Cleaned (Top 10)
${report.phase3.placeholderDescriptionsSample.slice(0, 10).map(p => `- **${p.title}**: *"${p.statement}"*`).join('\n')}

### Samples of Incorrect Sample Inputs (Top 10)
${report.phase3.incorrectSampleInputsSample.slice(0, 10).map(i => `- **${i.title}**: Input: \`${i.input.replace(/\n/g, ' ')}\` ${i.reason ? `(*${i.reason}*)` : ''}`).join('\n')}

### Samples of Generic Code Templates (Top 10)
${report.phase3.genericTemplatesSample.slice(0, 10).map(g => `- **${g.title}**: \`${g.template.replace(/\n/g, ' ')}\``).join('\n')}
`;

const artifactPath = path.join('C:', 'Users', 'traya', '.gemini', 'antigravity', 'brain', 'f30557f1-256e-4b6d-91cb-b5e844c38fc1', 'recovery_report.md');
fs.writeFileSync(artifactPath, md);
console.log('Successfully wrote recovery_report.md');
