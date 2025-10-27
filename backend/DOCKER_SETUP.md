# Docker Setup - Quick Reference

This is a quick reference guide for getting started with Docker. For detailed documentation, see [DOCKER.md](./DOCKER.md).

## Prerequisites

- Docker Desktop installed ([Download](https://www.docker.com/products/docker-desktop))
- Docker Compose v2.0+ (included with Docker Desktop)

## Quick Start (3 Steps)

### 1. Setup Environment

```bash
# Copy the Docker environment template
cp .env.docker .env

# Edit .env and change JWT_SECRET to a secure random string
nano .env
```

**Important:** Change `JWT_SECRET` to a strong random value:
```bash
# Generate a secure JWT secret
openssl rand -base64 32
```

### 2. Start Services

```bash
# Using npm scripts (recommended)
npm run docker:up

# Or using docker-compose directly
docker-compose up -d

# Or using Makefile
make up
```

### 3. Verify Installation

```bash
# Check if services are running
docker-compose ps

# View logs
npm run docker:logs

# Test the API
curl http://localhost:3000
```

**Access Points:**
- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs
- pgAdmin: http://localhost:5050 (with `--profile tools`)

## Common Commands

### Using npm scripts (Easiest)

```bash
# Production
npm run docker:up          # Start services
npm run docker:down        # Stop services
npm run docker:logs        # View logs
npm run docker:build       # Rebuild images

# Development (with hot reload)
npm run docker:dev         # Start dev environment
npm run docker:dev:down    # Stop dev environment
npm run docker:dev:logs    # View dev logs
```

### Using Makefile (Convenient)

```bash
make help          # Show all available commands
make up            # Start production
make dev           # Start development
make logs          # View logs
make down          # Stop services
make clean         # Remove everything
make db-backup     # Backup database
make db-shell      # Open PostgreSQL shell
```

### Using docker-compose (Direct)

```bash
# Production
docker-compose up -d
docker-compose down
docker-compose logs -f
docker-compose ps

# Development
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml down
```

## Development vs Production

### Production Mode (`docker-compose.yml`)
- Optimized multi-stage build
- Smaller image size
- Production dependencies only
- No source code mounting
- Best for deployment

```bash
npm run docker:up
```

### Development Mode (`docker-compose.dev.yml`)
- Hot reload enabled
- Source code mounted as volume
- All dependencies installed
- Debug port exposed (9229)
- pgAdmin included
- Best for local development

```bash
npm run docker:dev
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 3000
lsof -i :3000

# Change port in .env
PORT=3001
```

### Services Won't Start

```bash
# View detailed logs
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Failed

```bash
# Check postgres health
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Restart postgres
docker-compose restart postgres
```

### Reset Everything

```bash
# Stop and remove everything (including data)
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Database Management

### Backup Database

```bash
# Using Makefile
make db-backup

# Or manually
docker-compose exec postgres pg_dump -U postgres event_organization_db > backup.sql
```

### Restore Database

```bash
# Using Makefile
make db-restore

# Or manually
docker-compose exec -T postgres psql -U postgres event_organization_db < backup.sql
```

### Access Database Shell

```bash
# Using Makefile
make db-shell

# Or manually
docker-compose exec postgres psql -U postgres -d event_organization_db
```

### Use pgAdmin (GUI)

```bash
# Start with pgAdmin
docker-compose --profile tools up -d

# Or in development mode (pgAdmin included by default)
npm run docker:dev

# Access at http://localhost:5050
# Login: admin@admin.com / admin
```

**Add Server in pgAdmin:**
- Name: Event Platform
- Host: `postgres`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`
- Database: `event_organization_db`

## Testing the API

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

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Event (with token)

```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Tech Conference 2025",
    "shortDescription": "Annual tech conference",
    "organizerId": "org-id",
    "startAt": "2025-06-15T09:00:00Z",
    "endAt": "2025-06-15T18:00:00Z",
    "capacity": 500
  }'
```

## Environment Variables

Key variables in `.env`:

```env
# Database (use 'postgres' as host for Docker)
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=event_organization_db

# JWT (CHANGE THIS!)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRATION=7d

# Application
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*
```

## Docker Compose Services

### app (NestJS API)
- Port: 3000
- Container: event-platform-api
- Depends on: postgres

### postgres (Database)
- Port: 5432
- Container: event-platform-db
- Volume: postgres_data

### pgAdmin (Optional)
- Port: 5050
- Container: event-platform-pgadmin
- Profile: tools

## Useful Commands

```bash
# View container resource usage
docker stats

# Execute command in container
docker-compose exec app npm run test

# Access app container shell
docker-compose exec app sh

# View all containers
docker ps -a

# View all images
docker images

# Clean up unused resources
docker system prune -a

# View volumes
docker volume ls

# Remove specific volume
docker volume rm event-organization-platform_postgres_data
```

## CI/CD Integration

A GitHub Actions workflow is included at `.github/workflows/docker-build.yml`.

**Setup:**
1. Add secrets to your GitHub repository:
   - `DOCKER_USERNAME`
   - `DOCKER_PASSWORD`

2. Push to main/develop branch or create a tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

## Production Deployment

### Security Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use strong database password
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins (not `*`)
- [ ] Disable TypeORM `synchronize` (use migrations)
- [ ] Enable HTTPS/SSL
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set resource limits
- [ ] Use secrets management (not .env files)

### Deploy to Production Server

```bash
# On your server
git clone <repository>
cd event-organization-platform

# Setup environment
cp .env.docker .env
nano .env  # Configure production values

# Start services
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f
```

## Next Steps

1. ✅ Start services with `npm run docker:up`
2. ✅ Access Swagger docs at http://localhost:3000/api/docs
3. ✅ Test API endpoints
4. ✅ Import Postman collection from `postman/` folder
5. ✅ Read [DOCKER.md](./DOCKER.md) for advanced usage

## Support

For detailed documentation:
- [DOCKER.md](./DOCKER.md) - Complete Docker guide
- [README.md](./README.md) - Project overview
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference
- [QUICK_START.md](./QUICK_START.md) - Quick start guide

## Common Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | Change `PORT` in .env |
| Database connection failed | Check postgres is healthy: `docker-compose ps` |
| JWT errors | Ensure `JWT_SECRET` is set in .env |
| Permission denied | Run `sudo chown -R $USER:$USER .` |
| Out of disk space | Run `docker system prune -a` |

---

**Quick Commands Reference:**

```bash
# Start everything
npm run docker:up

# Stop everything
npm run docker:down

# View logs
npm run docker:logs

# Development mode
npm run docker:dev

# Clean up
make clean
```
