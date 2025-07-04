# Ekko FS Challenge - Day 1 Setup Guide

## Overview
This is the foundation setup for the Ekko FS Challenge - a hierarchical role-based permission system.

## Architecture
- **Next.js 14** with App Router
- **PostgreSQL** via Supabase
- **Drizzle ORM** for database operations
- **TypeScript** for type safety
- **Tailwind CSS** for styling

## Database Schema
The core database schema includes:
- `organisation_structures` - Hierarchical organisation levels (Company → Division → Department → Team)
- `users` - User accounts (includes name, email, and spirit animal)
- `user_permissions` - Many-to-many relationship between users and organisation structures

## Business Organisational Structure
The seed data creates a realistic technology company structure:
- **Company**: Gekko Pty Ltd
- **Divisions**: Engineering, Sales, Marketing, HR
- **Departments**: Frontend Engineering, Backend Engineering, DevOps, Enterprise Sales, Digital Marketing
- **Teams**: React Platform, Mobile, API Platform, Data Engineering

## Test Users & Permissions

### Management Hierarchy (Downstream Access)
- **CEO**: Alice Johnson (access to entire company - sees ALL users)
- **HR Manager**: Sarah Wilson (access to entire company for HR purposes - sees ALL users)
- **Engineering Director**: David Chen (sees all engineering users)
  - Frontend Manager (Alex Kim)
  - Backend Manager (Jordan Smith)
  - Team Lead (Michael Brown)
  - Developer (Lisa Thompson)
  - Senior Developer (Jennifer Lee)
  - Junior Developer (Mark Johnson)
- **Sales Director**: Maria Rodriguez (sees all sales users)
  - Enterprise Manager (Emily Davis)
  - Sales Rep (Robert Garcia)
  - Sales Manager (Steven Taylor)
  - Sales Associate (Amanda White)
- **Frontend Manager**: Alex Kim (sees frontend department users)
  - Team Lead (Michael Brown)
  - Developer (Lisa Thompson)
  - Senior Developer (Jennifer Lee)
- **Team Lead**: Michael Brown (sees team members)
  - Developer (Lisa Thompson) [React team]
  - Senior Developer (Jennifer Lee) [Mobile team]

### Multiple Permissions Examples
- **Team Lead** (Michael Brown): Access to React Platform Team + Mobile Team
- **Frontend Manager** (Alex Kim): Access to Frontend Engineering + Digital Marketing (cross-functional)
- **Sales Manager** (Steven Taylor): Individual contributor in Enterprise Sales team

### Individual Contributors
- **Developer**: Lisa Thompson (React Platform Team)
- **Senior Developer**: Jennifer Lee (Mobile Team)
- **Junior Developer**: Mark Johnson (API Platform Team)
- **Sales Rep**: Robert Garcia (Enterprise Sales)
- **Sales Associate**: Amanda White (Enterprise Sales)

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DATABASE_URL=your-postgres-database-url
DIRECT_URL=your-postgres-direct-url
```

### 2. Install Dependencies
```bash
yarn install
```

### 3. Database Setup
```bash
yarn db:generate
yarn db:push
```

### 4. Seed Database
```bash
yarn tsx src/db/seed.ts
```

### 5. Test Database
```bash
yarn tsx src/db/test-connection.ts
```

### 6. Start Development
```bash
yarn dev
```

## Day 1 Completed Features
✅ Next.js 14 project setup
✅ Supabase connection
✅ Drizzle ORM configuration
✅ Hierarchical database schema
✅ Database migration system
✅ Test data seeding
✅ Database connection testing 