const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const canonical = JSON.parse(fs.readFileSync(path.join(__dirname, 'canonical_inventory.json'), 'utf8'));
    const backup = JSON.parse(fs.readFileSync(path.join(__dirname, 'backup_db_json', 'problems_backup.json'), 'utf8'));
    const active = await prisma.problem.findMany();

    console.log('--- COMPARING PROBLEM INVENTORIES ---');
    console.log(`Canonical inventory count: ${canonical.length}`);
    console.log(`Backup problems count: ${backup.length}`);
    console.log(`Active PG problems count: ${active.length}`);

    // Map by normalized titles
    function normalize(t) {
      return t.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    const canonicalMap = new Map(canonical.map(c => [normalize(c.title), c]));
    const backupMap = new Map(backup.map(b => [normalize(b.title), b]));
    const activeMap = new Map(active.map(a => [normalize(a.title), a]));

    // Check which canonical problems are missing from active PG
    const missingInActive = [];
    for (const c of canonical) {
      if (!activeMap.has(normalize(c.title))) {
        missingInActive.push(c.title);
      }
    }
    console.log(`Canonical questions missing from active PG: ${missingInActive.length}`);
    if (missingInActive.length > 0) {
      console.log('Missing:', missingInActive);
    }

    // Check which active problems are NOT in canonical inventory
    const extraInActive = [];
    for (const a of active) {
      if (!canonicalMap.has(normalize(a.title))) {
        extraInActive.push(a.title);
      }
    }
    console.log(`Active PG questions NOT in canonical inventory: ${extraInActive.length}`);
    if (extraInActive.length > 0) {
      console.log('Extra:', extraInActive);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
