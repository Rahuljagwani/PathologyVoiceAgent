-- 001_init_schema.sql
-- Core database schema for Pathology Lab Voice Agent

-- Enable required extensions (Supabase/Postgres usually has these)
create extension if not exists "pgcrypto";

-- Core tables
create table if not exists labs (
  id uuid primary key default gen_random_uuid(),
  name varchar(200) not null,
  owner_name varchar(200),
  owner_phone varchar(15) not null,
  owner_email varchar(200),
  plan varchar(20) default 'starter',
  is_active boolean default true,
  created_at timestamp default now()
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid references labs(id),
  name varchar(200) not null,
  phone varchar(15),
  email varchar(200) unique,
  role varchar(20) default 'staff', -- owner | staff
  password_hash text not null,
  is_active boolean default true,
  created_at timestamp default now()
);

create table if not exists lab_settings (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid references labs(id) unique,
  lab_name varchar(200) not null,
  address text not null,
  landmark varchar(200),
  nearest_bus_stop varchar(200),
  parking_available boolean default false,
  -- Timings
  weekday_open time,
  weekday_close time,
  saturday_open time,
  saturday_close time,
  is_open_sunday boolean default false,
  sunday_open time,
  sunday_close time,
  is_open_public_holidays boolean default false,
  -- Home Collection
  home_collection_available boolean default false,
  home_collection_charge decimal(10,2) default 0,
  home_collection_areas text[],
  home_collection_slots text[],
  -- Services
  payment_modes text[],
  walk_in_allowed boolean default true,
  appointment_required boolean default false,
  nabl_accredited boolean default false,
  -- Voice Agent Config
  escalation_phone varchar(15) not null,
  language_preference varchar(10) default 'hi',
  bolna_agent_id varchar(100),
  -- Meta
  onboarding_complete boolean default false,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid references labs(id),
  token_number varchar(50),
  patient_name varchar(200) not null,
  patient_phone varchar(15) not null,
  test_name varchar(200) not null,
  sample_date date not null,
  expected_ready_time timestamp,
  status varchar(20) default 'pending', -- pending | ready | dispatched
  ready_marked_at timestamp,
  ready_marked_by uuid references users(id),
  created_at timestamp default now()
);

create table if not exists home_collections (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid references labs(id),
  booking_ref varchar(20) unique not null,
  patient_name varchar(200) not null,
  patient_phone varchar(15) not null,
  address text not null,
  area varchar(100),
  test_names text[] not null,
  preferred_date date not null,
  preferred_time varchar(50) not null,
  status varchar(20) default 'booked', -- booked | assigned | completed | cancelled
  assigned_to varchar(100),
  notes text,
  created_at timestamp default now()
);

create table if not exists test_price_master (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid references labs(id),
  test_name varchar(200) not null,
  test_aliases text[],
  category varchar(100),
  price decimal(10,2) not null,
  turnaround_time_hours integer,
  is_available boolean default true,
  fasting_required boolean default false,
  fasting_hours integer,
  sample_type varchar(100),
  notes text,
  updated_at timestamp default now()
);

create table if not exists call_logs (
  id uuid primary key default gen_random_uuid(),
  lab_id uuid references labs(id),
  bolna_call_id varchar(100),
  caller_phone varchar(15),
  call_time timestamp not null,
  duration_seconds integer,
  language_detected varchar(10),
  flow_triggered varchar(50),
  outcome varchar(20),
  transfer_reason varchar(100),
  summary text,
  recording_url text,
  created_at timestamp default now()
);

