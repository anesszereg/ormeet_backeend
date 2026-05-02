# Setup with Nginx - Complete Integration

This guide shows how to run the complete Ormeet platform with nginx routing, so the Next.js landing page serves at the root domain.

---

## Architecture

```
http://localhost (nginx on port 80)
├── /                    → Next.js Landing Page (port 3001)
├── /login               → React Main App (port 5173)
├── /register            → React Main App (port 5173)
├── /browse-events       → React Main App (port 5173)
├── /dashboard-*         → React Main App (port 5173)
└── /api/*               → Backend API (port 3000)
```

---

## Prerequisites

1. **Install Nginx**

**macOS:**
```bash
brew install nginx
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install nginx
```

**Windows:**
Download from: https://nginx.org/en/download.html

---

## Setup Steps

### Step 1: Start All Services

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run start:dev
```
✅ Running on http://localhost:3000

**Terminal 2 - Landing Page:**
```bash
cd landing-page
npm install
npm run dev
```
✅ Running on http://localhost:3001

**Terminal 3 - Main App:**
```bash
cd front-end
npm install
npm run dev
```
✅ Running on http://localhost:5173

---

### Step 2: Configure Nginx

**Option A: Use provided config (macOS/Linux)**

```bash
# Copy the nginx.conf to nginx config directory
sudo cp nginx.conf /usr/local/etc/nginx/servers/ormeet.conf

# Test configuration
sudo nginx -t

# Restart nginx
sudo nginx -s reload
```

**Option B: Manual configuration**

Edit your nginx config file:
- **macOS**: `/usr/local/etc/nginx/nginx.conf`
- **Ubuntu**: `/etc/nginx/sites-available/default`
- **Windows**: `C:\nginx\conf\nginx.conf`

Copy the contents from `nginx.conf` in the project root.

---

### Step 3: Access the Application

**Visit:** http://localhost

You should see:
1. ✅ Next.js landing page at root
2. ✅ Click "Login" → Goes to React app
3. ✅ Click "Sign Up" → Goes to React app
4. ✅ Click "Browse Events" → Goes to React app
5. ✅ All API calls work through /api/*

---

## Without Nginx (Development Alternative)

If you don't want to use nginx during development:

### Access Points:
- **Landing Page**: http://localhost:3001
- **Main App**: http://localhost:5173/login (direct access)
- **Backend**: http://localhost:3000

### Navigation:
- Start at landing page (port 3001)
- Click buttons to navigate to main app (port 5173)
- Apps communicate via configured URLs

---

## Troubleshooting

### Nginx won't start
```bash
# Check if nginx is already running
sudo nginx -t

# Stop nginx
sudo nginx -s stop

# Start nginx
sudo nginx
```

### Port 80 already in use
```bash
# Find what's using port 80
sudo lsof -i :80

# Kill the process or change nginx port in config
```

### Landing page not showing
1. Check Next.js is running on port 3001
2. Check nginx config points to correct port
3. Check nginx error logs:
   - macOS: `/usr/local/var/log/nginx/error.log`
   - Ubuntu: `/var/log/nginx/error.log`

### React app routes not working
1. Verify all routes are listed in nginx config
2. Check React app is running on port 5173
3. Reload nginx: `sudo nginx -s reload`

---

## Production Deployment

For production, you have several options:

### Option 1: Single Server with Nginx
- Deploy all three apps on one server
- Use nginx to route traffic
- Configure SSL with Let's Encrypt

### Option 2: Separate Domains/Subdomains
- **Landing**: https://ormeet.com (Vercel)
- **Main App**: https://app.ormeet.com (Netlify)
- **Backend**: https://api.ormeet.com (Railway/Render)

### Option 3: Vercel with Rewrites
Configure `vercel.json` in landing-page:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://api.ormeet.com/api/:path*"
    },
    {
      "source": "/(login|register|browse-events|dashboard-.*)",
      "destination": "https://app.ormeet.com/$1"
    }
  ]
}
```

---

## Testing Checklist

- [ ] Visit http://localhost - See landing page
- [ ] Click "Sign Up" - Goes to registration
- [ ] Click "Login" - Goes to login page
- [ ] Click "Browse Events" - Shows events
- [ ] Register new account - API call works
- [ ] Login - Authentication works
- [ ] Navigate to dashboard - Protected routes work
- [ ] All images and assets load correctly

---

## Environment Variables

Make sure these are set:

**Landing Page (.env.local):**
```env
NEXT_PUBLIC_APP_URL=http://localhost
```

**Main App (.env):**
```env
VITE_API_URL=http://localhost/api
```

**Backend (.env):**
```env
PORT=3000
FRONTEND_URL=http://localhost
```

---

## Quick Commands

**Start everything:**
```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd landing-page && npm run dev

# Terminal 3
cd front-end && npm run dev

# Terminal 4 (if using nginx)
sudo nginx
```

**Stop nginx:**
```bash
sudo nginx -s stop
```

**Reload nginx config:**
```bash
sudo nginx -s reload
```

---

## Summary

With nginx configured:
- ✅ Landing page at root (http://localhost)
- ✅ Seamless navigation to React app
- ✅ Single domain for all services
- ✅ Production-ready architecture

Without nginx (development):
- ✅ Landing page at http://localhost:3001
- ✅ Main app at http://localhost:5173
- ✅ Manual navigation between apps
- ✅ Simpler setup for quick development
