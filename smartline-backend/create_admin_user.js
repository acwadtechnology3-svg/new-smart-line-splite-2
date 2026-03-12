const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createAdminUser() {
  const client = await pool.connect();
  try {
    const email = "admin@smartline.com";
    const password = "admin123";
    const username = "admin"; // This is stored in full_name
    const role = "super_admin";

    console.log(`Creating dashboard user with username: ${username}`);

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert or update user
    const res = await client.query(
      `INSERT INTO public.dashboard_users (email, password_hash, full_name, role, is_active)
             VALUES ($1, $2, $3, $4, true)
             ON CONFLICT (email) DO UPDATE 
             SET password_hash = $2, role = $4, full_name = $3, is_active = true
             RETURNING id, email, full_name, role`,
      [email, passwordHash, username, role],
    );

    console.log("✅ Admin user created/updated successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Login Credentials:");
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("User Details:", res.rows[0]);
  } catch (err) {
    console.error("❌ Error creating admin user:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminUser();
