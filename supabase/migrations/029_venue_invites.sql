-- Venue invite tokens for owner onboarding.
-- Platform team creates invites linked to a venue; customers claim them via magic link.

create table venue_invites (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references venues(id) on delete cascade,
  token       text not null unique,
  role        member_role not null default 'owner',
  invited_by  text,                         -- free-text label, e.g. "Ansel @ Centerform"
  email_hint  text,                         -- optional display hint; NOT enforced at claim time
  claimed_by  uuid,                         -- user_id (from NextAuth users table) after claim
  claimed_at  timestamptz,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index idx_venue_invites_token on venue_invites(token);
create index idx_venue_invites_venue on venue_invites(venue_id);

-- All reads/writes go through the service role client only.
-- No permissive policies = deny all access via anon/user keys.
alter table venue_invites enable row level security;
