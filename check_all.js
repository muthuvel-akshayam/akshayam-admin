const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres.wtpbmpxwiasbnngciwye:Akshayam%40777@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true' }); 
async function main() { 
  await client.connect(); 
  const res = await client.query('SELECT "id", "jathagamData" FROM "Profile" WHERE "jathagamData" IS NOT NULL'); 
  const formats = new Set();
  const examples = {};
  for (const row of res.rows) {
    const rasi = row.jathagamData?.rasiChart;
    if (!rasi) continue;
    let format = 'unknown';
    if (Array.isArray(rasi)) {
      if (rasi.length > 0 && rasi[0].houseIndex !== undefined) format = 'array_of_houseObjects';
      else if (rasi.length > 0 && Array.isArray(rasi[0])) format = 'array_of_arrays';
      else if (rasi.length === 0) format = 'empty_array';
      else format = 'array_of_unknown';
    } else if (typeof rasi === 'object') {
      const keys = Object.keys(rasi);
      if (keys.length === 0) format = 'empty_object';
      else if (keys.every(k => !isNaN(Number(k)))) format = 'object_numeric_keys';
      else if (keys.some(k => isNaN(Number(k)))) format = 'object_string_keys';
    } else if (typeof rasi === 'string') {
      format = 'string';
    }
    formats.add(format);
    if (!examples[format]) examples[format] = rasi;
  }
  console.log("Formats found:", Array.from(formats));
  console.log("Examples:");
  for (const f of formats) {
    console.log(`--- ${f} ---`);
    console.log(JSON.stringify(examples[f]).slice(0, 200));
  }
  await client.end(); 
} 
main().catch(console.error);
