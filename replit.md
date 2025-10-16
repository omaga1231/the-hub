# The Hub - Academic Collaboration Platform

## Overview

The Hub is an academic collaboration platform designed to solve a critical problem for college students: finding relevant, course-specific support and study communities. Unlike generic platforms (Discord) or impersonal review sites (RateMyProfessor), The Hub facilitates targeted academic collaboration through course-specific study circles, shared materials, and peer ratings across multiple colleges.

The platform enables students to:
- Join study circles for specific courses and sections
- Rate courses on difficulty, quality, and workload
- Share and collaborate on study materials within groups
- Compare courses across different colleges (useful for transfer students)
- Communicate through real-time chat and discussion boards

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **React 18** with TypeScript for type-safe component development
- **Wouter** for lightweight client-side routing
- **TanStack Query (React Query)** for server state management and caching
- **Vite** as the build tool and development server

**UI Framework:**
- **shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Design System**: Hybrid approach inspired by Notion (organizational structure), Linear (modern aesthetics), and Discord (community features)

**Key Design Decisions:**
- Custom CSS variables system for theming (light/dark mode support)
- Component-based architecture with reusable UI primitives
- Path aliases (`@/`, `@shared/`, `@assets/`) for clean imports
- Responsive design with mobile-first approach

### Backend Architecture

**Technology Stack:**
- **Node.js** with **Express.js** for the REST API server
- **TypeScript** throughout for type safety
- **Drizzle ORM** for type-safe database queries
- **WebSocket (ws library)** for real-time chat functionality

**Authentication & Session Management:**
- **Firebase Authentication** for email/password authentication with email verification
- **Firebase Admin SDK** for backend token verification and custom domain email sending
- Email validation requiring `.edu` domains for college verification
- Hybrid approach: Firebase handles authentication, Firestore stores user profiles with Firebase UIDs

**API Design:**
- RESTful endpoints under `/api/*` namespace
- Authentication middleware (`requireAuth`) protecting sensitive routes
- Zod schemas for request validation matching database schemas
- Separate route handling for WebSocket connections

**Key Architectural Patterns:**
- Storage abstraction layer (`server/storage.ts`) separating business logic from database operations
- Centralized database configuration (`server/db.ts`)
- Modular route registration system

### Data Architecture

**Database: Firebase Firestore**

**Migration from PostgreSQL to Firestore (October 2025):**
- Migrated from PostgreSQL to Firestore to solve production deployment issues
- Firestore provides unified database for both development and production environments
- Import script (`scripts/import-to-firestore.ts`) handles ID mapping from PostgreSQL to Firestore
- All 474 courses, 50 programs, and 878 program-course relationships successfully migrated

**Schema Design Philosophy:**
- Firestore auto-generated document IDs for all entities
- Timestamp tracking (createdAt) on all entities
- Document-based model with references: Colleges → Courses → Study Circles → Posts/Messages
- In-memory sorting used instead of composite indexes to avoid Firestore index requirements

**Core Entities:**

1. **Users**: Authentication, profile data (username, email, fullName, bio, avatar, isAdmin for moderation privileges)
2. **Colleges**: Institution records (name, abbreviation, description)
3. **Courses**: Course catalog (code, name, description, department) linked to colleges
4. **Study Circles**: Private/public groups linked to specific courses (name, description, privacy settings)
5. **Circle Members**: Join table linking users to study circles
6. **Posts**: Discussion board content within circles (title, content, pinning capability)
7. **Comments**: Threaded discussions on posts
8. **Ratings**: Course feedback (difficulty, quality, workload on 1-5 scale, plus text comments)
9. **Messages**: Real-time chat messages within circles
10. **Files**: Shared study materials (filename, URL, file type, size)

**Database Migration Strategy:**
- Drizzle Kit for schema migrations
- Schema definitions in `shared/schema.ts` (shared between client and server)
- Separate insert schemas using Zod for validation

### Real-time Communication

**WebSocket Implementation:**
- WebSocket server attached to the main HTTP server
- Real-time chat within study circles
- Message persistence to database
- Connection-based user tracking

**Hybrid Communication Model:**
- **Real-time chat**: WebSocket for instant messaging
- **Discussion boards**: REST API for threaded, persistent discussions
- **File sharing**: REST API with planned S3/Firebase storage integration

### State Management Strategy

**Client-Side:**
- **React Query** for server state (automatic caching, background refetching, optimistic updates)
- **React Context** for authentication state (`AuthProvider`)
- **React Hook Form** with Zod resolvers for form state and validation
- Local component state for UI interactions

**Query Strategy:**
- Custom query client configuration with disabled auto-refetching
- Infinite stale time for stable data
- Credential inclusion for authenticated requests
- Centralized error handling with custom `apiRequest` wrapper

### Development & Build Pipeline

**Development:**
- Hot Module Replacement (HMR) via Vite
- TypeScript checking without compilation (`noEmit: true`)
- Development-only Replit plugins for enhanced DX

**Build Process:**
- **Frontend**: Vite bundles React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- ESM modules throughout the codebase
- Separate `tsconfig.json` with strict type checking

**Environment Configuration:**
- `NODE_ENV` for environment detection
- `DATABASE_URL` required for Neon PostgreSQL connection
- `SESSION_SECRET` for session encryption (defaults provided for development)

## External Dependencies

### Database & Infrastructure
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon database
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **drizzle-kit**: Migration and schema management tool
- WebSocket polyfill (`ws`) for Neon compatibility

### Authentication & Security
- **passport**: Authentication middleware framework
- **passport-local**: Username/password authentication strategy
- **bcrypt**: Password hashing (intentionally synchronous for Replit compatibility)
- **express-session**: Session management middleware
- **connect-pg-simple**: PostgreSQL session store

### UI Component Libraries
- **@radix-ui/**: Headless UI primitives (20+ components including dialog, dropdown, tabs, etc.)
- **cmdk**: Command palette component
- **lucide-react**: Icon library
- **react-day-picker**: Calendar/date picker
- **embla-carousel-react**: Carousel component
- **recharts**: Charting library
- **vaul**: Drawer component

### Form & Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Validation adapters
- **zod**: Schema validation (shared between client/server)

### Utilities
- **class-variance-authority**: Type-safe CSS variant management
- **clsx** & **tailwind-merge**: Conditional className utilities
- **date-fns**: Date manipulation and formatting

### Development Tools
- **Vite**: Build tool and dev server
- **@vitejs/plugin-react**: React plugin for Vite
- **esbuild**: Server bundler
- **tsx**: TypeScript execution for development
- **@replit/vite-plugin-***: Replit-specific development plugins

### Planned Integrations
- **AI Layer**: OpenAI API (GPT) for summarization, recommendations, and moderation
- **File Storage**: Firebase Storage or AWS S3 for study material uploads
- **Video**: Potential integration for live study sessions