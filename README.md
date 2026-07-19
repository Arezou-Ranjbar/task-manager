# Kanbanly — Task Manager

A simple but professional Kanban board, inspired by Trello. Built as a modern
Next.js application with a clean, typed architecture.

![Stack](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/TailwindCSS-3-38bdf8)

## Features

- **Login (fake authentication)** — any email + a 4+ character password signs you in; the session is persisted to `localStorage`.
- **Dashboard** — a four-column board (Backlog, To Do, In Progress, Done).
- **Create / edit / delete tasks** — validated forms with React Hook Form + Zod, confirmation before deleting.
- **Drag & drop** — reorder tasks within a column or move them across columns, powered by `@dnd-kit`.
- **Search** — debounced full-text search across title, description, and tags.
- **Filter** — filter by priority and by tag, combinable with search.
- **Dark mode** — light/dark/system theme, persisted and flash-free.
- **Responsive** — usable from mobile to desktop, with a horizontally scrollable board on small screens.

## Stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| Framework    | Next.js 14 (App Router)                     |
| Language     | TypeScript                                  |
| Styling      | Tailwind CSS + shadcn/ui (Radix primitives) |
| Server state | TanStack React Query                        |
| Forms        | React Hook Form                             |
| Validation   | Zod                                         |
| Drag & drop  | @dnd-kit                                    |
| Toasts       | sonner                                      |

Since the brief calls for fake authentication, there is no real backend: the
"API" lives in `services/` and persists to `localStorage`, wrapped in
promises with simulated latency so the React Query layer behaves exactly as
it would against a real API. Swapping in a real backend later means
rewriting `services/authService.ts` and `services/taskService.ts` only — no
component changes required.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with any
email address and a password of at least 4 characters (or click **Use demo
credentials**).

### Available scripts

| Script                 | Description                           |
| ---------------------- | ------------------------------------- |
| `npm run dev`          | Start the dev server                  |
| `npm run build`        | Production build                      |
| `npm run start`        | Run the production build              |
| `npm run lint`         | Run ESLint                            |
| `npm run lint:fix`     | Run ESLint with autofix               |
| `npm run format`       | Format the codebase with Prettier     |
| `npm run format:check` | Check formatting in CI                |
| `npm run typecheck`    | Run the TypeScript compiler (no emit) |

## Project structure

```
task-manager/
├─ app/                     # Next.js App Router routes
│  ├─ login/                # Login page
│  ├─ dashboard/            # Main kanban dashboard (protected)
│  ├─ layout.tsx            # Root layout, fonts, Providers
│  └─ globals.css           # Design tokens (light/dark) + Tailwind layers
├─ components/
│  ├─ ui/                   # shadcn/ui primitives (button, dialog, select…)
│  ├─ kanban/                # Board, column, card, task form, toolbar
│  ├─ layout/                # Navbar, theme provider/toggle, app providers
│  └─ auth/                  # Route guard
├─ hooks/                    # useAuth, useTasks (React Query), useDebounce
├─ services/                  # Fake auth + task "API" (localStorage-backed)
├─ lib/                       # cn() helper, constants, Zod schemas
├─ types/                     # Shared TypeScript types
├─ .github/workflows/ci.yml   # Lint, typecheck, build, Docker build
├─ Dockerfile                 # Multi-stage build, standalone output
├─ docker-compose.yml
├─ eslint.config.js
├─ prettier.config.js
└─ package.json
```

## Running with Docker

```bash
docker compose up --build
```

The app is served at [http://localhost:3000](http://localhost:3000). The
image uses Next.js's `standalone` output for a small, production-ready
runtime layer.

## Notes on the fake authentication & API

This project intentionally has **no real backend**. It's meant to
demonstrate frontend architecture, state management, and UX patterns:

- `services/authService.ts` accepts any syntactically valid email and a
  password of 4+ characters, and stores a mock user object.
- `services/taskService.ts` seeds a handful of example tasks on first run
  and persists all CRUD/move operations to `localStorage`.
- Both simulate network latency so loading states, optimistic updates, and
  error handling all behave the way they would against a real API.

