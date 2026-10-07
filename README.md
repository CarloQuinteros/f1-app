# F1 API

A modern full-stack application for exploring real-time Formula 1 data.

**Frontend:** React 18 + TypeScript + Tailwind CSS  
**Backend:** Express + TypeScript  
**Data Source:** OpenF1 API (https://api.openf1.org/v1)

## Quick Start

### Prerequisites
- Node.js 18+ and npm (npm workspaces support)

### Installation
```bash
git clone <repo-url>
cd F1API
npm install
```

### Development
```bash
npm run dev
```
- **Client:** http://localhost:3000 (Vite dev server)
- **Server:** http://localhost:3001/api (Express)

The client dev server proxies API requests to the backend.

### Testing
```bash
npm test           # All tests, watch mode
npm test -w server --run  # Server tests, single run
npm test -w client --run  # Client tests, single run
```

### Build
```bash
npm run build
```
Compiles TypeScript and bundles client and server for production.

### Linting & Type Checking
```bash
npm run lint        # ESLint + Prettier check
npm run type-check  # TypeScript type check
```

## Project Structure

```
F1API/
├── client/              # React + Vite + TypeScript
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/              # Express + TypeScript
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   ├── tsconfig.json
│   └── package.json
├── .env.example         # Environment template
├── CLAUDE.md            # Claude Code guidance
└── package.json         # Root workspace config
```

## Configuration

Copy `.env.example` to `.env` and customize:

```bash
VITE_API_URL=http://localhost:3001/api  # Client API URL
OPENF1_BASE_URL=https://api.openf1.org/v1  # OpenF1 API
PORT=3001  # Server port
NODE_ENV=development
```

## Git Workflow

**Branch naming:**
- `feature/<name>` — new features
- `fix/<name>` — bug fixes
- `chore/<name>` — maintenance
- `docs/<name>` — documentation

**Commit format:** Conventional Commits
```
feat(scope): description
fix(scope): description
test(scope): description
refactor(scope): description
chore: description
docs: description
```

**Claude Code always asks for approval before committing or pushing.**

## Code Conventions

- **Variables/Functions:** camelCase, descriptive names
- **Components/Types:** PascalCase
- **Files:** `PascalCase.tsx` (components), `camelCase.ts` (others)
- **Booleans:** `isActive`, `hasError`, `shouldRender`
- **Constants:** UPPER_SNAKE_CASE
- **URLs:** kebab-case (`/api/sessions`)

**Details:** See [CLAUDE.md](./CLAUDE.md) for comprehensive guidance.

## Development Tips

- **Format on Save:** Configure VS Code (see [CLAUDE.md](./CLAUDE.md#linting--formatting))
- **Run a Single Test:** `npm test -w server -- src/routes/health.test.ts`
- **Mock OpenF1 in Tests:** Never hit the live API; mock the `openf1Client` service
- **No Global Tools:** Use `npx <tool>` or `npm run <script>`

## Resources

- [OpenF1 API](https://openf1.org/)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)

## License

MIT
