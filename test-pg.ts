import { config } from 'dotenv';
config();
import pg from 'pg';
const connectionString = process.env.DATABASE_URL;
const configObj = new pg.Pool({ connectionString }).options;
console.log(configObj.password, typeof configObj.password);
