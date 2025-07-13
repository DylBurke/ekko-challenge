# Ekko Challenge - Hierarchical Permission System

A Next.js application demonstrating a hierarchical organizational permission system using materialized paths for efficient cascading permissions.

## Features

- 🏢 **4-Level Hierarchy**: Company → Division → Department → Team
- 🔒 **Cascading Permissions**: Managers can see downstream users automatically
- ⚡ **Materialized Path Optimization**: Lightning-fast hierarchical queries
- 📊 **Real-time User Management**: Interactive user and permission management
- 🎯 **Performance Optimized**: Handles enterprise-scale user bases

## Quick Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd ekko-challenge
npm install
```

### 2. Database Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com/dashboard)
2. **Copy environment variables**:
   ```bash
   cp .env.example .env.local
   ```
3. **Fill in your Supabase credentials** in `.env.local`:
   - Get `SUPABASE_URL` and keys from your Supabase dashboard
   - Get `DATABASE_URL` from Settings → Database → Connection string

### 3. Initialize Database

```bash
# Push schema to database
npm run db:push

# Seed with test data (25 users across organizational hierarchy)
npm run db:seed

# Test connection
npm run db:test
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Application Overview

### Key Pages

- **`/`** - Homepage with feature overview
- **`/demo`** - User Demo: Select users to see their permissions and accessible users
- **`/hierarchy`** - Organizational Tree: Visual representation of the 4-level hierarchy
- **`/admin`** - Admin Panel: Manage user permissions and organizational structures

### Sample Users (Seeded Data)

- **Alice Johnson** (CEO) - Can see all 25 users
- **Sarah Wilson** (HR Manager) - Company + HR department dual permissions
- **David Chen** (Engineering Director) - All engineering users (6 people)
- **Maria Rodriguez** (Sales Director) - All sales users (7 people)
- And 21 more users across various teams...

## Technical Architecture

### Database Schema

```
organisationStructures (17 structures)
├── id, name, level, parentId
├── path (materialized path: "company/engineering/frontend")
└── Optimized indexes: path_prefix_idx, level_path_idx

users (25 users)
├── id, name, email, role, spiritAnimal
└── Index: email_idx

userPermissions (26 permission assignments)
├── userId, structureId
└── Enables cascading access via materialized paths
```

### Key Technologies

- **Next.js 15.3.4** - React framework with App Router
- **TypeScript** - Type safety and developer experience
- **Drizzle ORM** - Type-safe database queries
- **PostgreSQL** - Supabase-hosted database
- **Tailwind CSS** - Utility-first styling
- **Materialized Paths** - Efficient hierarchical queries

### Performance Features

- **O(1) Hierarchy Queries**: Single query for any depth traversal
- **Optimized Indexes**: 5-10x faster permission lookups
- **Enterprise Scaling**: Designed for 300k+ users
- **Real-time Updates**: Live permission and user management

## API Endpoints

- `GET /api/users` - List all users
- `GET /api/users/[userId]/permissions` - User's direct permissions
- `GET /api/users/[userId]/accessible-users` - Users visible to this user
- `GET /api/hierarchy/tree` - Complete organizational tree
- `POST /api/permissions/assign` - Assign permissions to users

## Troubleshooting

### Database Connection Issues

```bash
# Test your connection
npm run db:test

# If connection fails, verify .env.local credentials
# Make sure Supabase project is active and credentials are correct
```

### Common Setup Issues

1. **"relation does not exist"** → Run `npm run db:push` to create tables
2. **"No users found"** → Run `npm run db:seed` to populate test data
3. **Connection timeout** → Check Supabase project status and DATABASE_URL

## Development

```bash
# Available scripts
npm run dev          # Start development server
npm run build        # Build for production
npm run db:push      # Push schema changes
npm run db:seed      # Seed database with test data
npm run db:test      # Test database connection
npm run db:studio    # Open Drizzle Studio (database GUI)
```
