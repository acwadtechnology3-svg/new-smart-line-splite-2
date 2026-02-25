import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

const PROFILE_PHOTO_PERMISSION_PREFIX = 'profile_photo_url:';

function normalizePermissions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => String(item || '').trim())
    .filter((item) => item.length > 0);
}

function extractProfilePhotoFromPermissions(input: unknown): string | null {
  const permissions = normalizePermissions(input);
  const entry = permissions.find((item) => item.startsWith(PROFILE_PHOTO_PERMISSION_PREFIX));
  if (!entry) return null;
  const value = entry.slice(PROFILE_PHOTO_PERMISSION_PREFIX.length).trim();
  return value.length > 0 ? value : null;
}

function setProfilePhotoInPermissions(input: unknown, profilePhotoUrl: string | null): string[] {
  const permissions = normalizePermissions(input).filter(
    (item) => !item.startsWith(PROFILE_PHOTO_PERMISSION_PREFIX)
  );
  const value = String(profilePhotoUrl || '').trim();
  if (value) {
    permissions.push(`${PROFILE_PHOTO_PERMISSION_PREFIX}${value}`);
  }
  return permissions;
}

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Check if user has any active trips
    const { data: activeTrips, error: tripError } = await supabase
      .from('trips')
      .select('id')
      .or(`customer_id.eq.${userId},driver_id.eq.${userId}`)
      .in('status', ['requested', 'accepted', 'arrived', 'started']);

    if (tripError) {
      return res.status(500).json({ error: 'Failed to check active trips' });
    }

    if (activeTrips && activeTrips.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete account while you have active trips. Please complete or cancel them first.' 
      });
    }

    // Soft delete - mark user as deleted
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        deleted_at: new Date().toISOString(),
        phone: `deleted_${Date.now()}_${userId}`, // Anonymize phone
        full_name: 'Deleted User',
        email: null
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to soft delete user:', updateError);
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    // Optionally delete auth user (requires admin privileges)
    // const { error: authError } = await supabase.auth.admin.deleteUser(userId);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err: any) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Admin hard delete: null trip FK references, remove driver row, delete user
export const adminHardDeleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };

    // Guard: do not allow deleting currently authenticated admin themselves via this route
    if (req.user?.id === userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Ensure user exists
    const { data: targetUser, error: fetchError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Block if active trips exist for this user as customer or driver
    const { data: activeTrips, error: tripError } = await supabase
      .from('trips')
      .select('id')
      .or(`customer_id.eq.${userId},driver_id.eq.${userId}`)
      .in('status', ['requested', 'accepted', 'arrived', 'started']);

    if (tripError) {
      console.error('[adminHardDeleteUser] trip check failed:', tripError);
      return res.status(500).json({ error: 'Failed to check active trips' });
    }

    if (activeTrips && activeTrips.length > 0) {
      return res.status(400).json({ error: 'Cannot delete account while active trips exist. Please complete or cancel them first.' });
    }

    // Null FK references in trips to avoid constraint violations
    await supabase.from('trips').update({ customer_id: null }).eq('customer_id', userId);
    await supabase.from('trips').update({ driver_id: null }).eq('driver_id', userId);

    // Clear search history ownership to avoid FK blocks
    await supabase.from('search_history').update({ user_id: null }).eq('user_id', userId);

    // Remove driver row if exists
    await supabase.from('drivers').delete().eq('id', userId);

    // Delete user
    const { error: deleteError } = await supabase.from('users').delete().eq('id', userId);
    if (deleteError) {
      console.error('[adminHardDeleteUser] failed to delete user:', deleteError);
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    res.json({ success: true, message: 'User fully removed' });
  } catch (err: any) {
    console.error('Admin hard delete user error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Admin-initiated soft delete (archive) for any user
export const adminArchiveUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };

    // Guard: do not allow deleting currently authenticated admin themselves via this route
    if (req.user?.id === userId) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Ensure user exists
    const { data: targetUser, error: fetchError } = await supabase
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (fetchError || !targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Block if active trips exist for this user as customer or driver
    const { data: activeTrips, error: tripError } = await supabase
      .from('trips')
      .select('id')
      .or(`customer_id.eq.${userId},driver_id.eq.${userId}`)
      .in('status', ['requested', 'accepted', 'arrived', 'started']);

    if (tripError) {
      console.error('[adminArchiveUser] trip check failed:', tripError);
      return res.status(500).json({ error: 'Failed to check active trips' });
    }

    if (activeTrips && activeTrips.length > 0) {
      return res.status(400).json({ error: 'Cannot delete account while active trips exist. Please complete or cancel them first.' });
    }

    // Soft delete/anonymize user
    const now = Date.now();
    const { error: updateError } = await supabase
      .from('users')
      .update({
        deleted_at: new Date().toISOString(),
        phone: `deleted_${now}_${userId}`,
        full_name: 'Deleted User',
        email: null,
        // optional flags
        status: 'inactive'
      })
      .eq('id', userId);

    if (updateError) {
      console.error('[adminArchiveUser] failed to soft delete user:', updateError);
      return res.status(500).json({ error: 'Failed to delete account' });
    }

    // If driver, mark offline in drivers table and clear sensitive fields
    if (targetUser.role === 'driver') {
      await supabase
        .from('drivers')
        .update({
          is_online: false,
          current_lat: null,
          current_lng: null,
          profile_photo_url: null,
        })
        .eq('id', userId);
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('Admin archive user error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Fetch user details
    const { data: user, error } = await supabase
      .from('users')
      .select('id, phone, full_name, email, role, balance, created_at, permissions')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user is a driver or just to be safe, try to fetch driver profile photo
    let profile_photo_url = extractProfilePhotoFromPermissions(user.permissions);
    if (user.role === 'driver') {
      const { data: driver } = await supabase
        .from('drivers')
        .select('profile_photo_url')
        .eq('id', userId)
        .single();

      if (driver?.profile_photo_url) {
        profile_photo_url = driver.profile_photo_url;
      }
    }

    // Combine data
    const { permissions: _permissions, ...safeUser } = user as any;
    const responseData = {
      ...safeUser,
      profile_photo_url
    };

    res.json({ user: responseData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { full_name, email, preferences, profile_photo_url } = req.body;

    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('role, permissions')
      .eq('id', userId)
      .single();

    if (currentUserError || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates: any = {};
    if (full_name) updates.full_name = full_name;
    if (email) updates.email = email;
    if (preferences) updates.preferences = preferences;
    if (profile_photo_url !== undefined) {
      updates.permissions = setProfilePhotoInPermissions(currentUser.permissions, profile_photo_url);
    }

    // Update 'users' table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (userError) {
      return res.status(400).json({ error: userError.message });
    }

    // Keep driver profile photo in sync for driver accounts.
    if (profile_photo_url !== undefined && currentUser.role === 'driver') {
      const { error: driverError } = await supabase
        .from('drivers')
        .update({ profile_photo_url })
        .eq('id', userId); // Assuming drivers table uses same ID as users (from auth.users/public.users)

      if (driverError) {
        console.error('Failed to update driver photo:', driverError);
        // We don't fail the whole request, but logging it is important
      }
    }

    const { permissions: _permissions, ...safeUserData } = userData as any;
    const responseUser = {
      ...safeUserData,
      profile_photo_url: profile_photo_url !== undefined
        ? (profile_photo_url || null)
        : extractProfilePhotoFromPermissions(userData?.permissions)
    };

    res.json({ success: true, user: responseUser });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
