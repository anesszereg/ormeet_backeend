# How to Run Ormeet

## TL;DR

```bash
npm install
npm run install:all
npm run dev
```

Then open: **http://localhost:3001** ← Landing page (Next.js)

From the landing page, clicking "Login", "Sign up", "Browse events", etc. takes you to the React dashboard at `http://localhost:5173`.

---

## What Runs Where

| App           | Tech     | URL                     | Port |
| ------------- | -------- | ----------------------- | ---- |
| Landing page  | Next.js  | http://localhost:3001   | 3001 |
| Dashboard / Frontend | React (Vite) | http://localhost:5173 | 5173 |
| Backend API   | NestJS   | http://localhost:3000   | 3000 |

The single `npm run dev` command starts all three concurrently.

---

## First-Time Setup

```bash
# 1. Install root dependencies (concurrently runner)
npm install

# 2. Install dependencies for all sub-apps
npm run install:all

# 3. Start everything
npm run dev
```

---

## Navigation Flow

1. User opens **http://localhost:3001** → Next.js **landing page**
2. User clicks **Login / Sign up / Browse events** in the landing navbar
3. Browser navigates to **http://localhost:5173/login** (etc.) → React **dashboard / frontend**
4. The frontend talks to the backend at **http://localhost:3000**

The landing page's `Navbar.tsx` already points its CTAs at `process.env.NEXT_PUBLIC_APP_URL` (default `http://localhost:5173`).

---

## Useful Scripts

```bash
npm run dev              # Start backend + landing + frontend together
npm run dev:backend      # Backend only
npm run dev:landing      # Landing page only (port 3001)
npm run dev:frontend     # React dashboard only (port 5173)
npm run build            # Build landing + frontend for production
```

---

## Optional: Override Landing → Frontend URL

If you run the frontend on a different port, create `landing-page/.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:5173
```
