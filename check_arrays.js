const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres.wtpbmpxwiasbnngciwye:Akshayam%40777@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true' }); 
async function main() { 
  await client.connect(); 
  const res = await client.query('SELECT "id", "jathagamData" FROM "Profile" WHERE "jathagamData" IS NOT NULL'); 
  for (const row of res.rows) {
    const rasi = row.jathagamData?.rasiChart;
    if (Array.isArray(rasi)) {
      console.log("Found Array:", row.id, JSON.stringify(rasi));
    }
  }
  console.log("Done checking arrays.");
  await client.end(); 
} 
main().catch(console.error);
