# Home Finance Tracker

## Overview

Home Finance Tracker is a comprehensive personal and business finance management application. It enables users to track income, expenses, assets, liabilities, investments, and a car rental business fleet. The application provides dashboard analytics, data visualizations, and Excel import capabilities for easy data migration. Built with a mobile-first approach, it follows established financial dashboard patterns (Mint, YNAB, Stripe) for clarity and trust.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter, a lightweight alternative to React Router. All routes are defined in `App.tsx` with pages for Dashboard, Income, Expenses, Assets, Liabilities, Investments, and Business.

**State Management**: TanStack Query (React Query) handles server state management, caching, and data synchronization. No global state library is used; component state is managed locally with React hooks.

**UI Framework**: shadcn/ui component library built on Radix UI primitives. The design system uses the "new-york" style variant with a neutral color palette. Components follow a design system inspired by financial dashboards (Mint, YNAB, Stripe).

**Styling**: Tailwind CSS with custom CSS variables for theming. Supports light/dark mode toggling. Typography uses Inter font family loaded from Google Fonts CDN. Custom design tokens defined in `index.css` include elevation effects (`--elevate-1`, `--elevate-2`) and context-specific borders.

**Data Visualization**: Recharts library for charts and graphs (bar charts, pie charts). Used on the dashboard for income/expense trends and category breakdowns.

**Form Handling**: React Hook Form with Zod schema validation via `@hookform/resolvers`. Forms validate against shared schemas from the backend.

**File Structure**:
- `/client/src/pages/` - Page components for each route
- `/client/src/components/` - Reusable components (dialogs, tables, charts)
- `/client/src/components/ui/` - shadcn/ui component library
- `/client/src/components/examples/` - Component preview/documentation examples
- `/client/src/lib/` - Utility functions and query client configuration
- `/client/src/hooks/` - Custom React hooks

### Backend Architecture

**Runtime**: Node.js with TypeScript, using tsx for development execution.

**Framework**: Express.js for HTTP server and API routing.

**API Design**: RESTful API with CRUD operations for each resource type (income, expenses, assets, liabilities, investments, rental fleet). Routes defined in `/server/routes.ts`.

**File Upload**: Multer middleware handles Excel file uploads stored in memory for processing.

**Excel Processing**: XLSX library parses uploaded Excel files to import income/expense data. Auto-detects data type based on column patterns and amount values.

**Data Layer**: Storage abstraction defined in `/server/storage.ts` provides an interface for all database operations. This pattern allows for potential database swapping without changing business logic.

**Database Access**: Drizzle ORM for type-safe database queries. Schema definitions shared between frontend and backend via `/shared/schema.ts`.

**Build Process**: Production build uses esbuild to bundle the server code into ESM format with external packages.

### Data Storage

**Database**: PostgreSQL (configured for Neon serverless via `@neondatabase/serverless` driver with WebSocket support).

**ORM**: Drizzle ORM with Neon serverless adapter. Configuration in `drizzle.config.ts` points to schema in `/shared/schema.ts` with migrations output to `/migrations`.

**Schema Design**:
- **income** - Date, category, amount, source, description, business flag
- **expenses** - Date, category, amount, description, business flag
- **assets** - Name, category, current value, description, business flag
- **liabilities** - Name, category, amount, description, business flag
- **investments** - Name, category, quantity, current value, description
- **rentalFleet** - Name, make, model, year, purchase price, current value, status, description

All tables use UUID primary keys generated via `gen_random_uuid()`. Monetary values stored as `decimal(12, 2)`. Timestamps use PostgreSQL `timestamp` type. Boolean flags differentiate personal vs business transactions/assets.

**Type Safety**: Schema types exported from Drizzle schema definitions. Zod validation schemas generated via `drizzle-zod` ensure runtime validation matches database schema.

### Authentication & Authorization

No authentication system is currently implemented. The application operates as a single-user system without login requirements. All data is publicly accessible to anyone with access to the deployment.

## External Dependencies

### Third-Party Services

**Neon Database**: Serverless PostgreSQL hosting. Connection established via `DATABASE_URL` environment variable. Uses WebSocket connections for serverless compatibility.

**Google Fonts CDN**: Inter font family loaded in `client/index.html` for consistent typography across the application.

### Development Tools

**Replit Integrations**: 
- `@replit/vite-plugin-runtime-error-modal` - Development error overlay
- `@replit/vite-plugin-cartographer` - Code navigation enhancement (dev only)
- `@replit/vite-plugin-dev-banner` - Development environment indicator (dev only)

### Key Libraries

**UI Components**: Extensive Radix UI primitives (@radix-ui/*) provide accessible, unstyled component foundations. Complete set includes accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, popover, radio-group, select, slider, switch, tabs, toast, tooltip, and more.

**Utilities**:
- `class-variance-authority` - Type-safe component variant handling
- `clsx` & `tailwind-merge` - Conditional className composition
- `cmdk` - Command palette component (imported but not visibly used)
- `date-fns` - Date manipulation and formatting
- `nanoid` - Unique ID generation (for client-side use)

**Data Visualization**: `recharts` for responsive charts with native TypeScript support.

**Excel Processing**: `xlsx` (SheetJS) for reading Excel workbook files.

**Build & Development**:
- `vite` - Frontend build tool and dev server
- `esbuild` - Backend bundler for production
- `tsx` - TypeScript execution for development
- `drizzle-kit` - Database migration tooling