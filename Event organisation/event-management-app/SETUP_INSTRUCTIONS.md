# Quick Setup Guide

## ⚡ Get Started in 5 Minutes!

### Step 1: Create .env File

In the `event-management-app` folder, create a file named `.env`:

```bash
# On Mac/Linux:
touch .env

# On Windows:
type nul > .env
```

### Step 2: Add Your Supabase Credentials

Open `.env` and add:

```env
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Get Your Credentials

1. Go to https://supabase.com/dashboard
2. Open your "RUAS Connect" project
3. Click **Settings** (left sidebar, bottom)
4. Click **API**
5. Copy:
   - **Project URL** → paste as `REACT_APP_SUPABASE_URL`
   - **Project API keys** → `anon` `public` → paste as `REACT_APP_SUPABASE_ANON_KEY`

### Step 4: Run the App

```bash
npm start
```

The app will open at http://localhost:3000

---

## ✅ Verify It's Working

1. **You should see** the login page
2. **Try logging in** with an existing account or sign up
3. **Check dashboard** - you should see the sample events

---

## 🚨 Common Issues

### Issue: "Missing Supabase environment variables"
**Fix:** Make sure `.env` file exists in `event-management-app` folder (not in `src`)

### Issue: Events not showing
**Fix:** Make sure you ran the `database-schema.sql` in Supabase

### Issue: Can't sign up
**Fix:** Check if Email provider is enabled in Supabase → Authentication → Providers

---

## 📝 Example .env File

Your `.env` should look like this (with your actual values):

```env
REACT_APP_SUPABASE_URL=https://abcdefgh.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk1MjY0MDAsImV4cCI6MjAwNTEwMjQwMH0.xxxxxxxxxxxxxxxxxxxxx
```

⚠️ **Never commit .env to Git!** (It's already in .gitignore)

---

## 🎉 That's It!

You're ready to use the app! Check README.md for full documentation.

