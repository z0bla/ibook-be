# iBook Backend - Complete Architecture & Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture Patterns](#architecture-patterns)
3. [Project Structure](#project-structure)
4. [Database Design](#database-design)
5. [API Endpoints](#api-endpoints)
6. [Authentication & Security](#authentication--security)
7. [Business Logic & Validations](#business-logic--validations)
8. [Module Breakdown](#module-breakdown)
9. [Implementation Phases](#implementation-phases)
10. [Development Workflow](#development-workflow)
11. [Testing Strategy](#testing-strategy)
12. [Deployment & DevOps](#deployment--devops)

---

## Overview

**iBook Backend** is a NestJS RESTful API for an appointment booking system that enables users to:
- Register and authenticate with JWT tokens
- Browse service categories and salons
- View salon services and operating hours
- Book appointments with real-time conflict detection
- Manage appointment history (upcoming, past, cancelled)
- Track previously booked salons

**Technology Stack:**
- **Framework**: NestJS 10+ with TypeScript
- **Database**: PostgreSQL 14+ with TypeORM ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: class-validator with custom validators
- **Documentation**: Swagger/OpenAPI auto-generated
- **Testing**: Jest for unit and integration tests
- **Containerization**: Docker & docker-compose

**Project Goals:**
- ✅ Clean, maintainable code following NestJS best practices
- ✅ Comprehensive error handling with meaningful messages
- ✅ Complete API documentation via Swagger
- ✅ High test coverage (80%+)
- ✅ Production-ready code quality
- ✅ Scalable modular architecture

---

## Architecture Patterns

### 1. Modular Architecture

```
ibook-be/
├── src/
│   ├── auth/          # Authentication module
│   ├── users/         # User management
│   ├── categories/    # Service categories
│   ├── salons/        # Salon management
│   ├── services/      # Services offered by salons
│   ├── appointments/  # Appointment booking & management
│   ├── common/        # Shared utilities, guards, filters
│   └── database/      # TypeORM migrations & seeders
```

Each module contains:
- `entities/` - TypeORM entity definitions
- `dto/` - Data Transfer Objects (request/response)
- `service.ts` - Business logic
- `controller.ts` - HTTP endpoints
- `repository.ts` (optional) - Custom database queries
- `module.ts` - Module configuration

### 2. Layered Architecture

```
┌─────────────────────────────────────┐
│    HTTP Controllers (API Layer)     │ ← Route handlers, request validation
├─────────────────────────────────────┤
│    Services (Business Logic)        │ ← Core logic, validations, rules
├─────────────────────────────────────┤
│    Repositories (Data Access)       │ ← Database queries, ORM operations
├─────────────────────────────────────┤
│    Database (PostgreSQL)            │ ← Persistence layer
└─────────────────────────────────────┘
```

**Flow**: HTTP Request → Controller → Service → Repository → Database

### 3. Design Principles

- **Single Responsibility**: Each class has one reason to change
- **Dependency Injection**: All dependencies injected via constructor
- **SOLID Principles**: Open/closed, Liskov substitution, etc.
- **DRY (Don't Repeat Yourself)**: Reusable utilities and services
- **KISS (Keep It Simple)**: Straightforward, readable code

---

## Project Structure

### Root Directory Structure

```
ibook-be/
├── src/
│   ├── app.module.ts              # Main application module
│   ├── main.ts                    # Application entry point
│   ├── auth/                      # Authentication module
│   ├── users/                     # User management module
│   ├── categories/                # Category module
│   ├── salons/                    # Salon module
│   ├── services/                  # Service module
│   ├── appointments/              # Appointment module
│   ├── common/                    # Shared utilities
│   │   ├── filters/              # Global exception filter
│   │   ├── guards/               # JWT auth guard
│   │   ├── decorators/           # Custom decorators (@CurrentUser)
│   │   ├── exceptions/           # Custom exception classes
│   │   └── validators/           # Custom validators
│   └── database/
│       ├── migrations/           # TypeORM migrations
│       └── seeders/              # Database seed scripts
├── __tests__/
│   ├── unit/                     # Unit tests
│   └── e2e/                      # Integration/E2E tests
├── docker-compose.yml             # Docker services
├── .env.example                   # Environment variables template
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── jest.config.js                 # Jest testing configuration
├── ormconfig.js                   # TypeORM configuration
├── README.md                      # Quick start guide
└── BACKEND_ARCHITECTURE.md        # This file
```

### Module Structure (Example: Appointments)

```
src/appointments/
├── dto/
│   ├── create-appointment.dto.ts
│   ├── appointment-response.dto.ts
│   └── pagination.dto.ts
├── entities/
│   └── appointment.entity.ts
├── appointments.service.ts        # Business logic
├── appointments.controller.ts      # HTTP routes
├── appointments.repository.ts      # Custom queries
├── appointments.module.ts          # Module definition
└── __tests__/
    ├── appointments.service.spec.ts
    └── appointments.e2e.spec.ts
```

---

## Database Design

### Entity Relationship Diagram (ERD)

```
┌──────────────┐
│    User      │
├──────────────┤
│ id (PK)      │
│ email (UQ)   │──┐
│ password     │  │
│ name         │  │  1─to─many
│ phone        │  │
│ createdAt    │  │
└──────────────┘  │
      │           │
      │ many-to-many (previousSalons)
      │           │
      ▼           │
┌──────────────┐  │
│   Salon      │◄─┘
├──────────────┤
│ id (PK)      │
│ categoryId   │──┐
│ name         │  │
│ address      │  │ many-to-one
│ phone        │  │
│ description  │  │
│ rating       │  │
│ image        │  │
└──────────────┘  │
      │           │
      │ 1-to-many │
      │           │
      ▼           ▼
  ┌────────┐  ┌──────────────┐
  │Service │  │   Category   │
  ├────────┤  ├──────────────┤
  │id (PK) │  │ id (PK)      │
  │salonId │  │ name (UQ)    │
  │name    │  │ icon         │
  │duration│  │ description  │
  │price   │  └──────────────┘
  └────────┘
      │
      │ 1-to-many
      ▼
┌──────────────┐
│ Appointment  │
├──────────────┤
│ id (PK)      │
│ userId (FK)  │────────┐
│ salonId (FK) │        │
│ serviceId(FK)│        │
│ date         │        │ many-to-one
│ time         │        │
│ status       │        │
│ duration     │        │
└──────────────┘        │
                        │
                        ▼
                   ┌──────────────┐
                   │ OperatingHrs │
                   ├──────────────┤
                   │ id (PK)      │
                   │ salonId(FK)  │
                   │ day          │
                   │ openTime     │
                   │ closeTime    │
                   │ isClosed     │
                   └──────────────┘
```

### Core Entities

#### 1. User
- Stores user account information and authentication details
- Relations: 1→many Appointment, many→many Salon (previousSalons)
- Unique constraint: email
- Password stored as bcrypt hash (never plain text)

#### 2. Category
- Service categories (Hair Salon, Massage, Spa, etc.)
- Relations: 1→many Salon
- Unique constraint: name

#### 3. Salon
- Salon/business information
- Relations: many→1 Category, 1→many Service, 1→many OperatingHours, 1→many Appointment, many→many User (previousSalons)
- Fields: name, address, phone, description, rating (0-5), reviewCount, image (optional URL)

#### 4. Service
- Services offered by each salon (Haircut, Massage, etc.)
- Relations: many→1 Salon, 1→many Appointment
- Fields: name, duration (minutes), price

#### 5. OperatingHours
- Operating hours for each salon by day of week
- Relations: many→1 Salon
- 7 records per salon (Mon-Sun)
- Fields: day, openTime, closeTime, isClosed

#### 6. Appointment
- Appointment bookings
- Relations: many→1 User, many→1 Salon, many→1 Service
- Status enum: BOOKED, COMPLETED, CANCELLED
- Fields: appointmentDate, appointmentTime, duration, status

---

## API Endpoints

### Authentication Module

```
POST   /auth/register
  Request:  { email, password, name, phone }
  Response: { access_token, user: { id, email, name, phone } }
  Status:   201 Created
  Errors:   400 (invalid), 409 (duplicate email)

POST   /auth/login
  Request:  { email, password }
  Response: { access_token, user: { id, email, name, phone } }
  Status:   200 OK
  Errors:   401 (unauthorized)

GET    /auth/me (Protected)
  Response: { id, email, name, phone, appointments: [], previousSalons: [] }
  Status:   200 OK
  Errors:   401 (unauthorized)
```

### Categories Module

```
GET    /categories
  Query:    None
  Response: [{ id, name, icon, description, salonCount }]
  Status:   200 OK

GET    /categories/:id
  Response: { id, name, icon, description }
  Status:   200 OK
  Errors:   404 (not found)
```

### Salons Module

```
GET    /salons
  Query:    None
  Response: [{ id, name, address, phone, rating, category, services[], hours[] }]
  Status:   200 OK

GET    /salons/:id
  Response: { id, name, address, phone, description, rating, category, services[], hours[] }
  Status:   200 OK
  Errors:   404 (not found)

GET    /categories/:id/salons
  Query:    limit=10, offset=0, sortBy=rating, direction=DESC
  Response: { data: [], total, hasMore }
  Status:   200 OK

POST   /salons (Public Registration)
  Request:  { categoryId, name, address, phone, description, image? }
  Response: { id, name, ... }
  Status:   201 Created
  Errors:   400 (invalid), 404 (category not found)
```

### Services Module

```
GET    /services/salon/:salonId
  Response: [{ id, name, duration, price }]
  Status:   200 OK

GET    /services/:id
  Response: { id, name, duration, price, salonId }
  Status:   200 OK
  Errors:   404 (not found)

POST   /services (Protected - Salon Owner)
  Request:  { name, duration, price }
  Response: { id, name, duration, price }
  Status:   201 Created
  Errors:   400 (invalid), 404 (salon not found)
```

### Appointments Module

```
POST   /appointments (Protected)
  Request:  { salonId, serviceId, appointmentDate, appointmentTime }
  Response: { id, status, appointmentDate, appointmentTime, salon{}, service{} }
  Status:   201 Created
  Errors:   400 (invalid), 401 (unauthorized), 404 (not found), 409 (conflict)

GET    /appointments/:id (Protected)
  Response: { id, status, appointmentDate, appointmentTime, salon{}, service{}, user{} }
  Status:   200 OK
  Errors:   401 (unauthorized), 404 (not found)

DELETE /appointments/:id (Protected)
  Response: { message: "Appointment cancelled successfully" }
  Status:   200 OK
  Errors:   401 (unauthorized), 404 (not found)

GET    /appointments/upcoming (Protected)
  Query:    limit=10, offset=0
  Response: { data: [], total, hasMore }
  Status:   200 OK
  Filters:  status=BOOKED AND appointmentDate >= today
  Sort:     appointmentDate ASC

GET    /appointments/past (Protected)
  Query:    limit=10, offset=0
  Response: { data: [], total, hasMore }
  Status:   200 OK
  Filters:  status=COMPLETED OR (status=BOOKED AND appointmentDate < today)
  Sort:     appointmentDate DESC

GET    /appointments/cancelled (Protected)
  Query:    limit=10, offset=0
  Response: { data: [], total, hasMore }
  Status:   200 OK
  Filters:  status=CANCELLED
  Sort:     updatedAt DESC
```

---

## Authentication & Security

### JWT Implementation

**Flow:**
1. User registers/logs in with email & password
2. Server validates credentials and hashes password with bcrypt (10 salt rounds)
3. Server generates JWT token with user ID and expiration (24 hours)
4. Client stores token and sends in `Authorization: Bearer <token>` header
5. Server verifies token with JwtAuthGuard on protected endpoints

**JWT Payload:**
```json
{
  "sub": "user-id-uuid",
  "email": "user@example.com",
  "iat": 1707654896,
  "exp": 1707741296
}
```

**Environment Variables:**
```env
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRATION=24h
```

### Password Security

- **Minimum Length**: 8 characters
- **Required Characters**: Letter + Number + Special character (@$!%*#?&)
- **Hashing**: bcrypt with salt rounds = 10
- **Storage**: Never store plain text passwords
- **Validation**: Validate on registration and update

### Protected Endpoints

All endpoints marked as (Protected) require:
1. Valid JWT token in `Authorization: Bearer <token>` header
2. Valid token not expired
3. User exists in database

---

## Business Logic & Validations

### Appointment Booking Rules

#### Rule 1: No Overlapping Appointments
An appointment cannot be booked if another BOOKED appointment exists for the same service at the same date and time with duration overlap.

#### Rule 2: Max 5 Concurrent Bookings Per Service
At any given time slot, maximum 5 users can book the same service (enforced at creation time).

#### Rule 3: Max 10 Active Appointments Per User
A single user can have maximum 10 concurrent BOOKED appointments (status must be BOOKED, not COMPLETED or CANCELLED).

#### Rule 4: Salon Operating Hours Validation
Appointment must be within salon's operating hours:
- Check salon's operating hours for requested date/day
- Verify time falls between openTime and closeTime
- If isClosed = true, reject any booking for that day

### Validation Rules by Field

| Field | Rule | Example |
|-------|------|---------|
| Email | Valid email format, unique | user@example.com |
| Password | 8+ chars, letter+number+special | Pass@1234 |
| Name | 2-100 characters | John Doe |
| Phone | Valid phone format | +1-555-0123 |
| Duration | 15-480 minutes | 45 |
| Price | 1-10000 cents/dollars | 4500 |
| Appointment Date | ISO 8601, must be future | 2024-02-20 |
| Appointment Time | HH:MM format, 00:00-23:59 | 14:30 |

---

## Module Breakdown

### Modules (Phase-by-Phase)

#### Phase 0: Setup
- NestJS project initialization
- PostgreSQL configuration
- TypeORM setup

#### Phase 1: Auth & Users
- User entity and relationships
- Authentication service
- JWT strategy and guard
- User profile endpoints

#### Phase 2: Categories, Salons, Services
- Category browsing
- Salon management with pagination
- Service management
- Operating hours

#### Phase 3: Appointments
- Appointment entity with complex validations
- Overlap detection algorithm
- Concurrent booking limits
- User appointment history
- Browse endpoints (upcoming/past/cancelled)

#### Phase 4: Quality
- Database seeding with test data
- Global error handling
- Swagger documentation
- DTO validation

#### Phase 5: Testing
- Unit tests for services (80%+ coverage)
- Integration tests for all endpoints
- E2E test helpers

---

## Implementation Phases

### Phase 0: Setup (3 hours)
✅ NestJS initialization, PostgreSQL setup, TypeORM configuration

### Phase 1: Authentication (9 hours)
✅ User entities, JWT auth, registration, login, protected endpoints

### Phase 2: Browse (8 hours)
✅ Categories, salons, services, pagination, filtering

### Phase 3: Appointments (10-13 hours)
📋 Appointment entity, overlap detection, limits, history, endpoints

### Phase 4: Quality (8-11 hours)
📋 Database seeding, error handling, Swagger docs, validation

### Phase 5: Testing (9-11 hours)
📋 Unit tests, integration tests, 80%+ coverage

---

## Development Workflow

### Local Setup

```bash
# Clone and install
git clone https://github.com/z0bla/ibook-be.git
cd ibook-be
npm install

# Setup environment
cp .env.example .env

# Start database
docker-compose up -d

# Run migrations
npm run typeorm migration:run

# Start dev server
npm run start:dev

# Tests
npm test
npm test -- e2e
```

### Git Workflow

**Branch naming:**
- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `refactor/task-name` - Refactoring
- `docs/documentation` - Documentation
- `test/test-name` - Tests

**Commit messages:**
```
<type>(<scope>): <subject>

Types: feat, fix, refactor, docs, test
Example: feat(appointments): add overlap detection
```

---

## Testing Strategy

### Unit Tests (Phase 5 Issue #24)
- Service methods in isolation
- Mock external dependencies
- 80%+ code coverage
- Command: `npm test`

### Integration Tests (Phase 5 Issue #25)
- Complete API endpoints
- Real database interactions
- Business logic verification
- Command: `npm test -- e2e`

---

## Deployment & DevOps

### Docker Setup

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f postgres
```

### Environment Variables

**Required:**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=ibook_user
DATABASE_PASSWORD=ibook_password
DATABASE_NAME=ibook_dev
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
NODE_ENV=development
APP_PORT=3000
```

---

## Summary

### Quick Statistics

- **Total Issues**: 25
- **Phases**: 5
- **Estimated Time**: 47-55 hours
- **Database Entities**: 6
- **API Endpoints**: 20+
- **Modules**: 6 + common
- **Test Coverage Goal**: 80%+

### Architecture Benefits

- ✅ Modular and scalable
- ✅ Clean separation of concerns
- ✅ Comprehensive error handling
- ✅ Full API documentation
- ✅ High test coverage
- ✅ Production-ready
- ✅ Easy to maintain

### Next Steps

1. Review this architecture document
2. Read detailed GitHub issues (#16-25)
3. Setup local development environment
4. Follow Phase 3-5 implementation
5. Write tests as you code
6. Keep documentation updated

---

**Last Updated**: February 11, 2026  
**Created By**: OpenCode AI  
**Repository**: https://github.com/z0bla/ibook-be  
**Status**: Ready for implementation (Phase 3-5)
