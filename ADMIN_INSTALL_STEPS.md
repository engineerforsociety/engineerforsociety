# ⚡ Admin Setup - Step by Step

## Step 1: Open the SQL File
Open the file: `admin_auth_schema.sql` in your editor

## Step 2: Copy THE SQL CODE ONLY
**IMPORTANT:** Copy ONLY the SQL code (starting from line 1 with "--")
❌ DON'T copy any bash commands or markdown text!

## Step 3: Run in Supabase
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Paste the SQL code
6. Click "Run" or press Ctrl+Enter

## Step 4: Verify It Worked
After running, you should see:
- ✅ "Success. No rows returned"
OR
- ✅ Some success message

If you see an error, check that:
- You copied ONLY the SQL (no # comments)
- The SQL Editor is open (not terminal)
- You're in the correct Supabase project

## Step 5: Access Admin Panel
Once the SQL runs successfully:

**Login URL:** http://localhost:9002/admin/login

**Credentials:**
- Email: `admin@engineerforsociety.com`
- Password: `admin123`

## Step 6: Change Password!
⚠️ After first login, change the default password for security!

---

## ❓ Troubleshooting

**Error: "syntax error at or near #"**
→ You copied bash comments. Copy ONLY the SQL code from the .sql file.

**Error: "relation already exists"**
→ The tables already exist. This is OK! Try logging in directly.

**Cannot login**
→ Verify the SQL ran successfully first. Check for error messages.

**"Invalid credentials"**
→ Make sure you're using:
  - Email: admin@engineerforsociety.com
  - Password: admin123

---

## 📝 What Gets Created

The SQL creates these tables:
1. `admin_credentials` - Stores admin email/password
2. `admin_sessions` - Manages login sessions

Your existing `admins` table (linked to Google OAuth) remains unchanged.

---

## 🎯 Next Steps

After successful login:
1. ✅ Change your password
2. ✅ Explore the admin dashboard
3. ✅ Start managing your platform!
