.PHONY: help build up down logs restart clean dev dev-down dev-logs test db-backup db-restore

# Default target
help:
	@echo "Event Organization Platform - Docker Commands"
	@echo ""
	@echo "Production:"
	@echo "  make build        - Build Docker images"
	@echo "  make up           - Start all services"
	@echo "  make down         - Stop all services"
	@echo "  make logs         - View logs"
	@echo "  make restart      - Restart all services"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start development environment"
	@echo "  make dev-down     - Stop development environment"
	@echo "  make dev-logs     - View development logs"
	@echo ""
	@echo "Database:"
	@echo "  make db-backup    - Backup database"
	@echo "  make db-restore   - Restore database from backup"
	@echo "  make db-shell     - Open PostgreSQL shell"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean        - Remove all containers and volumes"
	@echo "  make test         - Run tests in container"
	@echo "  make shell        - Open shell in app container"

# Production commands
build:
	docker-compose build

up:
	docker-compose up -d
	@echo "Services started. API: http://localhost:3000"
	@echo "Swagger docs: http://localhost:3000/api/docs"

down:
	docker-compose down

logs:
	docker-compose logs -f

restart:
	docker-compose restart

# Development commands
dev:
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started"
	@echo "API: http://localhost:3000"
	@echo "pgAdmin: http://localhost:5050"

dev-down:
	docker-compose -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.dev.yml logs -f

# Database commands
db-backup:
	@echo "Creating database backup..."
	docker-compose exec postgres pg_dump -U postgres event_organization_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup created successfully"

db-restore:
	@echo "Restoring database from backup.sql..."
	docker-compose exec -T postgres psql -U postgres event_organization_db < backup.sql
	@echo "Database restored successfully"

db-shell:
	docker-compose exec postgres psql -U postgres -d event_organization_db

# Utility commands
clean:
	docker-compose down -v
	@echo "All containers and volumes removed"

test:
	docker-compose exec app npm run test

shell:
	docker-compose exec app sh

# Quick setup
setup:
	@echo "Setting up Event Organization Platform..."
	cp .env.docker .env
	@echo "Environment file created. Please update JWT_SECRET in .env"
	@echo "Then run: make up"
