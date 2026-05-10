# Deploying ormeet.com on Vercel (Landing + Dashboard)

Goal:

- `https://ormeet.com/` → **Next.js landing page** (`landing-page/`)
- `https://app.ormeet.com/` → **React dashboard** (`front-end/`)
- Backend stays where it is (Render / Railway / etc.)

---

## 1. Deploy the landing page as `ormeet.com`

The `landing-page/` directory is a standalone Next.js app with its own `package.json` and `vercel.json`.

1. In Vercel, **create a new project** and import this repo.
2. Set **Root Directory** = `landing-page`.
3. Framework should auto-detect as **Next.js** (already declared in `landing-page/vercel.json`).
4. Add environment variable:
   - `NEXT_PUBLIC_APP_URL` = `https://app.ormeet.com`
5. Deploy.
6. In Vercel → Project → **Domains**, attach:
   - `ormeet.com`
   - `www.ormeet.com`

The landing navbar already reads `process.env.NEXT_PUBLIC_APP_URL` for all CTAs (Login / Sign up / Browse events / Host events), so they will point to the dashboard automatically.

---

## 2. Deploy the dashboard as `app.ormeet.com`

The `front-end/` directory is a Vite + React SPA with its own `vercel.json`.

1. In Vercel, **create a second project** importing the same repo.
2. Set **Root Directory** = `front-end`.
3. Framework should auto-detect as **Vite**.
4. Add environment variables:
   - `VITE_API_URL` = `https://api.ormeet.com` (or wherever your backend lives)
   - `VITE_LANDING_URL` = `https://ormeet.com`
5. Deploy.
6. In Vercel → Project → **Domains**, attach `app.ormeet.com`.

### What `front-end/vercel.json` does

```json
{
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!assets/|.*\\.(?:js|css|png|jpg|jpeg|gif|svg|webp|ico|webmanifest|json|txt|xml|map|woff2?|ttf|eot)$).*)",
      "destination": "/index.html"
    }
  ]
}
```

This fixes the **`Manifest: Line 1 Syntax error`** issue you saw.

The previous config rewrote *every* path to `index.html`, so `/site.webmanifest` returned the React HTML shell, which the browser tried to parse as JSON. The new rewrite excludes static assets (`.webmanifest`, `.ico`, `.png`, `.js`, `.css`, fonts, etc.) so they're served as real files.

It also fixes the **`No routes matched location "/"`** warning, because:

- If `app.ormeet.com/` is hit, the React app's `/` route now redirects to `VITE_LANDING_URL` (i.e. `https://ormeet.com`).
- During the rollout, even if `ormeet.com` is still pointing at the old React deploy, visitors will be auto-bounced to the landing once you set `VITE_LANDING_URL`.

---

## 3. DNS

Point in your DNS provider:

- `ormeet.com` → Vercel (landing project)
- `www.ormeet.com` → Vercel (landing project)
- `app.ormeet.com` → Vercel (front-end project)
- `api.ormeet.com` → wherever the backend is hosted

Vercel will issue SSL automatically.

---

## 4. Sanity checks after deploy

```bash
# Landing should return HTML and Next.js headers
curl -I https://ormeet.com/

# Manifest should be JSON, NOT html
curl -s https://app.ormeet.com/site.webmanifest | head -1

# Dashboard root should redirect to ormeet.com (HTML containing "Redirecting to Ormeet")
curl -s https://app.ormeet.com/ | grep -i ormeet
```

If `/site.webmanifest` returns `<!doctype html>` you forgot to redeploy `front-end/` after the `vercel.json` change.

---

## 5. Local development unchanged

`npm run dev` in the repo root still starts everything (landing on :3001, dashboard on :5173, backend on :3000). See `HOW_TO_RUN.md`.
