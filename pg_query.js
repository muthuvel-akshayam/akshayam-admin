const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres.wtpbmpxwiasbnngciwye:Akshayam%40777@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true' }); 
async function main() { 
  await client.connect(); 
  const res = await client.query('SELECT "id", "jathagamData", "rasiGrid", "amsamGrid" FROM "Profile" WHERE "jathagamData" IS NOT NULL LIMIT 10'); 
  console.log(JSON.stringify(res.rows, null, 2)); 
  await client.end(); 
} 
main().catch(console.error);
