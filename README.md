# Reasi AI

Reasi AI is a product/waitlist site for an AI grocery agent. The product promise is simple: plan weekly meals, build the shopping list, suggest smarter swaps, and prepare the shop for human approval.

Live demo: https://reasi-ai.vercel.app

## Why This Project Matters

Most grocery apps stop at lists. Reasi frames grocery planning as an agent workflow: understand household preferences, generate meals, consolidate ingredients, suggest budget-aware swaps, and keep the user in control before checkout.

This repo currently contains the public waitlist/product experience used to validate demand and collect early users.

## Features

- Responsive React product site with app-preview screens and animated sections
- Supabase-backed waitlist form with duplicate-email handling
- Grocery-context inputs for supermarket and suburb
- Vercel Analytics integration
- Vercel deployment config
- Clear product flow: plan, swap, list, shop, cook

## Tech Stack

- React 19
- Vite 7
- Supabase
- Framer Motion
- Lucide React
- Vercel Analytics
- CSS modules/global CSS

## Project Structure

```text
.
+-- vercel.json
+-- waitlist/
    +-- public/
    |   +-- logos/
    |   +-- reasi-app/
    +-- src/
    |   +-- lib/supabaseClient.js
    |   +-- App.jsx
    |   +-- App.css
    |   +-- index.css
    |   +-- main.jsx
    +-- package.json
    +-- vite.config.js
```

## Run Locally

```bash
cd waitlist
npm install
npm run dev
```

The app runs on the Vite dev server.

## Environment

Waitlist persistence uses Supabase. Add these variables in your local environment or Vercel project:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

If the variables are missing, the site still renders, but waitlist submissions are not persisted.

## Build

```bash
cd waitlist
npm run build
```

## What I Would Improve Next

- Add a short architecture note for the future grocery-agent backend
- Add unit tests for form validation and Supabase submission states
- Add screenshots or a short demo GIF to make the repo easier to review quickly
