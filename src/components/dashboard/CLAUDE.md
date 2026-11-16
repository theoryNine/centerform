# Dashboard components (`src/components/dashboard/`)

Loaded in addition to the root and `src/app/dashboard/CLAUDE.md`. These are client components used by the dashboard pages. They must never import `createAdminClient` or anything server-only.

## Components

- `nav-link.tsx` — pathname-aware Link with active state; `exact` prop for exact-match only; `activeParam={{ key, value }}` prop for query-param-aware active state (used by Dining & Drinks / Nearby Places)
- `venue-switcher.tsx` — Multi-venue dropdown (hidden for single-venue users)
- `color-picker.tsx` — Themed color picker: Radix Popover + react-colorful HexColorPicker + hex text input
- `font-picker.tsx` — Font selector: dropdown + live preview; loads Google Fonts on demand; exports HEADING_FONTS and BODY_FONTS lists
- `image-upload.tsx` — Image field for Sheet forms: upload-on-select (POST /api/dashboard/upload) + inline media library grid; outputs a hidden input with the selected URL; props: name, defaultValue, venueId, `compact` (72px thumbnail beside the buttons); shows an inline error when an upload fails
- `sheet-shell.tsx` — Standard layout for right-hand edit sheets: `SheetShell` (64px header with title + 44px close button, scrolling body, sticky 72px footer; renders the `<form>`), `SheetSection` (fieldset + uppercase legend, rule between sections) and `SwitchRow` (labelled switch that submits `"true"`/`"false"` through a hidden input). `event-sheet.tsx` uses it; the other sheets should adopt it next.
- `dirty-form.tsx` — `DirtyForm` wraps a settings form with dirty tracking, the sticky `SaveBar`, Discard (remounts the children so uploads and pickers reset) and an inline error when the action throws. `FieldLabel` shows an "edited" marker; `useDirtyForm()` exposes live `values`/`changed` (the guest preview reads it). Fields whose value is set from React state (hidden image URL, color picker) must call `useNotifyForm` (`notify-form.ts`) so the form notices the change.
- `save-bar.tsx` — Presentational sticky bar ("N unsaved changes" / "All changes saved", Discard, Save). Must be the last child inside the `<form>` it saves.
- `venue-settings-tabs.tsx` — Tabs for Hotel Info & Branding. All panels stay mounted (inactive ones hidden) so edits survive tab switches; active tab is in `?tab=` (`src/lib/venue-tabs.ts`); warns before leaving with unsaved changes (`beforeunload` + a confirm on in-app link clicks; the browser Back button is not intercepted).
- `venue-general-form.tsx`, `venue-images-form.tsx`, `venue-theme-form.tsx` — The three tab forms, one server action each (`updateVenueAction`, `updatePageImagesAction`, `updateVenueThemeAction`).
- `guest-preview.tsx` — Illustration of the guest home hero driven by the General form's live values; falls back to the guest-site defaults for blank fields. Not an iframe.
- `stat-link.tsx`, `checklist.tsx`, `guest-link-card.tsx` — Overview pieces: linked stat card, "Finish setting up" checklist (`ChecklistCard`/`ChecklistRow`/`ProgressBar`; rules in `src/lib/dashboard-checklist.ts`), and the guest URL card with Copy link.
- `event-when-fields.tsx` — The Starts / Ends pair for the event sheet: owns the start/end relationship (moving the start keeps the duration, optional end that starts +2 hrs, 1/2/3 hr duration chips, end must be after start). Exposes `validate()` through a ref; the sheet calls it before submitting. Submits `start_time` / `end_time` as `"YYYY-MM-DDTHH:mm"` (end is `""` when removed), identical to what the old `datetime-local` inputs sent, so the server actions are unchanged.
- `date-time-field.tsx` — One date control + one time control with a single hidden form value (`name`). Controlled (`value`/`onChange`) or uncontrolled (`defaultValue`). Reuse this for any new date/time form field instead of `<input type="datetime-local">`.
- `date-field.tsx`, `calendar-panel.tsx` — Date button + calendar (react-day-picker, which provides the ARIA grid keyboard behavior; styled with tokens in `classNames`). Popover on desktop, bottom sheet when `(max-width: 767px), (pointer: coarse)`: we kept the custom design on touch devices rather than native pickers.
- `time-field.tsx` — Time combobox: type ("7pm", "19:30", "730p") or pick from 30-minute slots; bad input reverts with "Enter a time like 7:30 PM". Bottom sheet with the same list on touch devices. Slots can be filtered and annotated (the end-time list shows durations).
- Date/time maths and parsing live in `src/lib/datetime.ts` (tested). It works on wall-clock strings with no time zone — see the known time zone issue below.
- `service-sheet.tsx` — Sheet form for Service create/edit/delete
- `event-sheet.tsx` — Sheet form for VenueEvent create/edit/delete
- `place-sheet.tsx` — Sheet form for NearbyPlace create/edit/delete; dining categories (restaurant/bar/cafe) show a "Location" select (Nearby recommendation / On-site at the hotel) instead of the free-text Area field; selecting "On-site" writes area = "on-site"
- `collection-sheet.tsx` — Sheet form for ExploreCollection create/edit/delete
- `amenity-sheet.tsx` — Sheet form for VenueAmenity create/edit/delete
- `info-sheet.tsx` — Sheet form for VenueInfo create/edit/delete; "Label" field stores the key (snake_case keys like check_out_time are formatted for display via formatKey())

## Sheet form conventions

- New or restructured sheets use `SheetShell` + `SheetSection`; a boolean setting is a `SwitchRow` (shadcn `Switch`, `src/components/ui/switch.tsx`), not a two-option `<select>`. Mark required fields with "(required)" in the label text. Show action errors inline (`role="alert"`).
- Each sheet submits a `FormData` to a server action in the matching `actions.ts` (the form always includes a hidden `venueId`, plus `id` when editing).
- On success: close the sheet and `router.refresh()`. Delete uses an inline confirm toggle in the sheet footer (no separate dialog); delete needs `admin`, upsert needs `staff`.
- Image fields use `ImageUpload` (hidden input holding the URL). URL fields (website, booking URL) are validated server-side by `parseOptionalHttpUrl`, so surface the thrown message to the user.
- Colors must be `#rrggbb` and font names alphanumeric — the server action validates both (see `updateVenueThemeAction`).

## Known issue: event time zones

The picker submits wall-clock times with no zone, the `events` columns are `timestamptz` and venues have no time zone, so a time entered here is stored as if it were UTC (e.g. 7:00 PM becomes `19:00+00:00`), while the guest site formats event times in the guest's own zone. The dashboard reads values back with `iso.slice(0, 16)`, so it looks self-consistent. Fixing it needs a `venues.timezone` column and conversion on save and load, plus venue-zone formatting on the guest site (see `datetime-picker-handoff.md` section 8). Not done yet.
