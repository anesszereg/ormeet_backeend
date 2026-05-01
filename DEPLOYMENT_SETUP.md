# Deployment Setup - Multi-App Architecture

## Architecture Overview

The Ormeet platform consists of three separate applications:

1. **Landing Page** (Next.js) - `/landing-page/`
2. **Main Application** (React + Vite) - `/front-end/`
3. **Backend API** (NestJS) - `/backend/`

## Port Configuration

### Development
- **Landing Page**: `http://localhost:3001` (Next.js)
- **Main App**: `http://localhost:5173` (Vite)
- **Backend API**: `http://localhost:3000` (NestJS)

### Production
All apps should be served through a reverse proxy (nginx/Apache) or a platform like Vercel/Netlify.

---

## Development Setup

### 1. Start Backend API
```bash
cd backend
npm install
npm run start:dev
# Runs on http://localhost:3000
```

### 2. Start Landing Page
```bash
cd landing-page
npm install
npm run dev
# Runs on http://localhost:3001
```

### 3. Start Main Application
```bash
cd front-end
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Routing Strategy

### Landing Page (Next.js) - Public Routes
Serves at root domain: `https://ormeet.com/`

**Routes:**
- `/` - Home page
- `/about` - About page (if exists)
- `/pricing` - Pricing page (if exists)
- `/contact` - Contact page (if exists)

**Links to Main App:**
- "Get Started" → `http://localhost:5173/register`
- "Login" → `http://localhost:5173/login`
- "Browse Events" → `http://localhost:5173/browse-events`

### Main Application (React) - Authenticated Routes
Serves at: `https://ormeet.com/app/*` (in production)

**Public Routes:**
- `/login` - Login page
- `/register` - Registration page
- `/browse-events` - Public event browsing
- `/event/:id` - Event details
- `/forgot-password` - Password reset

**Protected Routes:**
- `/dashboard-attendee` - Attendee dashboard
- `/dashboard-organizer` - Organizer dashboard
- `/profile` - User profile
- `/onboarding-*` - Onboarding flows

### Backend API
Serves at: `https://ormeet.com/api/*` (in production)

**Endpoints:**
- `/api/auth/*` - Authentication
- `/api/events/*` - Events
- `/api/users/*` - Users
- `/api/organizations/*` - Organizations
- etc.

---

## Production Deployment Options

### Option 1: Nginx Reverse Proxy (Recommended for VPS)

```nginx
server {
    listen 80;
    server_name ormeet.com www.ormeet.com;

    # Landing Page (Next.js)
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Main App (React)
    location /app {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Vercel + Netlify (Recommended for Easy Deployment)

**Landing Page (Vercel):**
```bash
cd landing-page
vercel --prod
# Configure domain: ormeet.com
```

**Main App (Netlify):**
```bash
cd front-end
npm run build
netlify deploy --prod
# Configure as subdomain: app.ormeet.com
```

**Backend (Railway/Render/Heroku):**
```bash
cd backend
# Deploy to your preferred platform
# Configure as: api.ormeet.com
```

### Option 3: Docker Compose (Recommended for Containerization)

Create `docker-compose.yml` in root:

```yaml
version: '3.8'

services:
  landing-page:
    build: ./landing-page
    ports:
      - "3001:3000"
    environment:
      - NODE_ENV=production

  main-app:
    build: ./front-end
    ports:
      - "5173:5173"
    environment:
      - VITE_API_URL=http://backend:3000

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - NODE_ENV=production

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - landing-page
      - main-app
      - backend
```

---

## Environment Variables

### Landing Page (.env.local)
```env
# No backend calls needed for static landing page
NEXT_PUBLIC_APP_URL=http://localhost:5173
```

### Main App (.env)
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

### Backend (.env)
```env
DATABASE_URL=postgresql://mac@localhost:5432/event_organization_db
JWT_SECRET=your_secret_here
PORT=3000
NODE_ENV=development
```

---

## Navigation Between Apps

### From Landing Page to Main App

Update landing page components to link to main app:

**Example: Update Navbar in Landing Page**
```tsx
// landing-page/src/components/Navbar.tsx
const MAIN_APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

<a href={`${MAIN_APP_URL}/login`}>Login</a>
<a href={`${MAIN_APP_URL}/register`}>Sign Up</a>
<a href={`${MAIN_APP_URL}/browse-events`}>Browse Events</a>
```

### From Main App to Landing Page

Update main app to link back to landing:

```tsx
// front-end/src/components/Navbar.tsx
const LANDING_URL = import.meta.env.VITE_LANDING_URL || 'http://localhost:3001';

<a href={LANDING_URL}>Home</a>
```

---

## Build Commands

### Landing Page
```bash
cd landing-page
npm run build
npm run start  # Production server
```

### Main App
```bash
cd front-end
npm run build
# Outputs to front-end/dist/
# Serve with nginx or static hosting
```

### Backend
```bash
cd backend
npm run build
npm run start:prod
```

---

## Testing the Setup

### Local Development
1. Start all three servers
2. Visit `http://localhost:3001` - Should show landing page
3. Click "Login" - Should redirect to `http://localhost:5173/login`
4. Login should call `http://localhost:3000/api/auth/login`

### Production
1. Visit `https://ormeet.com` - Landing page
2. Click "Login" - Should go to `https://ormeet.com/app/login` or `https://app.ormeet.com/login`
3. API calls go to `https://ormeet.com/api/*` or `https://api.ormeet.com/*`

---

## Current Status

✅ Landing Page exists in `/landing-page/` (Next.js)
✅ Main App exists in `/front-end/` (React)
✅ Backend exists in `/backend/` (NestJS)
⚠️ Need to configure navigation between apps
⚠️ Need to set up reverse proxy or subdomain routing

---

## Next Steps

1. **Update Landing Page Navigation**
   - Add environment variable for main app URL
   - Update all CTAs to link to main app

2. **Update Main App Configuration**
   - Remove root route (`/`) from React Router
   - Add environment variable for landing page URL
   - Update "Home" links to point to landing page

3. **Choose Deployment Strategy**
   - Option 1: Single domain with nginx reverse proxy
   - Option 2: Subdomains (app.ormeet.com, api.ormeet.com)
   - Option 3: Separate domains

4. **Configure CORS**
   - Backend needs to allow requests from both landing and main app domains

5. **Test Integration**
   - Verify navigation flows
   - Test authentication across apps
   - Check API connectivity

---

## Recommended Approach

For simplicity and SEO, I recommend:

1. **Landing Page**: `https://ormeet.com/` (Next.js on Vercel)
2. **Main App**: `https://app.ormeet.com/` (React on Netlify)
3. **Backend**: `https://api.ormeet.com/` (NestJS on Railway/Render)

This gives you:
- Clean URLs
- Easy deployment
- Independent scaling
- Simple DNS configuration
