# Dashboard components (`src/components/dashboard/`)

Loaded in addition to the root and `src/app/dashboard/CLAUDE.md`. These are client components used by the dashboard pages. They must never import `createAdminClient` or anything server-only.

## Components

- `nav-link.tsx` — pathname-aware Link with active state; `exact` prop for exact-match only; `activeParam={{ key, value }}` prop for query-param-aware active state (used by Dining & Drinks / Nearby Places)
- `venue-switcher.tsx` — Multi-venue dropdown (hidden for single-venue users)
- `color-picker.tsx` — Themed color picker: Radix Popover + react-colorful HexColorPicker + hex text input
- `font-picker.tsx` — Font selector: dropdown + live preview; loads Google Fonts on demand; exports HEADING_FONTS and BODY_FONTS lists
- `image-upload.tsx` — Image field for Sheet forms: upload-on-select (POST /api/dashboard/upload) + inline media library grid; outputs a hidden input with the selected URL; props: name, defaultValue, venueId
- `service-sheet.tsx` — Sheet form for Service create/edit/delete
- `event-sheet.tsx` — Sheet form for VenueEvent create/edit/delete
- `place-sheet.tsx` — Sheet form for NearbyPlace create/edit/delete; dining categories (restaurant/bar/cafe) show a "Location" select (Nearby recommendation / On-site at the hotel) instead of the free-text Area field; selecting "On-site" writes area = "on-site"
- `collection-sheet.tsx` — Sheet form for ExploreCollection create/edit/delete
- `amenity-sheet.tsx` — Sheet form for VenueAmenity create/edit/delete
- `info-sheet.tsx` — Sheet form for VenueInfo create/edit/delete; "Label" field stores the key (snake_case keys like check_out_time are formatted for display via formatKey())

## Sheet form conventions

- Each sheet submits a `FormData` to a server action in the matching `actions.ts` (the form always includes a hidden `venueId`, plus `id` when editing).
- On success: close the sheet and `router.refresh()`. Delete uses an inline confirm toggle in the sheet footer (no separate dialog); delete needs `admin`, upsert needs `staff`.
- Image fields use `ImageUpload` (hidden input holding the URL). URL fields (website, booking URL) are validated server-side by `parseOptionalHttpUrl`, so surface the thrown message to the user.
- Colors must be `#rrggbb` and font names alphanumeric — the server action validates both (see `updateVenueThemeAction`).
