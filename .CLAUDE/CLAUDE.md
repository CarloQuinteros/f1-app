# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**F1API** is a full-stack JavaScript/TypeScript application that fetches real-time Formula 1 data from the OpenF1 API and presents it through a React frontend.

### Stack
- **Frontend:** React 18 + TypeScript, Vite, Tailwind CSS, Vitest + React Testing Library
- **Backend:** Express + TypeScript, Vitest + Supertest
- **Package Manager:** npm (workspaces for monorepo structure)
- **Version Control:** Git with conventional commits and standard branches
- **External API:** OpenF1 (https://api.openf1.org/v1) — no local database

### Architecture
```
Client (React + TS)
        ↓
   Vite Dev Server (port 3000)
        ↓
   [/api proxy]
        ↓
  Express Backend (port 3001)
        ↓
  OpenF1 API (external)
```

The backend proxies requests to OpenF1, adding request validation, error handling, and optional future enhancements (caching, rate limiting). No data is persisted; all responses come directly from OpenF1.

---

## Development Commands

All commands run from the **project root** (F1API/). The workspaces structure allows running commands across both client and server.

### Install Dependencies
```bash
npm install
```
Installs all dependencies for client and server locally. **Never use `npm install -g`** — all tools use `npx` or are workspace-scoped.

### Development Mode
```bash
npm run dev
```
Starts both client (Vite on port 3000) and Express server (port 3001) concurrently. Open http://localhost:3000 in the browser.

### Build
```bash
npm run build
```
Compiles TypeScript and bundles the client (Vite) and server.

### Testing
```bash
npm test
```
Runs all tests (client Vitest + React Testing Library, server Vitest + Supertest).

**Run a single test file:**
```bash
npm test -w server -- src/routes/health.test.ts
npm test -w client -- src/App.test.tsx
```

### Linting & Type Checking
```bash
npm run lint
npm run type-check
```

### Server Only (Direct)
```bash
npm run dev -w server     # Run server with hot reload
npm run build -w server   # Build server
npm test -w server        # Test server
```

### Client Only (Direct)
```bash
npm run dev -w client     # Run client dev server
npm run build -w client   # Build client
npm test -w client        # Test client
npm run test:ui -w client # Run tests with UI
```

---

## Code Structure

### Root Files
- `package.json` — Workspace definitions, root scripts, shared dev dependencies
- `.env.example` — Environment template; copy to `.env` (not committed)
- `.eslintrc.json` — ESLint config shared across workspaces
- `.prettierrc.json` — Prettier config (auto-format to this style)
- `.gitignore` — Excludes node_modules/, dist/, .env, etc.

### Client (`client/`)
```
client/
  src/
    main.tsx         # React entry point
    App.tsx          # Root component
    index.css        # Tailwind import
    App.test.tsx     # Example component test (Vitest + RTL)
  index.html         # HTML template
  vite.config.ts     # Vite config; proxies /api to localhost:3001
  tsconfig.json      # TypeScript config
  vitest.config.ts   # Vitest config
```

**Frontend proxying:** Vite dev server proxies all `/api/*` requests to the Express backend (http://localhost:3001/api).

### Server (`server/`)
```
server/
  src/
    server.ts                   # Entry point; starts Express
    app.ts                      # Express app factory (exported for tests)
    middleware/
      errorHandler.ts           # Centralized error handler
    routes/
      health.ts                 # GET /api/health
      health.test.ts            # Example route test (Supertest)
      sessions.ts               # GET /api/sessions (calls OpenF1)
    services/
      openf1Client.ts           # Fetch wrapper; base URL from OPENF1_BASE_URL env var
  tsconfig.json                 # TypeScript config
  vitest.config.ts              # Vitest config
```

**Services:** `openf1Client.ts` is the single point of contact with OpenF1. All routes use this service; tests mock it.

**Routes:** Each route file is a thin Express Router that calls a service and handles errors.

---

## Naming Conventions

Follow these conventions for consistency and readability.

### Variables & Functions
- **camelCase** for all variables and functions: `fetchSessions`, `sessionKey`, `handleClick`
- **Booleans** prefix with `is`, `has`, or `should`: `isLoading`, `hasError`, `shouldRetry`
- **Abbreviations** avoid; spell out: `sessionData` not `sd`, `router` not `r`

### Types & Interfaces
- **PascalCase** for types, interfaces, and classes: `OpenF1Session`, `ApiError`, `SessionRouter`
- Use descriptive type names that reflect the domain: `type SessionKey = number` (not `type ID = number`)

### Files
- **React components:** `PascalCase.tsx` (e.g., `SessionList.tsx`, `App.tsx`)
- **Non-component files:** `camelCase.ts` (e.g., `openf1Client.ts`, `errorHandler.ts`)
- **Test files:** same name as the module + `.test.ts(x)` (e.g., `health.test.ts`, `App.test.tsx`)

### Constants
- **UPPER_SNAKE_CASE** for constants: `const MAX_RETRIES = 3;`
- **Environment variables:** `OPENF1_BASE_URL`, `PORT`, `NODE_ENV` (UPPER_SNAKE_CASE in .env)

### Routing
- **Routes:** kebab-case in URLs: `/api/sessions`, `/api/drivers`, `/api/drivers/:id`
- **Query params:** camelCase keys: `?year=2024&sessionType=race`

---

## Dependencies Management

### Install Rules
- **Project-local only:** all dependencies go into the workspace's `package.json`. Run `npm install` from the root; npm handles workspace linking.
- **Never `npm install -g`:** global installs pollute the system. Use `npx` instead:
  - `npx prettier --check .` to format-check
  - `npx eslint .` to lint (or use `npm run lint`)
  - No global TypeScript, Vite, or any tool.
- **Add dependencies:** `npm install <pkg> -w client` or `npm install <pkg> -w server` or at the root for shared dev deps.

### Dev vs. Production
- **`npm install`:** production dependencies; shipped to users.
- **`npm install -D`:** development dependencies; linting, testing, build tools. Never used in production.

---

## Git Workflow

**IMPORTANT:** Claude always asks the user for approval before committing or pushing. Never auto-commit; treat every commit as a deliberate action the user must review.

### Branch Naming
Use standard Git Flow prefixes:
- `feature/<kebab-case>` — new features: `feature/sessions-list`, `feature/driver-standings`
- `fix/<kebab-case>` — bug fixes: `fix/header-alignment`, `fix/api-timeout`
- `chore/<kebab-case>` — maintenance: `chore/update-deps`, `chore/add-tests`
- `docs/<kebab-case>` — documentation: `docs/api-endpoints`, `docs/setup-guide`
- `main` — production-ready code (default branch)
- `develop` — integration branch (optional; direct to main is fine for small projects)

### Commit Messages
Use Conventional Commits format:

```
<type>(<scope>): <subject>

<body (optional)>
```

**Types:**
- `feat:` new feature
- `fix:` bug fix
- `test:` add or update tests
- `refactor:` code refactor (no feature or bug fix)
- `chore:` maintenance, deps, build config
- `docs:` documentation
- `style:` code style (spacing, naming, not visual)

**Scope (optional):** what part changed: `server`, `client`, `api`, `middleware`, etc.

**Examples:**
```
feat(client): add sessions list component
fix(server): handle OpenF1 API timeouts gracefully
test(routes): add health endpoint tests
refactor(services): simplify openf1Client fetch logic
chore: upgrade TypeScript to 5.3.3
docs: update development setup instructions
```

**Do not include co-authored-by lines** — Claude auto-adds attribution on commit.

### Workflow
1. Create a branch: `git checkout -b feature/my-feature`
2. Make changes and test locally: `npm run dev`, `npm test`, `npm run lint`
3. Stage and commit (ask user for approval first): `git add <files>` then `git commit -m "..."`
4. Push (ask user for approval first): `git push origin feature/my-feature`
5. Create a pull request on GitHub (if using GitHub)

---

## Testing

### Approach
- **Unit tests for services:** Mock external calls (OpenF1 API). Test business logic in isolation.
- **Integration tests for routes:** Use Supertest + mock services. Verify request/response contract.
- **Component tests:** React Testing Library. Test user interactions, not implementation details.
- **Never test against live APIs:** Always mock. Tests must be deterministic and fast.

### Running Tests
```bash
npm test              # All tests, watch mode
npm test -w server    # Server tests only
npm test -w client    # Client tests only
npm test -w server --run  # Single run (CI mode)
```

### Example: Route Test (Supertest)
```typescript
import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('GET /api/sessions', () => {
  it('should return sessions from OpenF1', async () => {
    const app = createApp();
    const response = await request(app)
      .get('/api/sessions')
      .query({ year: 2024 });

    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
```

### Example: Component Test (React Testing Library)
```typescript
import { render, screen } from '@testing-library/react';
import { App } from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('should render the title', () => {
    render(<App />);
    expect(screen.getByText('F1 API')).toBeInTheDocument();
  });
});
```

---

## Environment Variables

Create a `.env` file at the project root (copy from `.env.example`):

```bash
VITE_API_URL=http://localhost:3001/api  # Client API base URL
OPENF1_BASE_URL=https://api.openf1.org/v1  # OpenF1 API URL
PORT=3001  # Server port
NODE_ENV=development  # dev or production
```

**Key points:**
- Prefix client-side vars with `VITE_` so Vite exposes them to the browser.
- Server-side vars (no prefix) are read via `process.env`.
- Never commit `.env`; it's in `.gitignore`.

---

## Code Style & Quality

### Writing Functions
- **Single responsibility:** Each function does one thing well.
- **Small functions:** Aim for < 20 lines. Break down large functions.
- **Descriptive names:** `fetchSessionsByYear()` not `get()` or `fetch()`
- **No dead code:** Delete unused variables, functions, imports. No commented-out code.

### Comments
- Write code that reads like prose; names should explain intent.
- **Add a comment only when the WHY is non-obvious:**
  - A hidden constraint: "We cache here because OpenF1 rate-limits"
  - A subtle invariant: "sessionKey is unique per year"
  - A workaround for a specific bug or limitation
- **Do not comment:**
  - What the code does (the code should be clear)
  - Usage of a function if the signature and name are clear
  - Implementation details (how the code works)

### Type Safety
- Use strict TypeScript: `noImplicitAny: true`, `strictNullChecks: true`, etc.
- Prefer interfaces for object shapes: `interface OpenF1Session { ... }`
- Use generics for reusable logic: `function createRouter<T>(handler: (req: Request) => Promise<T[]>)`
- Avoid `any`; use `unknown` if you must, then narrow the type.

### Error Handling
- Catch errors at system boundaries (API calls, file I/O).
- Return or throw errors with context: `new Error('Failed to fetch sessions from OpenF1')`
- Use structured error types: `interface ApiError { status: number; message: string; }`
- Never swallow errors silently.

### Async/Await
- Prefer async/await over `.then()` chains for readability.
- Always `await` promises; don't fire-and-forget without intent.
- Handle rejection: `try/catch` or `.catch()`.

---

## Linting & Formatting

### Auto-format on Save
The project includes ESLint and Prettier. Configure your editor to format on save:

**VS Code:**
Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Manual Formatting
```bash
npx prettier --write .  # Format all files
npm run lint            # Check linting
npm run lint -- --fix   # Fix lint errors
```

---

## Troubleshooting

### Dependencies Won't Install
- Clear cache: `npm cache clean --force`
- Delete `node_modules/` and lock file: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

### Tests Fail with Module Not Found
- Ensure dev dependencies are installed: `npm install -D` at the workspace root
- Check that test file naming matches: `*.test.ts` or `*.test.tsx`
- Verify TypeScript paths if using path aliases

### API Requests Timeout
- Check that the server is running: `npm run dev` (should log "Server running on http://localhost:3001")
- Verify OpenF1 API is reachable: `curl https://api.openf1.org/v1/sessions`
- Check `OPENF1_BASE_URL` in `.env`

### Tailwind Styles Not Applying
- Ensure `@import "tailwindcss";` is in `client/src/index.css`
- Restart the dev server: `Ctrl+C` and `npm run dev`
- Clear browser cache: `Ctrl+Shift+Delete`

---

## Common Tasks

### Add a New API Route
1. Create a service function in `server/src/services/` (e.g., `fetchDrivers()`)
2. Create a route in `server/src/routes/drivers.ts` that calls the service
3. Register the route in `server/src/app.ts`: `app.use('/api/drivers', driversRouter)`
4. Add tests in `server/src/routes/drivers.test.ts`
5. Create a corresponding client component or API hook

### Add a New Client Page
1. Create a component in `client/src/` (e.g., `SessionsPage.tsx`)
2. Use `fetch()` or a hook to call `/api/sessions`
3. Add Tailwind classes for styling
4. Add tests in `client/src/SessionsPage.test.tsx`
5. Link it from the main `App.tsx`

### Update Dependencies
```bash
npm outdated  # See what can be updated
npm update    # Update to latest compatible
npm install <pkg>@latest  # Install a specific version
```

---

## Resources & References

- **OpenF1 API Docs:** https://openf1.org/
- **React Docs:** https://react.dev
- **Express Docs:** https://expressjs.com
- **Tailwind CSS:** https://tailwindcss.com
- **Vite Docs:** https://vitejs.dev
- **TypeScript Docs:** https://www.typescriptlang.org
- **Vitest Docs:** https://vitest.dev
- **React Testing Library:** https://testing-library.com/react
