const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function computeMD5(content) {
  return crypto.createHash('md5').update(content).digest('hex');
}

async function runBackup() {
  try {
    const backupDir = path.join(__dirname, 'backup_db_json');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log('=== STARTING DB BACKUP ===');

    // 1. Export tables
    const users = await prisma.user.findMany();
    const problems = await prisma.problem.findMany({
      include: { topics: true, companies: true }
    });
    const submissions = await prisma.submission.findMany();
    const notes = await prisma.note.findMany();
    const progress = await prisma.problemProgress.findMany();

    const backupData = {
      users: { file: 'users_backup.json', data: users },
      problems: { file: 'problems_backup.json', data: problems },
      submissions: { file: 'submissions_backup.json', data: submissions },
      notes: { file: 'notes_backup.json', data: notes },
      progress: { file: 'progress_backup.json', data: progress }
    };

    const manifest = {
      timestamp: new Date().toISOString(),
      files: {}
    };

    for (const [key, val] of Object.entries(backupData)) {
      const filePath = path.join(backupDir, val.file);
      const jsonStr = JSON.stringify(val.data, null, 2);
      fs.writeFileSync(filePath, jsonStr);
      
      const checksum = computeMD5(jsonStr);
      manifest.files[key] = {
        file: val.file,
        path: filePath,
        recordCount: val.data.length,
        sizeBytes: fs.statSync(filePath).size,
        checksum: checksum
      };
      console.log(`Exported ${val.data.length} records to ${val.file} (Size: ${fs.statSync(filePath).size} bytes, Checksum: ${checksum})`);
    }

    // Write rollback_manifest.json to the artifact folder
    const artifactDir = 'C:\\Users\\traya\\.gemini\\antigravity\\brain\\f30557f1-256e-4b6d-91cb-b5e844c38fc1';
    const rollbackManifestPath = path.join(artifactDir, 'rollback_manifest.json');
    fs.writeFileSync(rollbackManifestPath, JSON.stringify(manifest, null, 2));
    console.log(`Rollback manifest generated at ${rollbackManifestPath}`);

    // Verify backup integrity
    console.log('\n=== VERIFYING BACKUP INTEGRITY ===');
    let integrityPassed = true;
    for (const [key, info] of Object.entries(manifest.files)) {
      const content = fs.readFileSync(info.path, 'utf8');
      const verifyChecksum = computeMD5(content);
      const parsed = JSON.parse(content);
      
      if (verifyChecksum !== info.checksum) {
        console.error(`  [FAIL] Checksum mismatch for ${key}!`);
        integrityPassed = false;
      } else if (parsed.length !== info.recordCount) {
        console.error(`  [FAIL] Record count mismatch for ${key}!`);
        integrityPassed = false;
      } else {
        console.log(`  [PASS] ${key} backup verified. (${info.recordCount} records, checksum: ${info.checksum})`);
      }
    }

    if (integrityPassed) {
      console.log('\n=== BACKUP INTEGRITY VERIFIED SUCCESSFULLY ===');
      
      // Generate backup report in markdown
      const reportPath = path.join(artifactDir, 'backup_report.md');
      let reportMd = `# Database Backup & Safeguards Report\n\n`;
      reportMd += `Backup executed and verified on: \`${manifest.timestamp}\`\n\n`;
      reportMd += `## Backup Metrics\n\n`;
      reportMd += `| Table | Backup File | Record Count | File Size (Bytes) | Checksum (MD5) | Verification |\n`;
      reportMd += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;
      for (const [key, info] of Object.entries(manifest.files)) {
        reportMd += `| **${key}** | \`${info.file}\` | ${info.recordCount} | ${info.sizeBytes} | \`${info.checksum}\` | **PASSED** |\n`;
      }
      reportMd += `\n## Rollback Safeguards\n`;
      reportMd += `All exported files are persisted in \`e:\\java interview projwct\\prepflow\\backend\\backup_db_json\\\`.\n`;
      reportMd += `The rollback manifest is saved at \`${rollbackManifestPath}\`.\n`;
      
      fs.writeFileSync(reportPath, reportMd);
      console.log(`Backup report written to ${reportPath}`);
    } else {
      console.error('\n=== BACKUP INTEGRITY VERIFICATION FAILED ===');
      process.exit(1);
    }

  } catch (err) {
    console.error('Backup failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBackup();
