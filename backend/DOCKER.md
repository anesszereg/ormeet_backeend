# Docker Setup Guide

This guide explains how to run the Event Organization Platform using Docker and Docker Compose.

## Prerequisites

- Docker (v20.10 or higher)
- Docker Compose (v2.0 or higher)

## Quick Start

### 1. Production Mode

```bash
# Copy environment file
cp .env.docker .env

# Update JWT_SECRET in .env with a secure random string
nano .env

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

The API will be available at `http://localhost:3000`

Swagger documentation: `http://localhost:3000/api/docs`

### 2. Development Mode

```bash
# Copy environment file
cp .env.docker .env

# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs with hot reload
docker-compose -f docker-compose.dev.yml logs -f app

# Stop services
docker-compose -f docker-compose.dev.yml down
```

Development mode includes:
- Hot reload on code changes
- Source code mounted as volume
- Debug port exposed (9229)
- pgAdmin for database management

## Services

### Main Services

#### 1. **app** - NestJS Application
- **Port:** 3000
- **Container:** event-platform-api
- **Health Check:** HTTP GET on port 3000

#### 2. **postgres** - PostgreSQL Database
- **Port:** 5432
- **Container:** event-platform-db
- **User:** postgres
- **Database:** event_organization_db
- **Volume:** postgres_data

#### 3. **pgAdmin** (Optional)
- **Port:** 5050
- **Container:** event-platform-pgadmin
- **Default Login:** admin@admin.com / admin
- **Profile:** tools (use `--profile tools` to enable)

## Docker Commands

### Build and Run

```bash
# Build images
docker-compose build

# Start services in background
docker-compose up -d

# Start with rebuild
docker-compose up -d --build

# Start specific service
docker-compose up -d app
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100 app
```

### Service Management

```bash
# Stop services
docker-compose stop

# Start stopped services
docker-compose start

# Restart services
docker-compose restart

# Remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v
```

### Execute Commands in Container

```bash
# Access app container shell
docker-compose exec app sh

# Access postgres container
docker-compose exec postgres psql -U postgres -d event_organization_db

# Run npm commands
docker-compose exec app npm run test

# Check app health
docker-compose exec app wget -qO- http://localhost:3000
```

## Development Workflow

### Hot Reload Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Edit files in ./src - changes will auto-reload

# View logs
docker-compose -f docker-compose.dev.yml logs -f app
```

### Debugging

The development container exposes port 9229 for debugging:

1. Start dev environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

2. Attach debugger to `localhost:9229`

3. VS Code launch.json example:
   ```json
   {
     "type": "node",
     "request": "attach",
     "name": "Docker: Attach to Node",
     "port": 9229,
     "address": "localhost",
     "localRoot": "${workspaceFolder}",
     "remoteRoot": "/app",
     "protocol": "inspector"
   }
   ```

### Database Management with pgAdmin

```bash
# Start with pgAdmin
docker-compose --profile tools up -d

# Or in development
docker-compose -f docker-compose.dev.yml up -d
```

Access pgAdmin at `http://localhost:5050`

**Add Server in pgAdmin:**
- Host: `postgres`
- Port: `5432`
- Username: `postgres`
- Password: `postgres`
- Database: `event_organization_db`

## Environment Variables

### Required Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_HOST` | Database host | `postgres` |
| `DATABASE_PORT` | Database port | `5432` |
| `DATABASE_USERNAME` | Database user | `postgres` |
| `DATABASE_PASSWORD` | Database password | `postgres` |
| `DATABASE_NAME` | Database name | `event_organization_db` |
| `JWT_SECRET` | JWT secret key | **Required** |
| `JWT_EXPIRATION` | Token expiration | `7d` |
| `PORT` | Application port | `3000` |
| `NODE_ENV` | Environment | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CORS_ORIGIN` | CORS origin | `*` |
| `PGADMIN_EMAIL` | pgAdmin email | `admin@admin.com` |
| `PGADMIN_PASSWORD` | pgAdmin password | `admin` |
| `PGADMIN_PORT` | pgAdmin port | `5050` |

## Database Operations

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres event_organization_db > backup.sql

# Or with timestamp
docker-compose exec postgres pg_dump -U postgres event_organization_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres event_organization_db < backup.sql
```

### Reset Database

```bash
# Stop services
docker-compose down

# Remove volumes (WARNING: This deletes all data)
docker volume rm event-organization-platform_postgres_data

# Start fresh
docker-compose up -d
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :5432

# Change port in .env
PORT=3001
DATABASE_PORT=5433
```

### Database Connection Issues

```bash
# Check postgres health
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres

# Verify connection
docker-compose exec postgres pg_isready -U postgres
```

### Application Won't Start

```bash
# Check logs
docker-compose logs app

# Rebuild without cache
docker-compose build --no-cache app
docker-compose up -d app

# Check environment variables
docker-compose exec app env
```

### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Or run as root (not recommended)
docker-compose exec -u root app sh
```

## Production Deployment

### Security Checklist

- [ ] Change `JWT_SECRET` to a strong random string
- [ ] Set `NODE_ENV=production`
- [ ] Use strong database password
- [ ] Disable `synchronize` in TypeORM (use migrations)
- [ ] Configure proper CORS origins
- [ ] Enable HTTPS/SSL
- [ ] Set up proper logging
- [ ] Configure health checks
- [ ] Set resource limits
- [ ] Use secrets management

### Resource Limits

Add to docker-compose.yml:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Health Checks

Both services include health checks:

```bash
# Check health status
docker-compose ps

# View health check logs
docker inspect --format='{{json .State.Health}}' event-platform-api
```

## Docker Hub Deployment

### Build and Push Image

```bash
# Build production image
docker build -t yourusername/event-platform:latest .

# Tag with version
docker tag yourusername/event-platform:latest yourusername/event-platform:1.0.0

# Push to Docker Hub
docker push yourusername/event-platform:latest
docker push yourusername/event-platform:1.0.0
```

### Pull and Run

```bash
# Pull image
docker pull yourusername/event-platform:latest

# Run with environment variables
docker run -d \
  -p 3000:3000 \
  -e DATABASE_HOST=your-db-host \
  -e JWT_SECRET=your-secret \
  yourusername/event-platform:latest
```

## Multi-Stage Build Benefits

The Dockerfile uses multi-stage builds:

1. **Builder Stage**
   - Installs all dependencies
   - Compiles TypeScript to JavaScript
   - Creates optimized build

2. **Production Stage**
   - Smaller image size
   - Only production dependencies
   - Non-root user for security
   - Dumb-init for proper signal handling

## Useful Commands

```bash
# View container resource usage
docker stats

# Clean up unused resources
docker system prune -a

# View image sizes
docker images

# Remove specific image
docker rmi event-organization-platform-app

# Export/Import volumes
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## Next Steps

1. Configure production environment variables
2. Set up SSL/TLS certificates
3. Configure reverse proxy (nginx)
4. Set up monitoring and logging
5. Implement database migrations
6. Configure backup strategy
7. Set up CI/CD pipeline

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
