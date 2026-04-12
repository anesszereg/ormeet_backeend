# Database Seeding Guide

This directory contains scripts to populate your Supabase database with realistic test data.

## Seed Script Overview

The `seed.ts` script creates comprehensive test data for all tables in your database:

### Data Created

- **4 Organizations** - Various event organizer companies
- **9 Users** - 4 Organizers and 5 Attendees (all with verified emails)
- **3 Venues** - Physical event locations
- **5 Events** - Different event types (conference, concert, sports, workshop)
- **8 Ticket Types** - Various pricing tiers for events
- **6 Orders** - Mix of paid and pending orders
- **9 Tickets** - Individual tickets linked to orders
- **3 Reviews** - Event reviews from attendees
- **5 Attendance Records** - Check-in records

### Test User Credentials

All users have the same password: `Password123!`

**Organizers:**
- sarah@techconglobal.com (TechCon Global)
- john@musicfestpro.com (Music Festival Productions)
- lisa@sportsevents.com (Sports Events Inc)
- david@workshophub.com (Workshop Hub)

**Attendees:**
- jessica.brown@email.com
- michael.j@email.com
- emily.davis@email.com
- robert.m@email.com
- amanda.t@email.com

## How to Run

### Prerequisites

1. Ensure your database is running and accessible
2. Update your `.env` file with the correct `DATABASE_URL`
3. Make sure all migrations have been run

### Run the Seed Script

```bash
# From the backend directory
cd /Users/mac/Desktop/Ormeet/backend

# Run the seed script
npm run seed
```

Or use the full command:

```bash
npm run seed:full
```

### Expected Output

```
🌱 Starting database seeding...
✅ Database connection established
📦 Creating organizations...
✅ Created 4 organizations
👥 Creating users...
✅ Created 9 users
🏢 Creating venues...
✅ Created 3 venues
🎉 Creating events...
✅ Created 5 events
🎫 Creating ticket types...
✅ Created 8 ticket types
💳 Creating orders...
✅ Created 6 orders
✅ Created 9 tickets
⭐ Creating reviews...
✅ Created 3 reviews
✅ Creating attendance records...
✅ Created 5 attendance records

🎉 Database seeding completed successfully!

📊 Summary:
   - 4 Organizations
   - 9 Users (4 Organizers, 5 Attendees)
   - 3 Venues
   - 5 Events
   - 8 Ticket Types
   - 6 Orders
   - 9 Tickets
   - 3 Reviews
   - 5 Attendance Records
```

## Events Created

1. **Tech Innovation Summit 2026** - Conference in San Francisco (30 days from now)
2. **Summer Music Festival LA** - Concert in New York (60 days from now)
3. **Marathon Championship 2026** - Sports event in Austin (90 days from now)
4. **Web Development Bootcamp** - Online workshop (45-59 days from now)
5. **Rooftop Rhythms** - Intimate concert in LA (20 days from now)

## Revenue Data

The seed creates realistic revenue data:
- Total revenue from paid orders: ~$3,063.96
- Mix of different ticket prices ($45 - $1,200)
- Service fees and processing fees included
- One pending order for testing

## Customization

To customize the seed data:

1. Edit `src/scripts/seed.ts`
2. Modify the data arrays for organizations, users, events, etc.
3. Adjust quantities, prices, or dates as needed
4. Re-run `npm run seed`

## Troubleshooting

**Error: "Database connection failed"**
- Check your `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Verify network connectivity to Supabase

**Error: "Duplicate key value violates unique constraint"**
- The database already has data
- Either clear existing data or modify the seed script to use different values

**Error: "Cannot find module"**
- Run `npm install` to ensure all dependencies are installed
- Check that TypeScript is properly configured

## Clearing Data

To start fresh, you can manually delete data from tables in this order:

```sql
-- Delete in reverse order of foreign key dependencies
DELETE FROM attendance;
DELETE FROM reviews;
DELETE FROM tickets;
DELETE FROM orders;
DELETE FROM ticket_types;
DELETE FROM events;
DELETE FROM venues;
DELETE FROM users;
DELETE FROM organizations;
```

Or use a database management tool like pgAdmin or Supabase Dashboard.

## Next Steps

After seeding:

1. Login to your frontend with any test user credentials
2. Browse events as an attendee
3. Create new events as an organizer
4. Test order flows and ticket purchases
5. Verify dashboard analytics and revenue calculations
