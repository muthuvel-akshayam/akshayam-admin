const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgresql://postgres.wtpbmpxwiasbnngciwye:Akshayam%40777@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true' }); 
client.connect()
.then(() => client.query('SELECT u.id, p.status FROM "User" u JOIN "Profile" p ON u.id = p."userId" WHERE p.status = \'PENDING\''))
.then(res => console.log(res.rows))
.catch(console.error)
.finally(() => client.end());
