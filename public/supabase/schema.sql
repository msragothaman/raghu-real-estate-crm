-- Raghu Real Estate CRM Database Schema
-- Run this script in your Supabase SQL Editor to initialize all tables, constraints, indexes, and RLS policies.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'SALES USER',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SITES / PROJECTS TABLE
CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT,
    total_area VARCHAR(100),
    description TEXT,
    maps_url TEXT,
    approval_info VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CHANNEL PARTNERS TABLE
CREATE TABLE IF NOT EXISTS channel_partners (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    joining_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. LEADS TABLE
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    source VARCHAR(50) DEFAULT 'Meta',
    campaign VARCHAR(255),
    interested_site_id TEXT REFERENCES sites(id) ON DELETE SET NULL,
    preferred_plot_size VARCHAR(100),
    budget VARCHAR(100),
    purpose VARCHAR(100),
    preferred_location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'NEW',
    assigned_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    assigned_channel_partner_id TEXT REFERENCES channel_partners(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PLOTS TABLE
CREATE TABLE IF NOT EXISTS plots (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    plot_number VARCHAR(50) NOT NULL,
    size_sqft NUMERIC(10, 2) NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    facing VARCHAR(50) DEFAULT 'East',
    status VARCHAR(50) DEFAULT 'AVAILABLE',
    lead_id TEXT REFERENCES leads(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    booking_date DATE,
    registration_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(site_id, plot_number)
);

-- 6. LEAD STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS lead_status_history (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by VARCHAR(255) DEFAULT 'System',
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PARTNER ASSIGNMENT HISTORY TABLE
CREATE TABLE IF NOT EXISTS partner_assignment_history (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    old_partner_id TEXT REFERENCES channel_partners(id) ON DELETE SET NULL,
    new_partner_id TEXT REFERENCES channel_partners(id) ON DELETE SET NULL,
    changed_by VARCHAR(255) DEFAULT 'System',
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. FOLLOWUPS TABLE
CREATE TABLE IF NOT EXISTS followups (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    assigned_partner_id TEXT REFERENCES channel_partners(id) ON DELETE SET NULL,
    followup_date DATE NOT NULL,
    followup_time TIME DEFAULT '10:00:00',
    type VARCHAR(50) DEFAULT 'Phone Call',
    notes TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_by VARCHAR(255) DEFAULT 'System',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTES TABLE
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255) DEFAULT 'Raghu Admin',
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_plots_site_id ON plots(site_id);
CREATE INDEX IF NOT EXISTS idx_plots_status ON plots(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_partner ON leads(assigned_channel_partner_id);
CREATE INDEX IF NOT EXISTS idx_leads_site ON leads(interested_site_id);
CREATE INDEX IF NOT EXISTS idx_followups_date ON followups(followup_date);
CREATE INDEX IF NOT EXISTS idx_followups_lead ON followups(lead_id);
CREATE INDEX IF NOT EXISTS idx_status_history_lead ON lead_status_history(lead_id);
CREATE INDEX IF NOT EXISTS idx_partner_history_lead ON partner_assignment_history(lead_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_assignment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow read/write access policies
CREATE POLICY "Public sites policy" ON sites FOR ALL USING (true);
CREATE POLICY "Public plots policy" ON plots FOR ALL USING (true);
CREATE POLICY "Public leads policy" ON leads FOR ALL USING (true);
CREATE POLICY "Public channel_partners policy" ON channel_partners FOR ALL USING (true);
CREATE POLICY "Public status history policy" ON lead_status_history FOR ALL USING (true);
CREATE POLICY "Public partner history policy" ON partner_assignment_history FOR ALL USING (true);
CREATE POLICY "Public followups policy" ON followups FOR ALL USING (true);
CREATE POLICY "Public notes policy" ON notes FOR ALL USING (true);
CREATE POLICY "Public users policy" ON users FOR ALL USING (true);
