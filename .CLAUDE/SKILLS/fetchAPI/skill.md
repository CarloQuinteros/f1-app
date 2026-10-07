# fetchAPI Skill

This skill guides implementation of fetching F1 data from the OpenF1 API, extracting driver information, displaying it in the frontend, and logging the results.

## Overview

When invoked, follow these three steps in order:

1. **Read the API**: Fetch data from a URL (default: `https://api.openf1.org/v1/drivers?session_key=latest`)
2. **Display in Frontend**: Extract driver first name and last name, render in a React component
3. **Log Results**: Write a timestamped entry to `logs/fetchAPI.log` indicating success or failure

---

## Step 1: Read the API

### Backend Service
- Use the existing **single point of contact** pattern in [`server/src/services/openf1Client.ts`](server/src/services/openf1Client.ts)
- Add a new function `fetchDrivers(sessionKey?: string | number)` following the same pattern as `fetchSessions()`:
  - Accept optional `sessionKey` parameter (defaults to `latest` in query string if provided)
  - Build URL: `${OPENF1_BASE_URL}/drivers?session_key=<sessionKey>`
  - Fetch and return parsed JSON
  - Throw `Error` with context if response is not OK
- Define TypeScript interface `OpenF1Driver` with at minimum: `first_name`, `last_name`, `driver_number` (for unique key)

### Backend Route
- Create new file [`server/src/routes/drivers.ts`](server/src/routes/drivers.ts)
- Export `driversRouter` (Express Router) with `GET /` handler:
  - Accept optional query param `sessionKey` from the request
  - Call `fetchDrivers()` service
  - Return JSON array on success
  - Catch errors and pass to middleware (set `status: 502` for API errors)
- Follow the pattern in [`server/src/routes/sessions.ts`](server/src/routes/sessions.ts)

### App Registration
- Import and register the route in [`server/src/app.ts`](server/src/app.ts):
  - Add: `import { driversRouter } from './routes/drivers';`
  - Add: `app.use('/api/drivers', driversRouter);` before the error handler

### Testing
- Create [`server/src/routes/drivers.test.ts`](server/src/routes/drivers.test.ts) with Supertest
- Mock `openf1Client.fetchDrivers()` to return sample driver data
- Test: successful request returns 200 with drivers array
- Test: API error results in 502 response
- **Never test against live OpenF1 API** — always mock

---

## Step 2: Display in Frontend

### React Component
- Create new file [`client/src/DriversList.tsx`](client/src/DriversList.tsx):
  - Functional component with React hooks
  - `useState` to manage drivers array and loading/error state
  - `useEffect` to fetch `/api/drivers` on mount
  - Accept optional `sessionKey` prop to pass as query param
  - Display drivers in a list showing `first_name` and `last_name` only
  - Show "Loading..." while fetching
  - Show error message if fetch fails
  - Style with Tailwind CSS (match [`client/src/App.tsx`](client/src/App.tsx) design: slate-800, text-white, rounded shadows)

### App Integration
- Import `DriversList` in [`client/src/App.tsx`](client/src/App.tsx)
- Render it alongside or below the existing content
- Pass `sessionKey` prop if available

### Component Test
- Create [`client/src/DriversList.test.tsx`](client/src/DriversList.test.tsx) with React Testing Library
- Mock `fetch()` globally or use `vitest.mock()`
- Test: component renders loading state
- Test: component displays drivers after fetch completes
- Test: component shows error on fetch failure

---

## Step 3: Log Results

### Logging to File

When the drivers API is fetched (triggered by the backend route), append a timestamped entry to `logs/fetchAPI.log` at the project root.

**Location:** [`logs/fetchAPI.log`](logs/fetchAPI.log)

**Log Entry Format:**
```
[YYYY-MM-DD HH:mm:ss] URL: <url> | Status: <http_status> | Drivers: <count> | Result: OK
[YYYY-MM-DD HH:mm:ss] URL: <url> | Status: <http_status> | Error: <error_message> | Result: ERROR
```

**Examples:**
```
[2026-10-07 14:23:45] URL: https://api.openf1.org/v1/drivers?session_key=latest | Status: 200 | Drivers: 20 | Result: OK
[2026-10-07 14:24:10] URL: https://api.openf1.org/v1/drivers?session_key=9999 | Status: 404 | Error: Not Found | Result: ERROR
```

### Implementation

In [`server/src/routes/drivers.ts`](server/src/routes/drivers.ts):

1. Import Node.js `fs` and `path` modules
2. Define a helper function `logDriversFetch(url: string, status: number | null, count: number | null, error?: string)`:
   - Ensure `logs/` directory exists (create it if missing with `fs.mkdirSync()`)
   - Build timestamped log entry per format above
   - Append to `logs/fetchAPI.log` using `fs.appendFileSync()`
   - **Never throw** — catch and silently handle file system errors (logging failures should not crash the API)

3. Call `logDriversFetch()` in the route handler:
   - **On success:** Log with HTTP 200, driver count, and "OK"
   - **On error:** Log with error status, error message, and "ERROR"
   - Log both success and failure cases

### Directory & Git
- Create [`logs/`](logs/) directory if it doesn't exist (the route handler will do this)
- Add `logs/` to [`.gitignore`](.gitignore) so log files are never committed
- Verify `.gitignore` includes: `logs/`

---

## Code Style & Rules

Follow all conventions from [`CLAUDE.md`](../../CLAUDE.md):

- **Naming:** camelCase for functions/variables, PascalCase for components/types, UPPER_SNAKE_CASE for constants
- **Comments:** Only explain WHY when non-obvious; let code be self-documenting
- **No dead code:** Delete unused imports, variables, functions
- **Error handling:** Catch at boundaries (API calls); throw with context; never silently fail
- **Type safety:** Use interfaces; avoid `any`; prefer `unknown` if you must
- **Testing:** Always mock external APIs; tests must be deterministic

---

## Verification

After completing all three steps:

1. **Run the dev server:** `npm run dev`
   - Client starts on http://localhost:3000
   - Server starts on http://localhost:3001
   - Vite proxies `/api/*` to the backend

2. **Test in the browser:**
   - Open http://localhost:3000
   - Verify `DriversList` component loads and displays drivers
   - Check browser console for no errors

3. **Run automated tests:**
   - `npm test` — all tests pass (backend route tests, component tests)
   - `npm run lint` — no linting errors
   - `npm run type-check` — no TypeScript errors

4. **Verify logging:**
   - Check `logs/fetchAPI.log` exists after first API call
   - Confirm entries are timestamped and properly formatted
   - Test both success and error scenarios (e.g., invalid `sessionKey`)

5. **Commit & push:**
   - Ask the user for approval before committing
   - Use Conventional Commits format:
     ```
     feat(api): add drivers endpoint with OpenF1 fetch and logging
     ```
   - End commit message with: `Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`

---

## Related Files

- [`server/src/services/openf1Client.ts`](server/src/services/openf1Client.ts) — Single point of contact with OpenF1 (reference pattern)
- [`server/src/routes/sessions.ts`](server/src/routes/sessions.ts) — Example route structure (follow this pattern)
- [`server/src/app.ts`](server/src/app.ts) — Where to register the route
- [`client/src/App.tsx`](client/src/App.tsx) — Main component for frontend integration
- [`.CLAUDE/CLAUDE.md`](.CLAUDE/CLAUDE.md) — Full project conventions and setup
