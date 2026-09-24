const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres.wtpbmpxwiasbnngciwye:Akshayam%40777@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true' }); 
async function main() { 
  await client.connect(); 
  const res = await client.query('SELECT "id", "jathagamData", "rasiGrid" FROM "Profile"'); 
  const emptyCharts = res.rows.filter(r => !r.jathagamData?.rasiChart && !r.jathagamData?.rasiGrid && !r.rasiGrid);
  console.log("Profiles with no chart data:", emptyCharts.length);
  if (emptyCharts.length > 0) {
     console.log("Example:", emptyCharts[0].id);
  }
  const emptyObjectCharts = res.rows.filter(r => {
     const chart = r.jathagamData?.rasiChart || r.jathagamData?.rasiGrid || r.rasiGrid;
     return chart && typeof chart === 'object' && Object.keys(chart).length === 0;
  });
  console.log("Profiles with empty object chart data:", emptyObjectCharts.length);
  if (emptyObjectCharts.length > 0) {
     console.log("Example:", emptyObjectCharts[0].id);
  }
  await client.end(); 
} 
main().catch(console.error);
