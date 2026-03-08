# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Setup & Development
```bash
# Initial setup (install deps + generate Prisma client + run migrations)
npm run setup

# Start dev server with Turbopack
npm run dev

# Start dev server in background (logs to logs.txt)
npm run dev:daemon

# Build for production
npm run build

# Start production server
npm start
```

### Testing
```bash
# Run tests with Vitest
npm test
```

### Database
```bash
# Reset database (WARNING: deletes all data)
npm run db:reset

# Generate Prisma client after schema changes
npx prisma generate

# Create migration
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio
```

### Linting
```bash
npm run lint
```

## Architecture Overview

UIGen is an AI-powered React component generator built with Next.js 15 App Router. The application enables users to describe components in natural language and see them generated and previewed in real-time.

### Tech Stack
- **Next.js 15.3.3** with App Router (React 19, TypeScript)
- **Tailwind CSS v4** for styling
- **Prisma** with SQLite for persistence
- **Anthropic Claude AI** via Vercel AI SDK (optional - has mock fallback)
- **Monaco Editor** for code editing
- **Babel Standalone** for JSX transformation in preview

### Core Architecture

#### 1. Virtual File System (VFS)
The application uses a fully in-memory file system (`/src/lib/file-system.ts`) that mimics a real filesystem. **No files are written to disk** during component generation.

**Key characteristics:**
- Serializable to JSON for database storage
- Reconstructible from JSON on project load
- Exposed via `FileSystemProvider` context throughout the app
- Updated by AI via tool calls during generation

**Main operations:**
```typescript
fileSystem.createFile(path, content)
fileSystem.updateFile(path, content)
fileSystem.readFile(path)
fileSystem.deleteFile(path)
fileSystem.rename(oldPath, newPath)
fileSystem.serialize()  // For DB persistence
```

#### 2. AI Component Generation Flow

```
User Message → /api/chat → Claude AI → Tool Calls → VFS Updates → Preview Refresh
```

**API Route:** `/api/chat` (`/src/app/api/chat/route.ts`)
- Uses Vercel AI SDK's `streamText()` for streaming responses
- Provides two tools to the AI:
  - `str_replace_editor` - Create/edit files (create, view, str_replace, insert)
  - `file_manager` - Rename/delete files
- Reconstructs VFS from serialized data sent by client
- Persists conversation + VFS state to database on completion (authenticated users only)

**System Prompt:** `/src/lib/prompts/generation.tsx`
- Instructs AI to generate React components with TypeScript + Tailwind
- Enforces file naming conventions (PascalCase for components, kebab-case for utilities)
- Requires explicit tool use for all file operations

#### 3. Live Preview System

**Location:** `/src/components/preview/PreviewFrame.tsx`

The preview uses an iframe with **ES Module Import Maps** to render components without bundling:

1. **JSX Transformation:** Babel transforms JSX → ES6 modules (`/src/lib/transform/jsx-transformer.ts`)
2. **Import Map Generation:** Creates import map with:
   - External deps from CDN (e.g., `"react": "https://esm.sh/react@19"`)
   - Internal files as blob URLs (e.g., `"/App.jsx": "blob:..."`)
   - Support for `@/` alias resolution
3. **Sandbox Rendering:** HTML with import maps injected into sandboxed iframe
4. **Error Handling:** Syntax errors and runtime errors displayed inline

#### 4. Authentication & Persistence

**JWT-based authentication** (`/src/lib/auth.ts`, `/src/actions/index.ts`):
- Password hashing with bcrypt (10 rounds)
- HTTP-only cookies with 7-day expiration
- Server Actions for sign up/sign in/sign out

**Database Schema** (Prisma):
```prisma
User {
  id, email, password (hashed), projects[]
}

Project {
  id, name, userId?, messages (JSON), data (JSON)
}
```

**Storage:**
- `messages`: Full conversation history (AI SDK format)
- `data`: Serialized VirtualFileSystem state

**Anonymous Users:**
- Can use app without signing up
- Work tracked in sessionStorage (`/src/lib/anon-work-tracker.ts`)
- Prompted to save work before navigating away
- No project persistence

#### 5. Mock Provider for Demo Mode

**Location:** `/src/lib/provider.ts`

When `ANTHROPIC_API_KEY` is not set, the app uses a `MockLanguageModel` that returns static demo responses. This allows the app to:
- Run without API key for demos
- Show example component generation flow
- Maintain full UI functionality

## Key Conventions

### Import Alias
Use `@/` for all imports from `/src`:
```typescript
import { useFileSystem } from "@/lib/contexts/file-system-context";
```

### Server/Client Boundaries
- **Server Components** by default (no directive needed)
- **Client Components** require `"use client"` at top of file (for hooks, state, events)
- **Server Actions** require `"use server"` directive (for mutations)
- **Server-only modules** use `import "server-only"` to enforce server-side execution

### Component Organization
```
/src/components/
├── ui/           # shadcn/ui components (Radix UI primitives)
├── auth/         # Authentication dialogs
├── chat/         # Chat interface components
├── editor/       # Code editor & file tree
└── preview/      # Component preview
```

### Contexts
Global state managed via React Context:
- `FileSystemProvider` - VFS instance, selected file, refresh triggers
- `ChatProvider` - AI chat state, message handling

### Styling
- Tailwind CSS v4 utility classes
- `cn()` helper from `/src/lib/utils.ts` for conditional classes
- CSS variables for theme colors (see `/src/app/globals.css`)

## Environment Variables

```bash
# Optional - falls back to mock provider if not set
ANTHROPIC_API_KEY=your-key-here

# Optional - defaults to "development-secret-key"
JWT_SECRET=your-secret
```

## Database Workflow

**Custom Prisma output location:** `/src/generated/prisma` (avoid node_modules)

After schema changes:
1. Update `/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description_of_change`
3. Prisma client auto-regenerates

## Testing

Tests use **Vitest** with **React Testing Library** and **jsdom** environment. Configuration in `vitest.config.mts`.

## Project Structure

```
/src/
├── app/                      # Next.js App Router pages
│   ├── page.tsx              # Home (redirects if authenticated)
│   ├── [projectId]/page.tsx  # Project detail page
│   └── api/chat/route.ts     # AI chat API endpoint
├── components/               # React components
├── lib/                      # Core business logic
│   ├── file-system.ts        # VirtualFileSystem class
│   ├── auth.ts               # Session management
│   ├── provider.ts           # AI provider (Claude or mock)
│   ├── contexts/             # React contexts
│   ├── tools/                # AI tool implementations
│   ├── prompts/              # AI system prompts
│   └── transform/            # JSX → ES6 transformation
├── actions/                  # Server Actions
└── generated/prisma/         # Prisma client (generated)
```

## Node.js Compatibility

The project uses `node-compat.cjs` to polyfill Node.js built-ins for browser compatibility. This is automatically loaded via `NODE_OPTIONS` in all npm scripts.
