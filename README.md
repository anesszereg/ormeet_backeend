# Ormeet - Event Organization Platform

<div align="center">

**A comprehensive event management platform built with NestJS, TypeORM, and PostgreSQL**

[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-336791?logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Docker Deployment](#docker-deployment)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Ormeet** is a full-featured event organization platform that enables organizers to create, manage, and track events while providing attendees with a seamless ticket purchasing and event discovery experience.

### Key Capabilities

- 🎫 **Event Management** - Create, publish, and manage events with detailed information
- 🏢 **Organization Management** - Multi-organization support with role-based access
- 📍 **Venue Management** - Location tracking with geolocation search
- 🎟️ **Ticketing System** - Multiple ticket types, QR codes, and seat assignments
- 💳 **Order Processing** - Complete order management with payment integration support
- ⭐ **Reviews & Ratings** - User feedback system with moderation
- 🎁 **Promotions** - Discount codes and promotional campaigns
- 🔐 **Authentication** - JWT-based auth with role-based access control
- 📊 **Analytics** - View tracking, favorites, and attendance metrics

---

## ✨ Features

### For Event Organizers

- Create and manage multiple organizations
- Design events with rich details (sessions, speakers, images)
- Set up multiple ticket types with different pricing
- Track sales, attendance, and revenue
- Manage promotions and discount codes
- Review and moderate attendee feedback
- Real-time event analytics

### For Attendees

- Browse and discover events by category, location, or date
- Purchase tickets with multiple payment options
- Receive QR codes for event check-in
- Transfer tickets to other users
- Leave reviews and ratings
- Track order history
- Save favorite events

### For Administrators

- Full platform oversight
- User and organization management
- Content moderation
- System-wide analytics
- Security and access control

---

## 🛠 Tech Stack

### Backend

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL 14
- **ORM**: TypeORM 0.3.27
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator & class-transformer
- **API Documentation**: Swagger/OpenAPI

### DevOps

- **Containerization**: Docker & Docker Compose
- **Web Server**: nginx (production)
- **Database Admin**: pgAdmin
- **Process Manager**: dumb-init

### Security

- **Password Hashing**: bcrypt
- **Token Management**: JWT with configurable expiration
- **Role-Based Access Control**: Custom guards and decorators
- **Input Validation**: Global validation pipes

---

## 🏗 Architecture

### Database Schema

The platform uses 11 main entities with comprehensive relationships:

```
Users ─┬─ Organizations ─── Events ─┬─ Ticket Types ─── Tickets
       │                             │
       ├─ Orders ─────────────────────┤
       │                             │
       ├─ Reviews ────────────────────┤
       │                             │
       └─ Tickets                    └─ Promotions

Venues ─── Events
Attendance ─── Tickets
Media (Polymorphic) ─── Events/Venues/Organizations/Users
```

### Module Structure

- **Auth Module** - Authentication & authorization
- **Events Module** - Event lifecycle management
- **Organizations Module** - Organizer management
- **Venues Module** - Location management
- **Tickets Module** - Ticket generation & tracking
- **Ticket Types Module** - Ticket variations & pricing
- **Orders Module** - Payment & order processing
- **Reviews Module** - Ratings & feedback
- **Promotions Module** - Discount campaigns
- **Common Module** - Shared utilities

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Docker & Docker Compose (optional)
- npm or yarn

### Quick Start (Local Development)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Ormeet/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start PostgreSQL**
   ```bash
   # macOS
   brew services start postgresql@14
   
   # Create database
   createdb event_organization_db
   ```

5. **Run the application**
   ```bash
   npm run start:dev
   ```

6. **Access the application**
   - API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api/docs

### Quick Start (Docker)

1. **Clone and navigate**
   ```bash
   git clone <repository-url>
   cd Ormeet/backend
   ```

2. **Start with Docker**
   ```bash
   make dev
   # or
   docker-compose -f docker-compose.dev.yml up -d
   ```

3. **Access services**
   - API: http://localhost:3000
   - Swagger: http://localhost:3000/api/docs
   - pgAdmin: http://localhost:5050

---

## 📚 API Documentation

### Interactive Documentation

Access the full interactive API documentation at:
```
http://localhost:3000/api/docs
```

### Key Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

#### Events
- `GET /events` - List all events (with filters)
- `POST /events` - Create event (Organizer/Admin)
- `GET /events/:id` - Get event details
- `PATCH /events/:id` - Update event
- `POST /events/:id/publish` - Publish event
- `POST /events/:id/cancel` - Cancel event

#### Organizations
- `GET /organizations` - List organizations
- `POST /organizations` - Create organization
- `GET /organizations/:id` - Get organization details

#### Tickets & Orders
- `POST /orders` - Create order
- `GET /tickets/user/:userId` - Get user tickets
- `POST /tickets/:id/use` - Mark ticket as used

For complete API documentation, see [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

---

## 📁 Project Structure

```
Ormeet/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── events/            # Events management
│   │   ├── organizations/     # Organizations
│   │   ├── venues/            # Venues & locations
│   │   ├── tickets/           # Ticket management
│   │   ├── ticket-types/      # Ticket variations
│   │   ├── orders/            # Order processing
│   │   ├── reviews/           # Reviews & ratings
│   │   ├── promotions/        # Discount codes
│   │   ├── entities/          # TypeORM entities
│   │   ├── common/            # Shared utilities
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Application entry
│   │
│   ├── test/                  # Test files
│   ├── dist/                  # Compiled output
│   ├── docker-compose.yml     # Docker configuration
│   ├── Dockerfile             # Production image
│   ├── Makefile               # Build commands
│   ├── package.json           # Dependencies
│   └── tsconfig.json          # TypeScript config
│
└── README.md                  # This file
```

For detailed structure, see [PROJECT_STRUCTURE.md](backend/PROJECT_STRUCTURE.md)

---

## 🔧 Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=event_organization_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=*

# pgAdmin (Optional)
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=admin
PGADMIN_PORT=5050
```

⚠️ **Important**: Change `JWT_SECRET` to a secure random string in production!

Generate a secure secret:
```bash
openssl rand -base64 32
```

---

## 🐳 Docker Deployment

### Development Environment

```bash
# Start development environment
make dev

# View logs
make dev-logs

# Stop services
make dev-down
```

### Production Environment

```bash
# Build images
make build

# Start services
make up

# View logs
make logs

# Stop services
make down
```

### Available Make Commands

```bash
make help          # Show all commands
make build         # Build Docker images
make up            # Start production services
make down          # Stop all services
make logs          # View logs
make restart       # Restart services
make dev           # Start development environment
make db-backup     # Backup database
make db-restore    # Restore database
make db-shell      # Open PostgreSQL shell
make clean         # Remove containers and volumes
make test          # Run tests
```

For detailed Docker setup, see [DOCKER.md](backend/DOCKER.md)

---

## 💻 Development

### Running in Development Mode

```bash
# Watch mode with hot reload
npm run start:dev

# Debug mode
npm run start:debug

# Production mode
npm run start:prod
```

### Code Quality

```bash
# Linting
npm run lint

# Format code
npm run format

# Type checking
npx tsc --noEmit
```

### Database Management

```bash
# Access PostgreSQL shell
psql event_organization_db

# List tables
\dt

# Describe table
\d users

# View data
SELECT * FROM users;
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## 📖 Additional Documentation

- [Quick Start Guide](backend/QUICK_START.md) - Step-by-step setup
- [API Documentation](backend/API_DOCUMENTATION.md) - Complete API reference
- [Project Structure](backend/PROJECT_STRUCTURE.md) - Detailed architecture
- [Docker Guide](backend/DOCKER.md) - Docker deployment
- [Swagger & Postman Guide](backend/SWAGGER_POSTMAN_GUIDE.md) - API testing

---

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ Role-based access control (RBAC)
- ✅ Input validation on all endpoints
- ✅ SQL injection prevention (TypeORM)
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ Non-root Docker user
- ✅ Security headers ready (helmet)

---

## 🎯 Roadmap

### Current Status: v1.0 (98% Complete)

#### ✅ Completed
- [x] Complete CRUD for all modules
- [x] JWT authentication & authorization
- [x] Role-based access control
- [x] Swagger API documentation
- [x] Docker containerization
- [x] Database schema & relationships
- [x] Event management system
- [x] Ticketing system
- [x] Order processing
- [x] Reviews & ratings
- [x] Promotions system

#### 🔄 In Progress
- [ ] Organization member management (95% complete)

#### 📋 Planned Features
- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications (SendGrid, AWS SES)
- [ ] QR code generation for tickets
- [ ] File upload & media management
- [ ] Real-time updates (WebSockets)
- [ ] Advanced search & filtering
- [ ] Analytics dashboard
- [ ] Export functionality (CSV, PDF)
- [ ] Multi-language support (i18n)
- [ ] Rate limiting
- [ ] Caching with Redis
- [ ] Database migrations
- [ ] Comprehensive test coverage

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow the existing code style
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

---

## 📄 License

This project is licensed under the UNLICENSED License - see the LICENSE file for details.

---

## 👥 Authors

- **Your Name** - Initial work

---

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- TypeORM for the excellent ORM
- PostgreSQL for the robust database
- All contributors and supporters

---

## 📞 Support

For issues, questions, or suggestions:

- 📧 Email: support@ormeet.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ormeet/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/ormeet/wiki)

---

<div align="center">

**Made with ❤️ by the Ormeet Team**

⭐ Star us on GitHub if you find this project useful!

</div>