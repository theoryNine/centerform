-- Add structured details field to services
-- Supports rich accordion content: key-value pairs, bullets, phone links, and text with inline bold
-- Falls back to plain description when null

alter table services
  add column details jsonb;

comment on column services.details is '
Structured content for accordion body. Renderer falls back to description when null.

Supported shapes:

  { "type": "kv", "rows": [{ "label": "Network", "value": "Ship_Guest", "copy": true }] }
  { "type": "bullets", "items": ["Item one", "Item **two** bold"] }
  { "type": "phone", "label": "Guest Services", "value": "+1-800-555-0123" }
  { "type": "text", "content": "Some text with **bold** words." }

All string values support inline bold via **word** markers.
Multiple blocks can be composed as an array:
  [{ "type": "text", "content": "Intro." }, { "type": "kv", "rows": [...] }]
';
