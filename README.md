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
- 🏢 **Organization Management** - Multi-organization support with member management
- 📍 **Venue Management** - Location tracking with geolocation search
- 🎟️ **Ticketing System** - Multiple ticket types, QR codes, validation, and transfers
- 💳 **Order Processing** - Complete order management with payment integration support
- ⭐ **Reviews & Ratings** - User feedback system with moderation and approval
- 🎁 **Promotions** - Discount codes and promotional campaigns with validation
- 📋 **Attendance Tracking** - Real-time check-in/out with QR, NFC, and manual methods
- 🔐 **Authentication** - JWT-based auth with role-based access control
- 📊 **Analytics** - View tracking, favorites, and attendance statistics

---

## ✨ Features

### For Event Organizers

- Create and manage multiple organizations with member roles
- Design events with rich details (sessions, speakers, images)
- Set up multiple ticket types with different pricing tiers
- Track sales, attendance, and revenue in real-time
- Check-in attendees with QR codes, NFC, or manual entry
- View attendance statistics and live event metrics
- Manage promotions and discount codes with usage tracking
- Review and moderate attendee feedback with approval workflow
- Generate comprehensive event analytics and reports

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
- **Attendance Module** - Event check-in & tracking
- **Common Module** - Shared utilities, filters & interceptors
- **Database Module** - Migration management

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

### Complete API Endpoints

#### 🔐 Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/profile` - Get current user profile (🔒 Auth required)

---

#### 🎉 Events Module
**Public Endpoints:**
- `GET /events` - List all events with optional filters
  - Query params: `status`, `category`, `organizerId`
- `GET /events/:id` - Get event details by ID
- `POST /events/:id/view` - Increment event view count

**Protected Endpoints (🔒 Organizer/Admin):**
- `POST /events` - Create a new event
- `PATCH /events/:id` - Update event details
- `DELETE /events/:id` - Delete event
- `POST /events/:id/publish` - Publish event (change status to published)
- `POST /events/:id/cancel` - Cancel event

**Protected Endpoints (🔒 Authenticated Users):**
- `POST /events/:id/favorite` - Add event to favorites

---

#### 🏢 Organizations Module
**Public Endpoints:**
- `GET /organizations` - List all organizations
- `GET /organizations/:id` - Get organization details
- `GET /organizations/owner/:ownerId` - Get organizations by owner

**Protected Endpoints (🔒 Organizer/Admin):**
- `POST /organizations` - Create new organization

**Protected Endpoints (🔒 Authenticated Users):**
- `PATCH /organizations/:id` - Update organization (owner only)
- `DELETE /organizations/:id` - Delete organization (owner only)
- `POST /organizations/:id/members/:userId` - Add member to organization
- `DELETE /organizations/:id/members/:userId` - Remove member from organization

---

#### 📍 Venues Module
**Public Endpoints:**
- `GET /venues` - List all venues
  - Query params: `city`, `country`, `minCapacity`
- `GET /venues/nearby` - Find venues near a location
  - Query params: `latitude`, `longitude`, `radius` (default: 50km)
- `GET /venues/:id` - Get venue details

**Protected Endpoints (🔒 Organizer/Admin):**
- `POST /venues` - Create new venue
- `PATCH /venues/:id` - Update venue

**Protected Endpoints (🔒 Admin only):**
- `DELETE /venues/:id` - Delete venue

---

#### 🎟️ Ticket Types Module
**Public Endpoints:**
- `GET /ticket-types` - List all ticket types
  - Query params: `eventId`
- `GET /ticket-types/event/:eventId` - Get ticket types for specific event
- `GET /ticket-types/:id` - Get ticket type details
- `GET /ticket-types/:id/available` - Get available quantity
- `GET /ticket-types/:id/is-available` - Check availability status

**Protected Endpoints (🔒 Organizer/Admin):**
- `POST /ticket-types` - Create new ticket type
- `PATCH /ticket-types/:id` - Update ticket type
- `DELETE /ticket-types/:id` - Delete ticket type

---

#### 🎫 Tickets Module
**Public Endpoints:**
- `GET /tickets/qr/:qrCode` - Get ticket by QR code

**Protected Endpoints (🔒 Authenticated Users):**
- `POST /tickets` - Create new ticket
- `GET /tickets` - List all tickets
  - Query params: `userId`, `orderId`, `status`
- `GET /tickets/user/:userId` - Get tickets for specific user
- `GET /tickets/:id` - Get ticket details
- `PATCH /tickets/:id` - Update ticket
- `POST /tickets/:id/cancel` - Cancel ticket
- `POST /tickets/:id/transfer` - Transfer ticket to another user
  - Body: `{ newUserId: string }`
- `DELETE /tickets/:id` - Delete ticket

**Protected Endpoints (🔒 Organizer/Admin):**
- `POST /tickets/:id/use` - Mark ticket as used (check-in)

---

#### 💳 Orders Module
**Protected Endpoints (🔒 Authenticated Users):**
- `POST /orders` - Create new order
- `GET /orders` - List all orders
  - Query params: `userId`, `eventId`, `status`
- `GET /orders/user/:userId` - Get orders for specific user
- `GET /orders/:id` - Get order details
- `PATCH /orders/:id` - Update order (owner only)
- `POST /orders/:id/payment` - Process payment for order
  - Body: `{ provider: string, paymentId: string }`
- `DELETE /orders/:id` - Delete order (pending orders only)

