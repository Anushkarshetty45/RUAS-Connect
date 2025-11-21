-- Event Management Platform Database Schema
-- Run this in Supabase SQL Editor

-- =========================================
-- CLEANUP: Drop existing objects if they exist
-- This allows you to re-run the script safely
-- =========================================

-- Drop triggers
DROP TRIGGER IF EXISTS on_registration_upcoming_delete ON registrations;
DROP TRIGGER IF EXISTS on_registration_upcoming_update ON registrations;
DROP TRIGGER IF EXISTS on_registration_upcoming_insert ON registrations;
DROP TRIGGER IF EXISTS on_certificate_deleted ON certificates;
DROP TRIGGER IF EXISTS on_certificate_added ON certificates;
DROP TRIGGER IF EXISTS on_registration_cancelled ON registrations;
DROP TRIGGER IF EXISTS on_registration_created ON registrations;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_events_updated_at ON events;
DROP TRIGGER IF EXISTS update_clubs_updated_at ON clubs;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;

-- Drop functions
DROP FUNCTION IF EXISTS update_upcoming_events_count() CASCADE;
DROP FUNCTION IF EXISTS update_certificates_count() CASCADE;
DROP FUNCTION IF EXISTS decrement_participants() CASCADE;
DROP FUNCTION IF EXISTS increment_participants() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop tables (CASCADE removes dependent policies)
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS club_members CASCADE;
DROP TABLE IF EXISTS clubs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =========================================
-- NOW CREATE EVERYTHING FRESH
-- =========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    registration_number TEXT UNIQUE, -- Student registration/roll number
    department TEXT,
    year_of_study INTEGER,
    certificates_received INTEGER DEFAULT 0, -- Count of certificates
    upcoming_events INTEGER DEFAULT 0, -- Count of upcoming events registered
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-----------------------------------
-- Clubs/Organizations Table
-----------------------------------
CREATE TABLE IF NOT EXISTS clubs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    college_name TEXT,
    category TEXT, 
    logo_url TEXT,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

-- Anyone can view clubs
CREATE POLICY "Anyone can view clubs" ON clubs
    FOR SELECT USING (true);

-----------------------------------
-- Club Members Table
-----------------------------------
CREATE TABLE IF NOT EXISTS club_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member', -- 'admin', 'core_member', 'member'
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(club_id, user_id)
);

ALTER TABLE club_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view club members" ON club_members
    FOR SELECT USING (true);

CREATE POLICY "Users can join clubs" ON club_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-----------------------------------
-- Events Table
-----------------------------------
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT, -- 'workshop', 'seminar', 'hackathon', 'competition', 'other'
    club_id UUID REFERENCES clubs(id) ON DELETE SET NULL,
    location TEXT,
    event_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    poster_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can view active events
CREATE POLICY "Anyone can view events" ON events
    FOR SELECT USING (is_active = true);

-- Club admins can create events
CREATE POLICY "Club admins can create events" ON events
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM club_members 
            WHERE club_id = events.club_id 
            AND role IN ('admin', 'core_member')
        )
    );

-----------------------------------
-- Event Registrations Table
-----------------------------------
CREATE TABLE IF NOT EXISTS registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'registered', -- 'registered', 'attended', 'cancelled'
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(event_id, user_id)
);

ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations" ON registrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events" ON registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel registrations" ON registrations
    FOR UPDATE USING (auth.uid() = user_id);

-----------------------------------
-- Announcements Table
-----------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    announcement_type TEXT, -- 'event', 'seminar', 'general'
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view announcements" ON announcements
    FOR SELECT USING (true);

-----------------------------------
-- Certificates Table
-----------------------------------
CREATE TABLE IF NOT EXISTS certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    certificate_url TEXT,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(event_id, user_id)
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" ON certificates
    FOR SELECT USING (auth.uid() = user_id);

-----------------------------------
-- Functions and Triggers
-----------------------------------

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clubs_updated_at BEFORE UPDATE ON clubs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment participant count
CREATE OR REPLACE FUNCTION increment_participants()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE events 
    SET current_participants = current_participants + 1
    WHERE id = NEW.event_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_registration_created
    AFTER INSERT ON registrations
    FOR EACH ROW EXECUTE FUNCTION increment_participants();

-- Function to decrement participant count
CREATE OR REPLACE FUNCTION decrement_participants()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' THEN
        UPDATE events 
        SET current_participants = current_participants - 1
        WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_registration_cancelled
    AFTER UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION decrement_participants();

-- Function to update certificates_received count in profiles
CREATE OR REPLACE FUNCTION update_certificates_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the count when certificate is added
    IF (TG_OP = 'INSERT') THEN
        UPDATE profiles 
        SET certificates_received = certificates_received + 1
        WHERE id = NEW.user_id;
    -- Update the count when certificate is deleted
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE profiles 
        SET certificates_received = GREATEST(certificates_received - 1, 0)
        WHERE id = OLD.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_certificate_added
    AFTER INSERT ON certificates
    FOR EACH ROW EXECUTE FUNCTION update_certificates_count();

CREATE TRIGGER on_certificate_deleted
    AFTER DELETE ON certificates
    FOR EACH ROW EXECUTE FUNCTION update_certificates_count();

