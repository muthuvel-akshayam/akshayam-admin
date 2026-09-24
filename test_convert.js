const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres.wtpbmpxwiasbnngciwye:Akshayam%40777@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true' }); 

const convertLegacyGrid = (gridData) => {
    if (!gridData || typeof gridData !== 'object') return [];
    if (Array.isArray(gridData)) {
      return gridData.filter(h => h && typeof h.houseIndex === 'number' && Array.isArray(h.planets));
    }
  const houseMapping = {
    'meenam': 0, 'mesham': 1, 'rishabham': 2, 'mithunam': 3,
    'kadagam': 4, 'simmam': 5, 'kanni': 6, 'thulam': 7,
    'viruchigam': 8, 'dhanusu': 9, 'magaram': 10, 'kumbam': 11
  };
  const houses = [];
  for (const [key, planets] of Object.entries(gridData)) {
    let idx;
    if (!isNaN(Number(key))) {
      idx = Number(key);
    } else {
      idx = houseMapping[key.toLowerCase()];
    }
    if (idx !== undefined && Array.isArray(planets)) {
      houses.push({ houseIndex: idx, planets: planets.map(p => String(p)) });
    }
  }
  return houses;
};

async function main() { 
  await client.connect(); 
  const res = await client.query('SELECT "id", "jathagamData", "rasiGrid" FROM "Profile"'); 
  let emptyCount = 0;
  for (const row of res.rows) {
    const rawRasi = row.jathagamData?.rasiChart || row.jathagamData?.rasiGrid || row.rasiGrid;
    if (rawRasi && Object.keys(rawRasi).length > 0) {
       const parsed = convertLegacyGrid(rawRasi);
       if (parsed.length === 0) {
         console.log("FAILED to parse:", row.id, JSON.stringify(rawRasi));
         emptyCount++;
       }
    }
  }
  console.log("Total failed to parse:", emptyCount);
  await client.end(); 
} 
main().catch(console.error);
