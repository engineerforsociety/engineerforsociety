# 🛡️ Admin Authentication System - Quick Start

## ✨ What's New
A secure **admin panel** with email/password login has been created. Regular users **cannot access** this panel.

## 🚀 Quick Setup (3 Steps)

### 1. Run SQL in Supabase
```bash
# Open admin_auth_schema.sql
# Copy all contents
# Go to Supabase Dashboard → SQL Editor
# Paste and Run
```

### 2. Login to Admin Panel
- **URL**: `http://localhost:9002/admin/login`
- **Email**: `admin@engineerforsociety.com`
- **Password**: `admin123`

### 3. ⚠️ Change Password Immediately!
The default password is public in this codebase. Change it after first login!

## 📁 Important Files Created

| File | Purpose |
|------|---------|
| `admin_auth_schema.sql` | Database schema - **RUN THIS FIRST** |
| `ADMIN_SETUP.md` | Full documentation |
| `src/app/admin/login/page.tsx` | Admin login page |
| `src/app/admin/dashboard/page.tsx` | Admin dashboard |
| `src/lib/admin-auth.ts` | Authentication logic |
| `generate-admin-hash.js` | Password hash generator |

## 🔐 Security Features
- ✅ bcrypt password hashing
- ✅ 24-hour session management
- ✅ HTTP-only cookies
- ✅ Row Level Security (RLS)
- ✅ Separate from Google OAuth
- ✅ No regular user can access

## 📖 Full Documentation
See `ADMIN_SETUP.md` for complete instructions.

---
**Made with ❤️ for Engineer For Society**
