# Centerform

Digital concierge platform (PWA) for venues and standalone events. Built with Next.js App Router, Supabase, and Capacitor for mobile.

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, TypeScript strict mode)
- **Database**: Supabase (PostgreSQL, remote instance — no local Supabase)
- **Auth**: NextAuth.js 5 beta (Google OAuth + Supabase)
- **UI**: shadcn/ui (New York style) + Radix UI + Tailwind CSS 4
- **Mobile**: Capacitor (iOS/Android)
- **Package Manager**: pnpm

## Commands

- `pnpm dev` — Start dev server (Turbopack)
- `pnpm build` — Production build
- `pnpm lint` — ESLint
- `pnpm format` — Prettier (format all files)
- `pnpm format:check` — Check formatting

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Sign-in/sign-up routes
│   ├── api/auth/           # NextAuth API handler
│   ├── dashboard/          # Protected admin routes (venue, events)
│   └── [slug]/             # Public venue/event pages (info, dining, events, etc.)
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── guest/              # Page-specific components
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── queries.ts          # Supabase query functions
│   ├── utils.ts            # cn() utility
│   ├── slug-resolver.ts    # Route resolution (venue vs event)
│   └── supabase/           # Supabase clients (server.ts, client.ts, middleware.ts)
├── types/index.ts          # All TypeScript interfaces
└── hooks/                  # React hooks
```

## Conventions

- **Formatting**: Double quotes, semicolons, 2-space indent, trailing commas, 100 char width
- **Styling**: Tailwind classes for layout; CSS variables for dynamic theming per venue/event
- **Components**: Follow shadcn/ui patterns with `data-slot` attributes and CVA variants
- **Database queries**: Add to `src/lib/queries.ts` using the Supabase client pattern
- **Path alias**: `@/*` maps to `src/*`
- **Branches**: `develop` for active work, `main` for production

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (optional)
