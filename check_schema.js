const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.wtpbmpxwiasbnngciwye:Akshayam%40777@aws-1-ap-south-1.pooler.supabase.com:5432/postgres' });
client.connect()
  .then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name='User'"))
  .then(res => console.log(res.rows.map(r => r.column_name)))
  .catch(console.error)
  .finally(() => client.end());
