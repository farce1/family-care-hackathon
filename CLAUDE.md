# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Family Care is a monorepo hackathon project containing a family health management dashboard with a Next.js frontend and FastAPI backend. The application features a login system (cookie-based) and a dashboard interface to manage family health information.

## Architecture

**Monorepo Structure:**
- `frontend/` - Next.js 15.5.4 application with React 19
- `backend/` - FastAPI Python service

**Frontend Stack:**
- Next.js 15 with App Router (route groups used for layout organization)
- TypeScript with strict mode
- Tailwind CSS 4 + Radix UI components
- TanStack Query for data fetching (configured in `lib/providers.tsx`)
- Zod for validation
- Magic UI components for animations (TextAnimate, Particles, BorderBeam, ShimmerButton)
- Custom fonts: Nunito (body), Quicksand (headings)

**Backend Stack:**
- FastAPI with uvicorn
- Currently minimal (one `/hello` endpoint)

**Key Architectural Patterns:**
- Route groups: `app/(dashboard)/` for authenticated pages with sidebar layout
- Path aliases: `@/*` maps to frontend root
- Client/Server Components: Login form and sidebar are client components; pages use server components where possible
- Provider pattern: React Query provider wraps app in `lib/providers.tsx`
- Validation: Zod schemas used for form validation (see `login-form.tsx`)

## Development Commands

**Frontend (from `frontend/` directory):**
```bash
npm run dev          # Start dev server with Turbopack on localhost:3000
npm run build        # Production build with Turbopack
npm start            # Start production server
npm run lint         # Run ESLint
```

**Backend (from `backend/` directory):**
```bash
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Full Stack (from root):**
```bash
docker-compose up              # Start both services
docker-compose up --build      # Rebuild and start
```

## Important Implementation Details

**Authentication:**
- Currently using cookie-based auth (`logged-in=true` cookie set in `login-form.tsx:57`)
- No actual backend authentication yet - this is a mock implementation
- Cookie expires after 24 hours

**Route Protection:**
- Dashboard routes are in `(dashboard)` route group with shared layout
- Login page is separate at `/login`

**UI Components:**
- Mix of shadcn/ui (Radix-based) and Magic UI components
- Theme: Orange/amber color palette (`orange-400`, `amber-50`, etc.)
- Components in `components/ui/` directory
- App-specific components in `components/` root

**Data Fetching:**
- TanStack Query configured with 60s stale time
- Window focus refetch disabled
- DevTools available in development

**Environment Variables:**
- `NEXT_PUBLIC_API_URL` for backend connection (set to `http://backend:8000` in docker-compose)

## Docker Configuration

Frontend uses standalone output mode (`next.config.ts:4`) for optimized Docker builds. Backend runs with hot reload enabled in development.

## Theme & Styling

The application uses a warm, family-friendly design with orange/amber gradients, particle effects, and smooth animations. All custom colors follow the orange theme (orange-100 to orange-900, amber variants).
