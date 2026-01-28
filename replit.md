# PDFMotion

## Overview

PDFMotion is a web application that converts PDF documents into videos. Users can upload PDF files, which are processed asynchronously to generate video content. The application also features an AI chat interface for user interaction. Built with a React frontend and Express backend, it uses PostgreSQL for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for page transitions and loading states
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts`
- **File Handling**: Multer for multipart form data (PDF uploads)
- **Development**: Vite middleware integration for seamless dev experience

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - defines `jobs` and `messages` tables
- **Migrations**: Drizzle Kit for schema management (`drizzle-kit push`)

### Key Data Models
- **Jobs**: Tracks PDF processing status (pending → processing → completed/failed), stores original filename, PDF URL, and generated video URLs
- **Messages**: Stores chat history with role (user/assistant), content, and optional audio URL

### API Structure
- `POST /api/upload` - Upload PDF file, creates processing job
- `GET /api/jobs/:id` - Get job status and results (polls during processing)
- `GET /api/chat` - List chat messages
- `POST /api/chat` - Send chat message

### Project Structure
```
client/           # React frontend
  src/
    components/   # UI components including shadcn/ui
    pages/        # Route pages (Home, JobResult)
    hooks/        # Custom React hooks
    lib/          # Utilities and query client
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route handlers
  storage.ts      # Database operations
  db.ts           # Database connection
shared/           # Shared code between client/server
  schema.ts       # Drizzle schema definitions
  routes.ts       # API route type definitions
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management
- **connect-pg-simple**: Session storage (available but not currently used)

### UI Component Library
- **shadcn/ui**: Pre-built accessible components using Radix UI primitives
- **Radix UI**: Low-level UI primitives for accessibility
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend build tool with React plugin
- **esbuild**: Server bundling for production
- **TSX**: TypeScript execution for development

### Validation
- **Zod**: Schema validation for API inputs/outputs
- **drizzle-zod**: Auto-generate Zod schemas from Drizzle tables

### Currently Mocked (Ready for Integration)
- Video generation service - currently returns sample video URLs after 5-second delay
- AI chat responses - schema supports audio URLs for voice responses