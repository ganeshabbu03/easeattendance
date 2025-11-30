# Employee Attendance System

## Overview

This is an employee attendance tracking system built with a modern full-stack architecture. The application enables employees to mark attendance (check-in/check-out), view their attendance history, and manage their profiles. Managers have additional capabilities including viewing all employee attendance records, generating reports, and accessing team-wide analytics through dashboards and calendars.

The system features role-based access control with two user types: employees and managers. Each role has a dedicated interface with role-specific functionality and navigation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type safety and developer experience
- Vite as the build tool and development server with HMR (Hot Module Replacement)
- Wouter for client-side routing (lightweight alternative to React Router)
- React Query (TanStack Query) for server state management and data fetching

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Component configuration uses "new-york" style variant
- Custom theme system with light/dark mode support
- Design inspired by Linear, Notion, and BambooHR aesthetics

**State Management Strategy**
- Local authentication state stored in localStorage
- AuthContext provider for user authentication state
- React Query for all server-side data caching and synchronization
- Theme state managed through ThemeContext with localStorage persistence

**Component Organization**
- Reusable UI components in `client/src/components/ui/`
- Feature-specific components (calendar, stat cards, status badges)
- Page-level components organized by role (employee vs manager routes)
- Shared component library for common patterns

### Backend Architecture

**Server Framework**
- Express.js with TypeScript
- HTTP server creation using Node's built-in `http` module
- RESTful API architecture with `/api` prefix for all endpoints
- Custom request logging middleware for monitoring

**Authentication & Sessions**
- Simple password hashing (placeholder implementation in development)
- User authentication via email/password
- User data stored in localStorage on client
- Custom header-based authentication (`x-user-id`)

**API Structure**
- `/api/auth/register` - User registration
- `/api/auth/login` - User authentication
- Attendance management endpoints (implied by frontend queries)
- Role-based endpoint access control

**Data Storage Strategy**
- In-memory storage implementation (`MemStorage` class) for development
- Abstracted storage interface (`IStorage`) for easy database swap
- Seeded data for development with sample users and attendance records
- Designed to support PostgreSQL via Drizzle ORM in production

### Database Schema (Drizzle ORM)

**Users Table**
- UUID primary key with auto-generation
- Email-based authentication (unique constraint)
- Role-based access: "employee" or "manager"
- Department organization
- Unique employee ID generation

**Attendance Table**
- UUID primary key
- Foreign key relationship to users
- Date-based tracking with check-in/check-out timestamps
- Status types: present, absent, late, half-day
- Total hours calculation field
- Created timestamp for audit trail

**Schema Validation**
- Zod schemas for runtime validation
- Drizzle-Zod integration for type-safe schema inference
- Separate insert schemas excluding auto-generated fields

### Design System

**Typography**
- Primary font: Inter for UI and data
- Display font: Poppins for headings and stats
- Monospace: JetBrains Mono (referenced in CSS)

**Color System**
- CSS custom properties for theming
- HSL-based color tokens for light/dark mode
- Status-specific colors (present: emerald, absent: red, late: amber, half-day: orange)
- Semantic color naming (primary, secondary, muted, accent, destructive)

**Spacing & Layout**
- Standardized Tailwind spacing units (3, 4, 6, 8, 12)
- Grid-based layouts for responsive design
- Card-based UI with consistent padding and shadows

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless** - Neon Postgres serverless driver for database connectivity
- **drizzle-orm** - TypeScript ORM for database operations
- **drizzle-kit** - CLI tool for schema migrations and database management

### UI Component Libraries
- **@radix-ui/react-*** - Unstyled, accessible component primitives (accordion, dialog, dropdown, etc.)
- **@tanstack/react-query** - Data fetching and state management
- **tailwindcss** - Utility-first CSS framework
- **class-variance-authority** - Variant-based component styling
- **cmdk** - Command menu component

### Session & Authentication
- **express-session** - Session middleware for Express
- **connect-pg-simple** - PostgreSQL session store for production

### Utility Libraries
- **date-fns** - Date manipulation and formatting
- **zod** - Schema validation
- **react-hook-form** - Form state management with validation
- **@hookform/resolvers** - Zod integration for react-hook-form

### Development Tools
- **vite** - Build tool and dev server
- **@vitejs/plugin-react** - React plugin for Vite
- **tsx** - TypeScript execution engine
- **esbuild** - JavaScript bundler for server build

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal** - Development error overlay
- **@replit/vite-plugin-cartographer** - Replit IDE integration
- **@replit/vite-plugin-dev-banner** - Development mode indicator