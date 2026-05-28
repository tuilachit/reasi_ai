# Reasi Waitlist Frontend

React/Vite frontend for the Reasi AI waitlist and product landing experience.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and fill in the Supabase values:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Without these values, the site still renders, but waitlist submissions are not persisted.
