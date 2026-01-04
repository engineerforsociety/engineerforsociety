# Admin Authentication System Setup

## 🔐 Overview
This admin system uses **email/password authentication** separate from regular user Google OAuth. Admins cannot be accessed by regular users.

## 📋 Setup Instructions

### Step 1: Run the SQL Schema
1. Open the file `admin_auth_schema.sql`
2. Copy all its contents
3. Go to your **Supabase Dashboard** → **SQL Editor**
4. Paste and **Run** the entire script

This will create:
- `admin_credentials` table (stores admin emails and password hashes)
- `admin_sessions` table (manages admin login sessions)
- One default admin account

### Step 2: Access the Admin Panel
1. **Login URL**: `http://localhost:9002/admin/login`
2. **Default Credentials**:
   - Email: `admin@engineerforsociety.com`
   - Password: `admin123`

### Step 3: ⚠️ IMPORTANT - Change Default Password
After first login, you **MUST** change the default password for security!

## 🔧 Features

### Security Features:
- ✅ Passwords are hashed with bcrypt (10 rounds)
- ✅ Session-based authentication with HTTP-only cookies
- ✅ 24-hour session expiration
- ✅ Separate from regular user authentication
- ✅ Row Level Security (RLS) prevents unauthorized access
- ✅ Admin sessions are stored in database

### Admin Dashboard Capabilities:
- 📊 View platform statistics
- 👥 User management
- 💬 Content moderation (posts, comments)
- 💼 Job posting management
- 📅 Event management
- ⚙️ System settings

## 🚀 Usage

### Accessing Admin Panel:
- Go to `/admin` or `/admin/login`
- Enter your email and password
- You'll be redirected to `/admin/dashboard`

### Logging Out:
- Click the "Logout" button in the admin dashboard header

### Adding New Admins:
Run this SQL query in Supabase (replace values):

\`\`\`sql
-- First, generate a password hash using the Node.js script:
-- node generate-admin-hash.js

-- Then insert the new admin:
INSERT INTO public.admin_credentials (email, password_hash, full_name, is_active)
VALUES (
    'newadmin@example.com',
    'your-generated-hash-here',
    'Admin Name',
    TRUE
);
\`\`\`

### Generating Password Hashes:
To create a new password hash:

1. Edit `generate-admin-hash.js` and change the password
2. Run: `node generate-admin-hash.js`
3. Copy the generated hash

## 🔒 Security Best Practices

1. ✅ **Never commit `.env.local`** to version control
2. ✅ **Change default password immediately** after first login
3. ✅ **Use strong passwords** (min 12 characters, mixed case, numbers, symbols)
4. ✅ **Limit admin accounts** to only necessary personnel
5. ✅ **Regular password rotation** (every 90 days)
6. ✅ **Monitor admin sessions** in the `admin_sessions` table
7. ✅ **Enable 2FA** (future enhancement)

## 📁 File Structure

\`\`\`
src/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx           # Admin login page
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Admin dashboard
│   │   └── page.tsx               # Redirects to dashboard
│   └── api/
│       └── admin/
│           └── login/
│               └── route.ts       # Admin login API
├── lib/
│   └── admin-auth.ts              # Admin auth utilities
└── ...

Database:
├── admin_auth_schema.sql          # Admin tables schema
└── generate-admin-hash.js         # Password hash generator
\`\`\`

## 🛠️ Troubleshooting

### "Invalid credentials" error:
- Check that you're using the correct email and password
- Verify the SQL script ran successfully
- Check if the admin account is active

### "Session expired" error:
- Sessions expire after 24 hours
- Simply log in again

### Cannot access admin dashboard:
- Clear browser cookies
- Try logging in again
- Check browser console for errors

## 🔄 Session Management

- Sessions last **24 hours**
- Stored in database (`admin_sessions` table)
- Cleanup function available: `cleanup_expired_admin_sessions()`

To manually clean expired sessions:
\`\`\`sql
SELECT cleanup_expired_admin_sessions();
\`\`\`

## 📊 Database Schema

### admin_credentials
- `id` - UUID primary key
- `email` - Unique admin email
- `password_hash` - bcrypt hashed password
- `full_name` - Admin's full name
- `is_active` - Account status (active/deactivated)
- `created_at` - Account creation timestamp
- `last_login_at` - Last successful login

### admin_sessions
- `id` - UUID primary key
- `admin_id` - Reference to admin_credentials
- `session_token` - Unique session identifier
- `expires_at` - Session expiration time
- `created_at` - Session creation timestamp

## ⚡ Next Steps

1. ✅ Run `admin_auth_schema.sql` in Supabase
2. ✅ Login at `/admin/login` with default credentials
3. ✅ Change the default password
4. ✅ Create additional admin accounts if needed
5. ✅ Explore the admin dashboard
6. ✅ Start managing your platform!
