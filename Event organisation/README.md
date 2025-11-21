# Event Management Platform - RUAS

## 🎯 PROJECT OVERVIEW

A unified event management platform where students can browse events, register quickly, receive real-time notifications, and store certificates. Event organizers can post events, track registrations, and manage attendance.

---

## 📁 FILES IN THIS FOLDER

### 1. **database-schema.sql** ⭐ **RUN THIS!**
   - Complete SQL code to create all database tables
   - Includes automatic triggers for updating counts
   - Sample data (13 clubs, 5 events)
   - Copy-paste into Supabase SQL Editor

### 2. **YOUR_NEXT_STEPS.md** 📋 **FOLLOW THIS!**
   - Step-by-step setup guide for database
   - Storage bucket configuration
   - How to get credentials
   - What to share with frontend team

### 3. **DATABASE_STRUCTURE_FOR_FRONTEND.md** 🤝 **SHARE WITH TEAM!**
   - Complete guide for frontend developers
   - All table structures and columns
   - Code examples for every operation
   - How to connect React to Supabase

### 4. **TECH_STACK_EXPLANATION.md** 🎓 **FOR HACKATHON!**
   - All 18 technologies explained
   - Why we're using each tool
   - How to present for judges
   - Technical buzzwords

### 5. **README.md** 📖 **THIS FILE!**
   - Overview and quick reference

---

## 🚀 QUICK START (3 Steps)

### **Step 1: Run SQL (2 minutes)**
1. Go to Supabase Dashboard → SQL Editor
2. Copy ALL from `database-schema.sql`
3. Paste and click "Run"
4. ✅ Creates 7 tables + sample data

### **Step 2: Create Storage (5 minutes)**
1. Go to Storage in Supabase
2. Create buckets: `event-posters`, `certificates`, `club-logos`
3. See `YOUR_NEXT_STEPS.md` for policies

### **Step 3: Share with Frontend (2 minutes)**
1. Get Project URL + Anon Key from Settings → API
2. Send `DATABASE_STRUCTURE_FOR_FRONTEND.md` to frontend team
3. Share credentials

---

## 📊 DATABASE STRUCTURE

### **7 Tables:**
1. **profiles** - User information
2. **clubs** - All clubs/organizations
3. **club_members** - Who belongs to which club
4. **events** - All events (workshops, hackathons, seminars)
5. **registrations** - Event registrations
6. **announcements** - Club announcements
7. **certificates** - User certificates

### **profiles Table (Updated):**
```sql
- id
- full_name
- registration_number (student ID)
- department
- year_of_study
- certificates_received (auto-updated count)
- upcoming_events (auto-updated count)
- created_at
- updated_at
```

**Note:** Email is in `auth.users`, not profiles

---

## 🔧 TECH STACK

| Layer | Technology |
|-------|-----------|
| Frontend | React, HTML, CSS, JavaScript |
| Backend | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel (Serverless) |
| Storage | Supabase Storage |
| Auth | Email/Password + Google OAuth |

---

## ✨ KEY FEATURES

### **Automatic Counters:**
- `certificates_received` - Auto-updates when certificates are added/removed
- `upcoming_events` - Auto-updates when users register/cancel for future events

### **Row-Level Security:**
- Users can only see their own data
- Anyone can view events and clubs
- Only club admins can create events

### **Real-Time:**
- Live notifications
- Event updates
- Registration status

---

## 👥 TEAM ROLES

### **You (Database Person):**
- ✅ Set up Supabase
- ✅ Run SQL schema
- ✅ Configure storage
- ✅ Share credentials
- Monitor database

### **Frontend Team:**
- Install `@supabase/supabase-js`
- Build React components
- Connect to your database
- Create UI/UX

---

## 🎓 FOR HACKATHON PRESENTATION

### **Key Points:**
1. **Serverless Architecture** - No server management needed
2. **Auto-updating Counts** - Triggers keep data synchronized
3. **Row-Level Security** - Database-level protection
4. **Real-time Capabilities** - WebSocket subscriptions
5. **Professional Design** - Proper foreign keys and relationships

### **Tech Buzzwords:**
- Backend-as-a-Service (BaaS)
- Serverless Computing
- Row-Level Security (RLS)
- Single Page Application (SPA)
- Real-time Subscriptions
- JWT Authentication

---

## 📋 SAMPLE DATA

### **13 Clubs:**
- Technical: Cynergy, MATH, Startup Society, Coders, Electronics
- Cultural: Cultural Committee, Pravaah, Euphony
- Social: Rotaract, NSS, NCC
- Sports: SPORTS Club, Calisthenics

### **5 Events:**
- React Workshop 2024 (workshop)
- Battle of Bands 2024 (competition)
- RUAS Hackathon 2024 (hackathon)
- AI & ML Seminar (seminar)
- Inter-College Sports Meet (competition)

---

## ✅ QUICK CHECKLIST

- [ ] Run `database-schema.sql` in Supabase
- [ ] Create 3 storage buckets
- [ ] Set storage policies
- [ ] Get Project URL + Anon Key
- [ ] Share `DATABASE_STRUCTURE_FOR_FRONTEND.md` with team
- [ ] Share credentials with team
- [ ] Frontend connects and tests
- [ ] Deploy to Vercel

---

## 🆘 TROUBLESHOOTING

### "Policy already exists" error:
The SQL now has DROP statements at the top - just run it again!

### Can't connect from frontend:
- Check Project URL is correct
- Check you shared `anon` key (not `service_role`)
- Check `.env` file format
- Restart React app

### Counts not updating:
Triggers are automatic - they should work. Check:
- SQL ran completely without errors
- Triggers exist in Database → Triggers

---

## 📞 NEXT STEPS

1. **Now:** Run `database-schema.sql`
2. **Then:** Follow `YOUR_NEXT_STEPS.md`
3. **Share:** `DATABASE_STRUCTURE_FOR_FRONTEND.md` with team
4. **Present:** Use `TECH_STACK_EXPLANATION.md` for hackathon

---

## 🎉 YOU'RE READY!

Everything is set up. Just:
1. Run the SQL
2. Create storage buckets
3. Share with team
4. Start building!

**Good luck with your hackathon! 🚀**
