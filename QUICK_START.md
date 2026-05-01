# Quick Start Guide - Ormeet Platform

## 🚀 Running the Complete Application

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Git installed

---

## Step 1: Start the Backend API

```bash
# Terminal 1
cd backend
npm install
npm run start:dev
```

✅ Backend running at: **http://localhost:3000**

---

## Step 2: Start the Landing Page

```bash
# Terminal 2
cd landing-page
npm install
npm run dev
```

✅ Landing page running at: **http://localhost:3001**

---

## Step 3: Start the Main Application

```bash
# Terminal 3
cd front-end
npm install
npm run dev
```

✅ Main app running at: **http://localhost:5173**

---

## 🌐 Access the Application

### Landing Page (Public)
**URL:** http://localhost:3001

**Features:**
- Home page with event showcase
- Browse events link
- Login/Sign up buttons
- All public content

### Main Application (Authenticated)
**URL:** http://localhost:5173

**Public Routes:**
- `/login` - Login page
- `/register` - Registration page
- `/browse-events` - Browse all events
- `/event/:id` - Event details

**Protected Routes (requires login):**
- `/dashboard-attendee` - Attendee dashboard
- `/dashboard-organizer` - Organizer dashboard
- `/profile` - User profile
- `/onboarding-*` - Onboarding flows

---

## 🔄 Navigation Flow

1. **Visit Landing Page**
   - Go to http://localhost:3001
   - See the public home page

2. **Click "Sign Up"**
   - Redirects to http://localhost:5173/register
   - Create a new account
   - Email verification sent

3. **Click "Login"**
   - Redirects to http://localhost:5173/login
   - Login with credentials
   - Redirected to appropriate dashboard

4. **Browse Events**
   - Click "Browse Events" from landing page
   - Redirects to http://localhost:5173/browse-events
   - View all available events

---

## 🔧 Configuration

### Landing Page Environment
Create `.env.local` in `/landing-page/`:
```env
NEXT_PUBLIC_APP_URL=http://localhost:5173
```

### Main App Environment
Already configured in `/front-end/.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

### Backend Environment
Already configured in `/backend/.env`:
```env
DATABASE_URL=postgresql://mac@localhost:5432/event_organization_db
JWT_SECRET=your_secret_here
PORT=3000
```

---

## ✅ Testing the Setup

### 1. Test Landing Page
- [ ] Visit http://localhost:3001
- [ ] See home page with events
- [ ] Click "Browse Events" → Should go to main app
- [ ] Click "Login" → Should go to main app login
- [ ] Click "Sign Up" → Should go to main app register

### 2. Test Main App
- [ ] Visit http://localhost:5173/register
- [ ] Create a new account
- [ ] Check email for verification link
- [ ] Login at http://localhost:5173/login
- [ ] See appropriate dashboard

### 3. Test Backend
- [ ] API running at http://localhost:3000
- [ ] Login returns JWT token
- [ ] Events API returns data
- [ ] Protected routes require authentication

---

## 🐛 Troubleshooting

### Landing Page won't start
```bash
cd landing-page
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Main App won't start
```bash
cd front-end
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run start:dev
```

### Database connection error
1. Check PostgreSQL is running
2. Verify database exists: `event_organization_db`
3. Check credentials in `/backend/.env`

### CORS errors
1. Backend should allow `http://localhost:5173` and `http://localhost:3001`
2. Check CORS configuration in `/backend/src/main.ts`

---

## 📱 Mobile Testing

All apps are responsive and work on mobile:
- Landing page: Fully responsive Next.js
- Main app: Mobile-optimized React components
- Backend: RESTful API works with any client

---

## 🎯 What's New

### ✅ Completed Features
1. **Landing page at root domain** - Next.js app serves public content
2. **Enhanced password validation** - 8+ chars, complexity requirements
3. **Email verification improvements** - Resend button, persistent messages
4. **Algeria default country** - Phone input defaults to +213
5. **Custom ticket types** - Flexible ticket creation with validation
6. **Terms & Conditions** - Required checkbox on signup

### 📋 Architecture
- **Landing Page**: Next.js (SEO-optimized, fast loading)
- **Main App**: React + Vite (SPA for authenticated users)
- **Backend**: NestJS (RESTful API with PostgreSQL)

---

## 🚀 Next Steps

1. **Development**: Use the 3-terminal setup above
2. **Testing**: Follow the testing checklist
3. **Production**: See `DEPLOYMENT_SETUP.md` for deployment options

---

## 📞 Need Help?

- Check `DEPLOYMENT_SETUP.md` for detailed deployment info
- Check `IMPLEMENTATION_SUMMARY.md` for feature details
- Review error messages in browser console
- Check backend logs for API errors

---

**Happy coding! 🎉**
