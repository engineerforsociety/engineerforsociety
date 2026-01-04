# 🔧 Fix "Invalid Credentials" Error

## Problem
You're getting "Invalid credentials" when trying to login with:
- Email: admin@engineerforsociety.com  
- Password: admin123

## Solution - Follow EXACTLY These Steps:

### Step 1: Verify Tables Exist
1. Open Supabase Dashboard → SQL Editor
2. Open the file `verify_admin_setup.sql`
3. Copy the first query:
   ```sql
   SELECT * FROM public.admin_credentials;
   ```
4. Paste and Run in Supabase SQL Editor

**Expected Result:** You should see 1 row with email 'admin@engineerforsociety.com'

**If you get an error:** The tables don't exist yet. Continue to Step 2.

**If you see the row:** Skip to Step 3.

### Step 2: Create Admin Tables (If Step 1 Failed)
1. Open the file `admin_auth_schema.sql`
2. Select ALL content (Ctrl+A)
3. Copy it (Ctrl+C)
4. Go to Supabase Dashboard → SQL Editor → New Query
5. Paste (Ctrl+V)
6. Click "Run" or press Ctrl+Enter
7. Wait for "Success" message
8. Go back to Step 1 to verify

### Step 3: Try Login Again
1. Go to: `http://localhost:9002/admin/login`
2. Enter:
   - Email: `admin@engineerforsociety.com`
   - Password: `admin123`
3. Click "Sign In"

### Step 4: Check Browser Console (If Still Failing)
1. Press F12 in your browser
2. Click "Console" tab
3. Try logging in again
4. Look for any red error messages
5. Share those error messages for help

## 🐛 Common Issues

**Issue:** "relation admin_credentials does not exist"
**Fix:** Run Step 2 above

**Issue:** "No rows found"  
**Fix:** The admin user wasn't inserted. Run this SQL:
```sql
INSERT INTO public.admin_credentials (email, password_hash, full_name, is_active)
VALUES (
    'admin@engineerforsociety.com',
    '$2b$10$iyAReUTVIsgwsDzmQ9t30.1cDt95BueZyf9mNHYe.Q.FSD774kEMwC',
    'System Administrator',
    TRUE
)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;
```

**Issue:** Password verification fails (shows in console)
**Fix:** The bcrypt hash might be wrong. Regenerate it:
```bash
node generate-admin-hash.js
```
Then update the SQL file with the new hash.

## 📞 Still Not Working?

Check your browser's Network tab (F12 → Network):
1. Clear the network log
2. Try logging in
3. Look for the `/api/admin/login` request
4. Click on it
5. Check the "Response" tab
6. Share what error message you see
