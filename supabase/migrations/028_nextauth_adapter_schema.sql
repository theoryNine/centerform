-- NextAuth.js Supabase Adapter Schema
-- Required by @auth/supabase-adapter for magic link (verification tokens) and user management.
-- https://authjs.dev/getting-started/adapters/supabase

create table if not exists users (
  id uuid not null default gen_random_uuid(),
  name text,
  email text unique,
  "emailVerified" timestamptz,
  image text,
  primary key (id)
);

create table if not exists accounts (
  id uuid not null default gen_random_uuid(),
  "userId" uuid not null references users(id) on delete cascade,
  type text,
  provider text,
  "providerAccountId" text,
  refresh_token text,
  access_token text,
  expires_at bigint,
  token_type text,
  scope text,
  id_token text,
  session_state text,
  primary key (id)
);

create table if not exists sessions (
  id uuid not null default gen_random_uuid(),
  "userId" uuid not null references users(id) on delete cascade,
  expires timestamptz not null,
  "sessionToken" text not null,
  primary key (id)
);

create table if not exists verification_tokens (
  identifier text,
  token text,
  expires timestamptz not null,
  primary key (token)
);

-- RLS: these tables are managed exclusively by the service role client.
-- No public or user-level access is needed.
alter table users enable row level security;
alter table accounts enable row level security;
alter table sessions enable row level security;
alter table verification_tokens enable row level security;
