-- Add editable welcome card fields to venues
-- These fall back to sensible defaults in the UI when null

alter table venues
  add column welcome_heading text,
  add column welcome_body    text,
  add column phone_label     text;

comment on column venues.welcome_heading is 'Heading shown in the welcome card. Defaults to "Welcome." (hotel) or "Welcome aboard." (cruise) when null.';
comment on column venues.welcome_body    is 'Body text shown in the welcome card. Defaults to a standard message when null.';
comment on column venues.phone_label     is 'Label for the phone CTA button. Defaults to "Call the Front Desk" (hotel) or "Call the Bridge" (cruise) when null.';
