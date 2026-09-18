const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.wtpbmpxwiasbnngciwye:Akshayam%40777@aws-1-ap-south-1.pooler.supabase.com:5432/postgres' });
client.connect()
  .then(() => client.query('ALTER TABLE "User" ADD COLUMN "paymentDone" BOOLEAN NOT NULL DEFAULT false;'))
  .then(() => console.log('Column paymentDone added successfully!'))
  .catch(console.error)
  .finally(() => client.end());