-- Function to update upcoming_events count in profiles
CREATE OR REPLACE FUNCTION update_upcoming_events_count()
RETURNS TRIGGER AS $$
DECLARE
    event_date TIMESTAMP WITH TIME ZONE;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        -- Get event date
        SELECT e.event_date INTO event_date
        FROM events e
        WHERE e.id = NEW.event_id;
        
        -- Only increment if event is in the future
        IF event_date > NOW() THEN
            UPDATE profiles 
            SET upcoming_events = upcoming_events + 1
            WHERE id = NEW.user_id;
        END IF;
        
    ELSIF (TG_OP = 'UPDATE') THEN
        -- Get event date
        SELECT e.event_date INTO event_date
        FROM events e
        WHERE e.id = NEW.event_id;
        
        -- If status changed to cancelled, decrement
        IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' AND event_date > NOW() THEN
            UPDATE profiles 
            SET upcoming_events = GREATEST(upcoming_events - 1, 0)
            WHERE id = NEW.user_id;
        END IF;
        
    ELSIF (TG_OP = 'DELETE') THEN
        -- Get event date
        SELECT e.event_date INTO event_date
        FROM events e
        WHERE e.id = OLD.event_id;
        
        -- Decrement if event was in the future
        IF event_date > NOW() THEN
            UPDATE profiles 
            SET upcoming_events = GREATEST(upcoming_events - 1, 0)
            WHERE id = OLD.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_registration_upcoming_insert
    AFTER INSERT ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_upcoming_events_count();

CREATE TRIGGER on_registration_upcoming_update
    AFTER UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_upcoming_events_count();

CREATE TRIGGER on_registration_upcoming_delete
    AFTER DELETE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_upcoming_events_count();

-----------------------------------
-- Sample Data (Optional - for testing)
-----------------------------------

-- Insert sample clubs
INSERT INTO clubs (name, description, category, college_name)
VALUES 
    ('Cynergy Club', 'Innovation and entrepreneurship society', 'Technical', 'RUAS'),
    ('MATH Club', 'Mathematics and problem-solving club', 'Academic', 'RUAS'),
    ('Startup Society', 'Business and startup enthusiasts', 'Technical', 'RUAS'),
    ('Coders Club', 'Programming and development club', 'Technical', 'RUAS'),
    ('Electronics Club', 'Electronics and hardware projects', 'Technical', 'RUAS'),
    ('Cultural Committee', 'Cultural events and activities', 'Cultural', 'RUAS'),
    ('Pravaah Club', 'Literary and creative arts', 'Cultural', 'RUAS'),
    ('Euphony Club', 'Music and performing arts', 'Cultural', 'RUAS'),
    ('Rotaract Club', 'Community service and social work', 'Social', 'RUAS'),
    ('SPORTS Club', 'Sports and athletics', 'Sports', 'RUAS'),
    ('Calisthenics Club', 'Bodyweight fitness and training', 'Sports', 'RUAS'),
    ('NSS', 'National Service Scheme', 'Social', 'RUAS'),
    ('NCC', 'National Cadet Corps', 'Social', 'RUAS')
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, event_type, club_id, location, event_date, end_date, registration_deadline, max_participants, poster_url, is_active)
SELECT 
    'React Workshop 2024',
    'Learn React.js fundamentals and build your first web application',
    'workshop',
    id,
    'Computer Lab - Block A, Room 301',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '6 hours',
    NOW() + INTERVAL '5 days',
    50,
    NULL,
    true
FROM clubs WHERE name = 'Coders Club' LIMIT 1;

INSERT INTO events (title, description, event_type, club_id, location, event_date, end_date, registration_deadline, max_participants, poster_url, is_active)
SELECT 
    'Battle of Bands 2024',
    'Annual music competition for all bands. Show your talent and win amazing prizes!',
    'competition',
    id,
    'Main Auditorium',
    NOW() + INTERVAL '14 days',
    NOW() + INTERVAL '14 days' + INTERVAL '4 hours',
    NOW() + INTERVAL '10 days',
    100,
    NULL,
    true
FROM clubs WHERE name = 'Euphony Club' LIMIT 1;

INSERT INTO events (title, description, event_type, club_id, location, event_date, end_date, registration_deadline, max_participants, poster_url, is_active)
SELECT 
    'RUAS Hackathon 2024',
    '24-hour coding marathon. Build innovative solutions and compete for prizes worth ₹50,000',
    'hackathon',
    id,
    'Innovation Lab',
    NOW() + INTERVAL '21 days',
    NOW() + INTERVAL '22 days',
    NOW() + INTERVAL '15 days',
    200,
    NULL,
    true
FROM clubs WHERE name = 'Cynergy Club' LIMIT 1;

INSERT INTO events (title, description, event_type, club_id, location, event_date, end_date, registration_deadline, max_participants, poster_url, is_active)
SELECT 
    'AI & Machine Learning Seminar',
    'Learn about the latest trends in AI and ML from industry experts',
    'seminar',
    id,
    'Seminar Hall 2',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '10 days' + INTERVAL '3 hours',
    NOW() + INTERVAL '7 days',
    150,
    NULL,
    true
FROM clubs WHERE name = 'Coders Club' LIMIT 1;

INSERT INTO events (title, description, event_type, club_id, location, event_date, end_date, registration_deadline, max_participants, poster_url, is_active)
SELECT 
    'Inter-College Sports Meet',
    'Annual sports competition featuring cricket, football, basketball and athletics',
    'competition',
    id,
    'Sports Complex',
    NOW() + INTERVAL '30 days',
    NOW() + INTERVAL '32 days',
    NOW() + INTERVAL '20 days',
    300,
    NULL,
    true
FROM clubs WHERE name = 'SPORTS Club' LIMIT 1;

