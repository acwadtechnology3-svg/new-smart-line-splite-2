import { supabase } from '../config/supabase';
import bcrypt from 'bcrypt';

async function createAdminUser() {
  try {
    const username = 'admin';
    const email = 'admin@smartline.com';
    const password = 'admin123';
    const role = 'super_admin';

    console.log(`Creating dashboard user with username: ${username}`);

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert or update user
    const { data, error } = await supabase
      .from('dashboard_users')
      .upsert({
        email: email,
        password_hash: passwordHash,
        full_name: username,
        role: role,
        is_active: true,
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating admin user:', error);
      return;
    }

    console.log('✅ Admin user created/updated successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Login Credentials:');
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('User Details:', data);
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

createAdminUser();
