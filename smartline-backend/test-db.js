
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection to:', connectionString ? connectionString.split('@')[1] : 'MISSING');

const pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
});

async function test() {
    console.log('Starting pool.connect()...');
    try {
        const start = Date.now();
        const client = await pool.connect();
        console.log('✅ Connected successfully in', Date.now() - start, 'ms');
        const res = await client.query('SELECT NOW()');
        console.log('✅ Server time:', res.rows[0].now);
        client.release();
    } catch (err) {
        console.error('❌ Connection FAILED:', err.message);
        if (err.stack) console.error(err.stack);
    } finally {
        console.log('Closing pool...');
        await pool.end();
        process.exit();
    }
}

test();