**Protected Endpoints (🔒 Admin/Organizer):**
- `POST /orders/:id/refund` - Refund an order

---

#### 🎁 Promotions Module
**Public Endpoints:**
- `GET /promotions` - List all promotions
  - Query params: `eventId`, `isActive`
- `GET /promotions/code/:code` - Get promotion by code
- `GET /promotions/:id` - Get promotion details
- `POST /promotions/validate/:code` - Validate promotion code

**Protected Endpoints (🔒 Organizer/Admin):**
- `POST /promotions` - Create new promotion
- `PATCH /promotions/:id` - Update promotion
- `POST /promotions/:id/deactivate` - Deactivate promotion

**Protected Endpoints (🔒 Admin only):**
- `DELETE /promotions/:id` - Delete promotion

---

#### ⭐ Reviews Module
**Public Endpoints:**
- `GET /reviews` - List all reviews
  - Query params: `eventId`, `userId`, `approved`
- `GET /reviews/event/:eventId` - Get reviews for specific event
- `GET /reviews/event/:eventId/average` - Get average rating for event
- `GET /reviews/:id` - Get review details

**Protected Endpoints (🔒 Authenticated Users):**
- `POST /reviews` - Create new review
- `PATCH /reviews/:id` - Update review (author only)
- `DELETE /reviews/:id` - Delete review (author or admin)

**Protected Endpoints (🔒 Admin/Organizer):**
- `POST /reviews/:id/approve` - Approve review
- `POST /reviews/:id/reject` - Reject review

---

#### 📋 Attendance Module
**Protected Endpoints (🔒 Organizer/Admin):**
- `POST /attendance` - Check-in attendee
  - Body: `{ ticketId, eventId, checkedInBy?, method, metadata? }`
- `GET /attendance` - List all attendance records
  - Query params: `eventId`, `ticketId`
- `GET /attendance/event/:eventId` - Get attendance for specific event
- `GET /attendance/event/:eventId/count` - Get attendance count
- `GET /attendance/event/:eventId/stats` - Get attendance statistics
- `GET /attendance/:id` - Get attendance record details
- `PATCH /attendance/:id` - Update attendance record
- `DELETE /attendance/:id` - Delete attendance record (Admin only)

**Protected Endpoints (🔒 Authenticated Users):**
- `GET /attendance/ticket/:ticketId` - Get attendance records for a ticket

---

### Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created successfully |
| 400 | Bad request / Validation error |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Resource not found |
| 500 | Internal server error |

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access Control

The API implements three user roles:

- **👤 USER** - Regular users (can purchase tickets, write reviews)
- **🎭 ORGANIZER** - Event organizers (can create events, manage organizations)
- **👑 ADMIN** - Administrators (full access to all resources)

For complete API documentation with request/response examples, see [API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)

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
│   │   ├── attendance/        # Attendance tracking
│   │   ├── entities/          # TypeORM entities
│   │   ├── common/            # Shared utilities & filters
│   │   ├── database/          # Database migrations
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

### Current Status: v1.0 (100% Complete) 🎉

#### ✅ Completed
- [x] Complete CRUD for all 10 modules
- [x] JWT authentication & authorization
- [x] Role-based access control (USER, ORGANIZER, ADMIN)
- [x] Swagger API documentation (60+ endpoints)
- [x] Docker containerization (dev & production)
- [x] Database schema & relationships (11 entities)
- [x] Event management system (CRUD, publish, cancel, favorites)
- [x] Ticketing system (QR codes, validation, transfer)
- [x] Order processing (payment tracking, refunds)
- [x] Reviews & ratings (moderation, approval)
- [x] Promotions system (discount codes, validation)
- [x] **Attendance tracking (check-in/out, statistics)** ✨ NEW
- [x] **Organization member management** ✨ COMPLETED
- [x] **Common utilities (filters, interceptors, pipes)** ✨ NEW
- [x] **Database migrations support** ✨ NEW
- [x] **.env.example configuration template** ✨ NEW
- [x] Comprehensive error handling
- [x] Input validation on all endpoints
- [x] Soft delete support
- [x] Timestamp auditing

#### 📋 Planned Features (Phase 2)
- [ ] Payment gateway integration (Stripe, PayPal, Chargily)
- [ ] Email notifications (SendGrid, AWS SES)
- [ ] SMS notifications (Twilio)
- [ ] QR code generation library integration
- [ ] File upload & media management (AWS S3, Cloudinary)
- [ ] Real-time updates (WebSockets for live attendance)
- [ ] Advanced search & filtering (Elasticsearch)
- [ ] Analytics dashboard (charts, reports)
- [ ] Export functionality (CSV, PDF, Excel)
- [ ] Multi-language support (i18n)
- [ ] Rate limiting (Redis-based)
- [ ] Caching with Redis
- [ ] Comprehensive test coverage (unit & e2e)
- [ ] API versioning
- [ ] Webhook support
- [ ] Audit logging

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

##  Authors

- **Your Name** - ANESS ZEREG 

---

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- TypeORM for the excellent ORM
- PostgreSQL for the robust database
- All contributors and supporters

---

## 📞 Support

For issues, questions, or suggestions:

- 📧 Email: Anesszereg1@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ormeet/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/ormeet/wiki)

---

<div align="center">

**Made with ❤️ by the Ormeet Team**

⭐ Star us on GitHub if you find this project useful!

</div>