const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Ensure import includes getTenantDb
      if (content.includes("import { db } from '@/db'") || content.includes("import { db } from \"@/db\"")) {
         content = content.replace(/import\s+{\s*([^}]*?)\b(db)\b([^}]*?)\s*}\s+from\s+['"]@\/db['"]/g, "import { $1getTenantDb$3 } from '@/db'");
         changed = true;
      } else if (content.includes("from '@/db'") || content.includes("from \"@/db\"") && !content.includes("getTenantDb")) {
         content = content.replace(/import\s+{\s*(.*?)\s*}\s+from\s+['"]@\/db['"]/g, "import { $1, getTenantDb } from '@/db'");
         changed = true;
      }

      // We only convert if session.organizationId exists in the file, or we pass a mock for now
      if (changed) {
          // Find if session is available in the route, which it usually is!
          if (content.includes("session.organizationId")) {
              // Now replace usage of db.* with await getTenantDb(session.organizationId).*
              // Only for db.select, db.insert, db.update, db.delete, db.transaction
              content = content.replace(/\bdb\.(select|insert|update|delete|transaction)\b/g, "getTenantDb(session.organizationId).$1");
          } else {
              // If there's no session, we skip or use a default
              // For files where it's not straightforward, we omit or let it break and fix manually
              content = content.replace(/\bdb\.(select|insert|update|delete|transaction)\b/g, "getTenantDb('system').$1");
          }
          fs.writeFileSync(fullPath, content);
          console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
processDir(path.join(__dirname, 'scripts'));
