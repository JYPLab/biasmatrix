-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nickname VARCHAR(255) NOT NULL,
  birth_date VARCHAR(10) NOT NULL, -- Format YYYY-MM-DD
  birth_city VARCHAR(255) NOT NULL,
  longitude DECIMAL(10, 6),
  is_time_known BOOLEAN DEFAULT FALSE,
  birth_time VARCHAR(5), -- Format HH:MM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create idols table
CREATE TABLE public.idols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name VARCHAR(255) NOT NULL,
  member_name VARCHAR(255) NOT NULL,
  birth_date VARCHAR(10) NOT NULL, -- Format YYYY-MM-DD
  gender VARCHAR(10) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  idol_id UUID NOT NULL REFERENCES public.idols(id) ON DELETE CASCADE,
  is_paid BOOLEAN DEFAULT FALSE,
  energy_score INT,
  full_report_json JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set Row Level Security (RLS) policies (Optional, securing tables)
-- For MVP, leaving RLS open or depending on backend service role.
