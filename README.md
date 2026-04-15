# Prompt Library — AI Image Generation Prompt Manager

A full-stack app to store, browse, and manage AI image generation prompts.

## Stack
| Layer    | Technology                       |
|----------|----------------------------------|
| Frontend | Angular 16 (standalone components, lazy-loaded routes) |
| Backend  | Django 4.2 (plain views, no DRF) |
| Database | PostgreSQL 15                    |
| Cache    | Redis 7 (view counters)          |
| Proxy    | Nginx (SPA routing + API proxy)  |

---

## Quick Start (Docker)

```bash
git clone <repo-url>
cd prompt-library
docker-compose up --build
```

- App: http://localhost
- API: http://localhost/api/prompts/

---

## API Endpoints

| Method | Path                    | Auth? | Description              |
|--------|-------------------------|-------|--------------------------|
| GET    | /api/prompts/           | No    | List all prompts         |
| POST   | /api/prompts/           | Yes   | Create a new prompt      |
| GET    | /api/prompts/:id/       | No    | Get prompt (increments Redis view count) |
| GET    | /api/prompts/tags/      | No    | List all tags            |
| POST   | /api/auth/login/        | No    | Login → JWT token        |
| POST   | /api/auth/register/     | No    | Register → JWT token     |

---

## Architecture Decisions

### Backend — Plain Django Views (no DRF)
Used `View` subclasses + manual `JsonResponse` to keep the stack requirement (Django, not DRF) and stay explicit. All validation is done manually, mirroring what serializers would do.

### Redis — View Counter
`redis.incr('prompt:views:<id>')` is called on every `GET /prompts/:id/`. Redis is the sole source of truth for view counts — Postgres is never written to on reads. The count is embedded in the JSON response.

### Frontend — Angular 16 Standalone + Lazy Loading
Every feature component is standalone and lazy-loaded via `loadComponent` / `loadChildren`. This gives code-splitting for free and removes the need for `NgModule` boilerplate entirely.

**Folder layout:**
```
src/app/
  core/           # Singleton services, guards, interceptors (provided in root)
    services/     # AuthService, PromptService
    guards/       # authGuard (functional)
    interceptors/ # JwtInterceptor (attaches Bearer token)
  shared/
    models/       # TypeScript interfaces (Prompt, Tag, AuthResponse)
  features/       # Feature-sliced modules, each self-contained
    auth/login/
    prompts/list/
    prompts/detail/
    prompts/form/
```

### JWT Auth
- Tokens issued on login/register, stored in `localStorage`.
- `JwtInterceptor` attaches `Authorization: Bearer <token>` to every outgoing request.
- `POST /api/prompts/` is protected — backend rejects requests without a valid token.
- `POST /prompts/new` is guarded on the frontend via `authGuard`.

### Bonus B — Tagging
- `Tag` model has a Many-to-Many relationship with `Prompt`.
- Filter by tag via `GET /api/prompts/?tag=<name>`.
- Tags are displayed on list and detail views.
- The create-prompt form lets users pick existing tags or add custom ones.

---

## Local Dev (without Docker)

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Set env vars or create a .env file
export DATABASE_URL=postgresql://promptuser:promptpass@localhost:5432/promptlib
export REDIS_URL=redis://localhost:6379/0
export SECRET_KEY=dev-secret
export JWT_SECRET=dev-jwt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm start          # serves on http://localhost:4200
```
