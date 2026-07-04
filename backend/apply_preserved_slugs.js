const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    console.log('=== RESTORING PRESERVED SLUGS TO ACTIVE DATABASE ===');
    
    // Load backup problems
    const backupProblems = JSON.parse(fs.readFileSync(path.join(__dirname, 'backup_db_json', 'problems_backup.json'), 'utf8'));
    
    // Normalization helper
    function normalize(t) {
      return t.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    const backupMap = new Map();
    backupProblems.forEach(p => {
      backupMap.set(normalize(p.title), p);
    });

    const activeProblems = await prisma.problem.findMany();
    
    let updateCount = 0;
    
    // Iterate over active problems and update their slugs if they differ from the backup
    for (const activeP of activeProblems) {
      const normTitle = normalize(activeP.title);
      if (backupMap.has(normTitle)) {
        const backupP = backupMap.get(normTitle);
        if (activeP.slug !== backupP.slug) {
          console.log(`Updating slug for "${activeP.title}": "${activeP.slug}" -> "${backupP.slug}"`);
          
          await prisma.problem.update({
            where: { id: activeP.id },
            data: { slug: backupP.slug }
          });
          updateCount++;
        }
      }
    }
    
    console.log(`\nSuccessfully updated slugs for ${updateCount} problems in active database.`);
    console.log('=== RESTORATION COMPLETED ===');
  } catch (err) {
    console.error('Error during slug restoration:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
