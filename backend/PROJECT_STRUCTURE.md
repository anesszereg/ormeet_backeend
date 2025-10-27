# Event Organization Platform - Project Structure

## Directory Structure

```
event-organization-platform/
├── src/
│   ├── entities/                    # TypeORM Entity Definitions
│   │   ├── user.entity.ts          # User entity with roles
│   │   ├── organization.entity.ts   # Organization entity
│   │   ├── venue.entity.ts         # Venue with geolocation
│   │   ├── event.entity.ts         # Event entity
│   │   ├── ticket-type.entity.ts   # Ticket type definitions
│   │   ├── order.entity.ts         # Order processing
│   │   ├── ticket.entity.ts        # Individual tickets
│   │   ├── attendance.entity.ts    # Check-in records
│   │   ├── review.entity.ts        # Event reviews
│   │   ├── promotion.entity.ts     # Promo codes
│   │   ├── media.entity.ts         # Media library
│   │   └── index.ts                # Entity exports
│   │
│   ├── auth/                        # Authentication Module
│   │   ├── dto/                    # Data Transfer Objects
│   │   │   ├── register.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   └── index.ts
│   │   ├── guards/                 # Auth Guards
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/             # Custom Decorators
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── strategies/             # Passport Strategies
│   │   │   └── jwt.strategy.ts
│   │   ├── auth.controller.ts      # Auth endpoints
│   │   ├── auth.service.ts         # Auth business logic
│   │   └── auth.module.ts          # Auth module config
│   │
│   ├── events/                      # Events Module
│   │   ├── dto/
│   │   │   ├── create-event.dto.ts
│   │   │   ├── update-event.dto.ts
│   │   │   └── index.ts
│   │   ├── events.controller.ts    # Event endpoints
│   │   ├── events.service.ts       # Event business logic
│   │   └── events.module.ts        # Events module config
│   │
│   ├── app.controller.ts            # Root controller
│   ├── app.service.ts               # Root service
│   ├── app.module.ts                # Root module
│   └── main.ts                      # Application entry point
│
├── .env                             # Environment variables
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── .prettierrc                      # Prettier config
├── eslint.config.mjs                # ESLint config
├── nest-cli.json                    # NestJS CLI config
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tsconfig.build.json              # Build config
├── README.md                        # Project documentation
└── PROJECT_STRUCTURE.md             # This file
```

## Module Overview

### Core Modules

#### 1. Auth Module (`src/auth/`)
Handles user authentication and authorization:
- JWT token generation and validation
- User registration and login
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Guards for protecting routes
- Custom decorators for user context

**Key Features:**
- Three user roles: Attendee, Organizer, Admin
- JWT strategy with Passport
- Role-based guards
- Current user decorator

#### 2. Events Module (`src/events/`)
Manages event lifecycle and operations:
- CRUD operations for events
- Event publishing and cancellation
- View and favorite tracking
- Filtering by status, category, organizer
- Relations with venues, organizers, tickets

**Key Features:**
- Draft, Published, Cancelled statuses
- Session management within events
- Capacity tracking
- Age restrictions and refund policies

### Entity Relationships

```
User
├── belongs to Organization (optional)
├── has many Orders
├── has many Tickets
└── has many Reviews

Organization
├── has one Owner (User)
├── has many Members (Users)
└── has many Events

Event
├── belongs to Organization (organizer)
├── belongs to Venue (optional)
├── has many TicketTypes
├── has many Orders
├── has many Tickets
├── has many Attendances
├── has many Reviews
└── has many Promotions

Order
├── belongs to User
├── belongs to Event
└── has many Tickets

Ticket
├── belongs to TicketType
├── belongs to Event
├── belongs to Order
├── belongs to User (owner)
└── has many Attendances

Venue
└── has many Events

TicketType
├── belongs to Event
└── has many Tickets

Attendance
├── belongs to Ticket
└── belongs to Event

Review
├── belongs to Event
└── belongs to User

Promotion
└── belongs to Event (optional)

Media
└── polymorphic (belongs to Event, Venue, Organization, or User)
```

## Database Schema Details

### Users Table
- Authentication and profile information
- Role-based access (attendee, organizer, admin)
- Organization membership
- Social links and settings

### Organizations Table
- Company/group information
- Owner and member management
- Settings and metadata

### Venues Table
- Location details with geolocation
- Capacity and accessibility info
- Contact information
- Media gallery

### Events Table
- Event details and description
- Status management (draft, published, cancelled)
- Sessions and speakers
- Capacity and age restrictions
- Metrics (views, favorites)

### Ticket Types Table
- Multiple ticket variations per event
- Pricing and currency
- Quantity management
- Sales period configuration

### Orders Table
- Transaction records
- Payment tracking
- Billing information
- Status management

### Tickets Table
- Individual ticket instances
- QR codes for check-in
- Seat assignments
- Status tracking

### Attendance Table
- Check-in records
- Multiple check-in methods (QR, NFC, Manual)
- Timestamp tracking

### Reviews Table
- User feedback and ratings (1-5)
- Approval system
- Event-specific reviews

### Promotions Table
- Discount codes
- Multiple promotion types (percent, fixed, free-ticket)
- Usage limits and tracking
- Ticket type restrictions

### Media Table
- Centralized media library
- Polymorphic ownership
- Image dimensions and metadata

## API Authentication

### Public Endpoints
- `POST /auth/register`
- `POST /auth/login`
- `GET /events`
- `GET /events/:id`
- `POST /events/:id/view`

### Authenticated Endpoints
- `POST /events/:id/favorite`

### Organizer/Admin Only Endpoints
- `POST /events`
- `PATCH /events/:id`
- `DELETE /events/:id`
- `POST /events/:id/publish`
- `POST /events/:id/cancel`

## Environment Configuration

Required environment variables:
- `DATABASE_HOST` - PostgreSQL host
- `DATABASE_PORT` - PostgreSQL port
- `DATABASE_USERNAME` - Database user
- `DATABASE_PASSWORD` - Database password
- `DATABASE_NAME` - Database name
- `JWT_SECRET` - Secret key for JWT
- `JWT_EXPIRATION` - Token expiration time
- `PORT` - Application port
- `NODE_ENV` - Environment (development/production)

## Next Steps for Implementation

### Recommended Additional Modules:

1. **Organizations Module**
   - CRUD for organizations
   - Member management
   - Organization settings

2. **Venues Module**
   - CRUD for venues
   - Geolocation search
   - Capacity management

3. **Tickets Module**
   - Ticket purchase flow
   - QR code generation
   - Seat selection

4. **Orders Module**
   - Order creation and processing
   - Payment integration
   - Invoice generation

5. **Attendance Module**
   - Check-in system
   - QR code scanning
   - Attendance reports

6. **Reviews Module**
   - Review submission
   - Rating aggregation
   - Moderation system

7. **Promotions Module**
   - Promo code validation
   - Usage tracking
   - Discount calculation

8. **Media Module**
   - File upload
   - Image processing
   - CDN integration

### Additional Features to Consider:

- Email notifications (event reminders, tickets)
- Real-time updates with WebSockets
- Payment gateway integration (Stripe, PayPal)
- Search and filtering enhancements
- Analytics and reporting
- Export functionality (CSV, PDF)
- Multi-language support
- Rate limiting and security
- Logging and monitoring
- Caching with Redis
- API documentation with Swagger
