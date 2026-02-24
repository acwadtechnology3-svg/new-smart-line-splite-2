
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection to:', connectionString?.split('@')[1]); // Log host only for safety

const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    try {
        const start = Date.now();
        const client = await pool.connect();
        console.log('✅ Connected in', Date.now() - start, 'ms');
        const res = await client.query('SELECT NOW()');
        console.log('✅ Query success:', res.rows[0]);
        client.release();
    } catch (err) {
        console.error('❌ Connection failed:', err);
    } finally {
        await pool.end();
    }
}

test();
