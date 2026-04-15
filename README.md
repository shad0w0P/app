# Prompt Library — AI Image Generation Prompt Manager

A full-stack app to store, browse, and manage AI image generation prompts.

---

## Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | Angular 16 (standalone components, lazy-loaded) |
| Backend  | Django 4.2 (plain views, no DRF)                |
| Database | PostgreSQL 15                                   |
| Cache    | Redis 7 (view counters)                         |
| Proxy    | Nginx (SPA routing + API proxy)                 |

---

## Quick Start (Docker)

```bash
git clone <repo-url>
cd app
docker-compose up --build
```

- App: http://localhost
- API: http://localhost/api/prompts/

---

## Local Dev (without Docker)

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://promptuser:promptpass@localhost:5432/promptlib
export REDIS_URL=redis://localhost:6379/0
export SECRET_KEY=dev-secret
export JWT_SECRET=dev-jwt
python manage.py migrate
python manage.py runserver
```

> **SQLite fallback:** If no `DATABASE_URL` is set, the app automatically falls back to SQLite for quick local testing — no PostgreSQL required.

### Frontend

```bash
cd frontend
npm install
npm start        # serves on http://localhost:4200
```

---

## API Endpoints

| Method | Path                  | Auth? | Description                              |
|--------|-----------------------|-------|------------------------------------------|
| GET    | /api/prompts/         | No    | List all prompts                         |
| POST   | /api/prompts/         | Yes   | Create a new prompt                      |
| GET    | /api/prompts/:id/     | No    | Get prompt (increments Redis view count) |
| GET    | /api/prompts/tags/    | No    | List all tags                            |
| POST   | /api/auth/login/      | No    | Login → JWT token                        |
| POST   | /api/auth/register/   | No    | Register → JWT token                     |

---

## Architecture Decisions

### Backend — Plain Django Views (no DRF)

Django REST Framework was intentionally avoided to stay close to the stack requirement and keep the codebase explicit. Each endpoint is a `View` subclass that returns a manual `JsonResponse`. Validation is written by hand, which mirrors what DRF serializers do under the hood — making the data flow transparent rather than hidden behind framework magic.

### Redis — View Counter

`redis.incr('prompt:views:<id>')` is called on every `GET /prompts/:id/` request. Redis is the sole source of truth for view counts — Postgres is never written to on reads. This avoids a write on every page view, which would create unnecessary load. The count is embedded directly in the JSON response so no second request is needed.

### JWT Auth

Tokens are issued on login/register and stored in `localStorage`. A `JwtInterceptor` automatically attaches `Authorization: Bearer <token>` to every outgoing HTTP request. The backend validates the token manually using PyJWT — no third-party auth package. `POST /api/prompts/` rejects requests without a valid token. On the frontend, the `/prompts/new` route is protected by `authGuard` so unauthenticated users are redirected before the component even loads.

### Bonus — Tagging

`Tag` has a Many-to-Many relationship with `Prompt`. Prompts can be filtered by tag via `GET /api/prompts/?tag=<name>`. Tags are displayed on both list and detail views, and the create-prompt form lets users pick existing tags or add new ones inline.

---

## Angular Architecture — Why It's Organized This Way

### Standalone Components (no NgModule)

Angular 16 introduced stable standalone components, which allow each component to declare its own imports directly rather than belonging to a shared module. This was chosen because:

- It eliminates `NgModule` boilerplate entirely — there are no `app.module.ts` or feature module files.
- Each component is self-describing: you can read exactly what it depends on from its own `@Component` decorator.
- It aligns with the direction Angular itself is moving — NgModule is being phased out.

### Lazy Loading with `loadComponent` / `loadChildren`

Every feature route uses `loadComponent` (for single components) or `loadChildren` (for route groups). This means the JavaScript for a feature is only downloaded when the user actually navigates to it. The result is automatic code-splitting — the initial bundle stays small regardless of how many features are added.

### core/ vs shared/ vs features/

The folder structure follows a deliberate separation of concerns:

```
src/app/
  core/           # Singleton, app-wide concerns — provided in root
    services/     # AuthService, PromptService (one instance for the whole app)
    guards/       # authGuard — controls route access
    interceptors/ # JwtInterceptor — attaches Bearer token to every request
  shared/
    models/       # TypeScript interfaces only (Prompt, Tag, AuthResponse)
  features/       # One folder per user-facing feature, fully self-contained
    auth/login/
    prompts/list/
    prompts/detail/
    prompts/form/
```

**`core/`** holds things that must exist as a single instance for the entire app — services, interceptors, and guards. Keeping them here signals to any developer that these are not to be imported into multiple places.

**`shared/`** holds pure TypeScript interfaces with no logic. Models are placed here rather than in `core/` because they are not singletons — they are just type definitions used across the whole app.

**`features/`** follows a feature-sliced pattern. Each sub-folder owns its own component, template, and any feature-specific logic. This means a feature can be understood, modified, or deleted in isolation without touching anything else. It also maps cleanly to routes — the folder structure mirrors the URL structure (`/prompts/list`, `/prompts/detail`, `/prompts/form`).

### Functional Guard (`authGuard`)

The route guard is written as a plain function rather than an injectable class. Angular 16+ supports functional guards natively, which are simpler to read and test. A class-based guard requires a separate `@Injectable` decorator and `canActivate` method — a functional guard is just a function that returns `true` or `false`.