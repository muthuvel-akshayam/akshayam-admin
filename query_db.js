require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function main() {
  await client.connect();
  const res = await client.query('ALTER TABLE "SiteSettings" ADD COLUMN "latestUserId" TEXT;');
  console.log("Column added");
  await client.end();
}
main().catch(console.error);
