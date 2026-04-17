-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/erqmwytaztmrfploqemr/sql)

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  skills      TEXT[],
  niche       TEXT,
  target_client TEXT,
  location    TEXT DEFAULT 'India',
  experience  TEXT DEFAULT 'mid',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Leads (Reddit posts that match)
CREATE TABLE IF NOT EXISTS leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID REFERENCES profiles(id),
  platform      TEXT DEFAULT 'reddit',
  post_id       TEXT UNIQUE,
  title         TEXT,
  body          TEXT,
  author        TEXT,
  url           TEXT,
  subreddit     TEXT,
  intent_score  INTEGER DEFAULT 0,
  urgency       TEXT DEFAULT 'low',
  budget_signal TEXT DEFAULT 'none',
  reason        TEXT,
  hook          TEXT,
  status        TEXT DEFAULT 'new',
  detected_at   TIMESTAMPTZ DEFAULT now()
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id            UUID REFERENCES profiles(id),
  name                  TEXT NOT NULL,
  company               TEXT,
  project_name          TEXT,
  project_status        TEXT DEFAULT 'active',
  project_completion_pct INTEGER DEFAULT 0,
  payment_status        TEXT DEFAULT 'current',
  total_value           INTEGER,
  last_contact_date     DATE,
  health_score          INTEGER,
  health_status         TEXT,
  health_flags          TEXT[],
  opportunities         TEXT[],
  notes                 TEXT,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID REFERENCES profiles(id),
  lead_id     UUID REFERENCES leads(id),
  client_id   UUID REFERENCES clients(id),
  content     TEXT,
  subject     TEXT,
  status      TEXT DEFAULT 'draft',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Daily briefs (cached)
CREATE TABLE IF NOT EXISTS daily_briefs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID REFERENCES profiles(id),
  content      JSONB,
  generated_at TIMESTAMPTZ DEFAULT now()
);
