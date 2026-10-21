const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

const targetProvider = isPostgres ? 'postgresql' : 'sqlite';
const currentProvider = schema.includes('provider = "postgresql"') ? 'postgresql' : 'sqlite';

if (currentProvider !== targetProvider) {
  console.log(`🔄 Switching Prisma datasource provider from ${currentProvider} to ${targetProvider}...`);
  schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/, `provider = "${targetProvider}"`);
  fs.writeFileSync(schemaPath, schema, 'utf8');
  console.log(`✅ Schema updated to provider: ${targetProvider}`);
} else {
  console.log(`✅ Prisma schema already matching provider: ${targetProvider}`);
}
