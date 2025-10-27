# Quick Start Guide

## 1. Setup Database

```bash
# Install PostgreSQL (if not already installed)
# macOS
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb event_organization_db

# Or using psql
psql postgres
CREATE DATABASE event_organization_db;
\q
```

## 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

Update these values:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=event_organization_db
JWT_SECRET=change-this-to-a-secure-random-string
JWT_EXPIRATION=7d
PORT=3000
NODE_ENV=development
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Start the Application

```bash
# Development mode with hot reload
npm run start:dev
```

The API will be running at `http://localhost:3000`

## 5. Test the API

### Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "roles": ["organizer"]
  }'
```

Response:
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "roles": ["organizer"],
    ...
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create an Event (Authenticated)

```bash
# Save the token from login/register
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Tech Conference 2025",
    "shortDescription": "Annual technology conference",
    "longDescription": "Join us for the biggest tech conference of the year...",
    "organizerId": "your-organization-id",
    "category": "Technology",
    "tags": ["tech", "conference", "networking"],
    "startAt": "2025-06-15T09:00:00Z",
    "endAt": "2025-06-15T18:00:00Z",
    "timezone": "UTC",
    "capacity": 500,
    "ageLimit": 18,
    "allowReentry": true,
    "refundsAllowed": false
  }'
```

### Get All Events

```bash
curl http://localhost:3000/events
```

### Get Event by ID

```bash
curl http://localhost:3000/events/{event-id}
```

### Filter Events

```bash
# By status
curl "http://localhost:3000/events?status=published"

# By category
curl "http://localhost:3000/events?category=Technology"

# By organizer
curl "http://localhost:3000/events?organizerId={org-id}"
```

### Publish an Event

```bash
curl -X POST http://localhost:3000/events/{event-id}/publish \
  -H "Authorization: Bearer $TOKEN"
```

### Update an Event

```bash
curl -X PATCH http://localhost:3000/events/{event-id} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Updated Event Title",
    "capacity": 600
  }'
```

### Delete an Event

```bash
curl -X DELETE http://localhost:3000/events/{event-id} \
  -H "Authorization: Bearer $TOKEN"
```

## 6. Database Schema

The database tables will be automatically created when you start the application (thanks to TypeORM's `synchronize: true` in development mode).

**⚠️ Important:** In production, set `synchronize: false` and use migrations instead.

## 7. Common Issues

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Make sure PostgreSQL is running:
```bash
brew services start postgresql@14
# or
sudo service postgresql start
```

### JWT Secret Warning
```
Warning: Using default JWT secret
```
**Solution:** Set a strong JWT_SECRET in your .env file

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:** Change the PORT in .env or kill the process using port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

## 8. Next Steps

1. **Create Organizations Module** - Manage event organizers
2. **Create Venues Module** - Manage event locations
3. **Create Tickets Module** - Handle ticket sales
4. **Create Orders Module** - Process payments
5. **Add Swagger Documentation** - API documentation
6. **Add Validation Pipes** - Request validation
7. **Add Error Handling** - Global exception filters
8. **Add Logging** - Winston or Pino
9. **Add Testing** - Unit and E2E tests
10. **Add Migrations** - Database version control

## 9. Development Tips

### Watch Mode
```bash
npm run start:dev
```
Automatically restarts on file changes.

### Debug Mode
Add this to your `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "attach",
  "name": "Attach NestJS",
  "port": 9229,
  "restart": true
}
```

Then run:
```bash
npm run start:debug
```

### Check Database Tables
```bash
psql event_organization_db

# List all tables
\dt

# Describe a table
\d users

# Query data
SELECT * FROM users;
```

## 10. Production Deployment

Before deploying to production:

1. Set `NODE_ENV=production`
2. Set `synchronize: false` in TypeORM config
3. Create and run migrations
4. Use strong JWT_SECRET
5. Enable CORS properly
6. Add rate limiting
7. Add helmet for security headers
8. Set up logging and monitoring
9. Use environment-specific configs
10. Add health check endpoints

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT Best Practices](https://jwt.io/introduction)
