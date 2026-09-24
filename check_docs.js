const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres.wtpbmpxwiasbnngciwye:Akshayam%40777@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true' }); 
async function main() { 
  await client.connect(); 
  const res = await client.query(`SELECT documents, "jathagamData" FROM "Profile" WHERE id = 'a7497589-3ea7-456a-9ad5-2a8e4b17226c'`); 
  console.log(JSON.stringify(res.rows[0], null, 2)); 
  await client.end(); 
} 
main().catch(console.error);
