# TaskFlow — Task Management System

![CI](https://github.com/fiqahalim2509/aucthux-technical-assessment/actions/workflows/ci.yml/badge.svg)

A full-stack task management application built with **Laravel 11** (REST API) and **Next.js 15** (App Router, React). Submitted as a technical assessment for the Senior Software Engineer role at Aucthux.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [API Reference](#api-reference)
- [Assumptions Made](#assumptions-made)
- [Libraries Used](#libraries-used)
- [Architecture Decisions](#architecture-decisions)
- [What I Would Improve With More Time](#what-i-would-improve-with-more-time)

---

## Tech Stack

| Layer    | Technology                           |
|----------|--------------------------------------|
| Backend  | PHP 8.4, Laravel 11, MySQL 8.0       |
| Frontend | Next.js 15, React 18, TypeScript     |
| Styling  | Tailwind CSS                         |
| State    | TanStack Query v5                    |
| Infra    | Docker, Docker Compose               |
| Testing  | PHPUnit (Laravel feature tests)      |

---

## Project Structure

```
aucthux-technical-assessment/
├── backend/                  # Laravel 11 REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/TaskController.php
│   │   │   ├── Requests/StoreTaskRequest.php
│   │   │   ├── Requests/UpdateTaskRequest.php
│   │   │   └── Resources/TaskResource.php
│   │   ├── Models/Task.php
│   │   ├── Repositories/
│   │   │   ├── Contracts/TaskRepositoryInterface.php
│   │   │   └── TaskRepository.php
│   │   └── Services/TaskService.php
│   ├── database/
│   │   ├── migrations/
│   │   └── factories/TaskFactory.php
│   ├── routes/api.php
│   ├── tests/Feature/TaskApiTest.php
│   └── Dockerfile
├── frontend/                 # Next.js 15 web app
│   ├── src/
│   │   ├── app/
│   │   │   ├── tasks/page.tsx
│   │   │   └── tasks/create/page.tsx
│   │   ├── components/tasks/
│   │   │   ├── TasksClient.tsx
│   │   │   └── CreateTaskForm.tsx
│   │   ├── hooks/useTasks.ts
│   │   ├── lib/api.ts
│   │   └── types/task.ts
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose)
- Git

### 1. Clone the repository

```bash
git clone <repo-url>
cd aucthux-technical-assessment
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

The defaults work out-of-the-box for local Docker development. No changes needed unless you want custom credentials.

Also copy the backend env:
```bash
cp backend/.env.example backend/.env
```

And the frontend env:
```bash
cp frontend/.env.example frontend/.env.local
```

### 3. Start all services

```bash
docker compose up --build
```

This will:
- Start MySQL 8.0 and wait for it to be healthy
- Install PHP/Composer dependencies and run `php artisan serve`
- Install Node dependencies and start the Next.js dev server

> First build takes ~2–3 minutes due to Composer and npm installs.

### 4. Run migrations and seed data

In a second terminal (while containers are running):

```bash
# Generate app key
docker compose exec backend php artisan key:generate

# Run migrations
docker compose exec backend php artisan migrate

# (Optional) Seed with 8 sample tasks
docker compose exec backend php artisan db:seed
```

### 5. Access the apps

| Service       | URL                         |
|---------------|-----------------------------|
| Frontend      | http://localhost:3000       |
| Backend API   | http://localhost:8000/api/tasks |

### Running Tests

```bash
docker compose exec backend php artisan test
```

Or locally (with PHP + MySQL running):

```bash
cd backend
php artisan test
```

Tests also run automatically via **GitHub Actions CI** on every push and pull request to `main`. See `.github/workflows/ci.yml`.

---

## API Reference

Base URL: `http://localhost:8000/api/tasks`

All responses use `application/json`.

### GET /api/tasks

List tasks with optional filters and pagination.

**Query Parameters**

| Param      | Type   | Example       | Description                     |
|------------|--------|---------------|---------------------------------|
| `status`   | string | `pending`     | Filter by `pending`/`completed` |
| `priority` | string | `high`        | Filter by `low`/`medium`/`high` |
| `page`     | int    | `2`           | Page number (default: 1)        |
| `per_page` | int    | `10`          | Items per page (max: 100)       |

**Example response:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "Review pull request",
      "description": "Check the API changes branch",
      "status": "pending",
      "priority": "high",
      "created_at": "2024-01-15T10:30:00.000000Z",
      "updated_at": "2024-01-15T10:30:00.000000Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 42
  }
}
```

---

### POST /api/tasks

Create a new task.

**Body**
```json
{
  "title": "Review pull request",
  "description": "Optional details here",
  "priority": "high"
}
```

**Responses**
- `201 Created` — task created successfully
- `422 Unprocessable` — validation failed
- `409 Conflict` — duplicate title within 10 seconds

---

### PUT /api/tasks/{id}

Update a task. All fields are optional (PATCH semantics despite using PUT).

**Body**
```json
{
  "status": "completed"
}
```

**Responses**
- `200 OK` — updated successfully
- `404 Not Found` — task does not exist
- `422 Unprocessable` — validation failed

---

### DELETE /api/tasks/{id}

Delete a task.

**Responses**
- `200 OK` — deleted
- `404 Not Found` — task does not exist

---

## Assumptions Made

1. **No authentication required.** The spec did not mention auth, so the API is open. In production this would be behind Laravel Sanctum or Passport.

2. **PUT behaves as PATCH.** All fields in the update request are optional — only the fields provided are updated. This is more practical for the frontend use case (e.g. toggling status without resending title/description).

3. **Duplicate detection is title-exact and case-sensitive.** The 10-second window check matches titles exactly. A future improvement would be case-insensitive matching or fuzzy similarity.

4. **Pagination defaults to 15 items per page.** Capped at 100 to prevent expensive queries.

5. **Soft deletes were not implemented.** The spec says "delete tasks" without mentioning recovery, so hard deletes keep it simple.

---

## Libraries Used

### Backend (Laravel)

| Library              | Purpose                                      |
|----------------------|----------------------------------------------|
| `laravel/framework`  | Core framework (routing, ORM, validation)    |
| `phpunit/phpunit`    | Feature and unit testing                     |
| `fakerphp/faker`     | Fake data for factories and seeders          |

No extra packages beyond default Laravel 11 — deliberately minimal to demonstrate understanding of the framework itself.

### Frontend (Next.js)

| Library                          | Purpose                                               |
|----------------------------------|-------------------------------------------------------|
| `@tanstack/react-query` v5       | Server state, caching, background refetch             |
| `@tanstack/react-query-devtools` | Query inspection during development                   |
| `lucide-react`                   | Lightweight icon set                                  |
| `react-hot-toast`                | Toast notifications (success/error feedback)          |
| `clsx`                           | Conditional CSS class composition                     |
| `tailwindcss`                    | Utility-first CSS                                     |

---

## Architecture Decisions

### Backend - Repository + Service Pattern

The controller delegates all business logic to a `TaskService`, which in turn talks to a `TaskRepositoryInterface`. This separation has three practical benefits:

1. **Testability** - Unit tests can mock the repository without hitting the database.
2. **Swappability** - Changing from MySQL to another store (e.g. PostgreSQL, or even in-memory for tests) only requires updating the binding in `AppServiceProvider`.
3. **Single responsibility** - The controller handles HTTP concerns (request/response), the service handles business rules (e.g. duplicate detection), and the repository handles persistence.

### Backend - API Resources

`TaskResource` ensures the JSON shape is always consistent regardless of how the internal model evolves. Adding a field to the model does not accidentally expose it to the API.

### Frontend - App Router (Next.js 15)

App Router is the current standard and the direction of Next.js going forward. Server Components render the page shell with no client JS; the `TasksClient` component is marked `'use client'` only where interactivity is needed. This keeps the initial bundle small.

### Frontend - TanStack Query v5

TanStack Query manages all server state: caching, background refetching, and loading/error states. This removes the need for `useEffect` + `useState` boilerplate and provides a single source of truth for remote data. The query key factory (`taskKeys`) ensures consistent cache invalidation across create/update/delete mutations.

### Frontend - API client abstraction

All fetch calls are centralised in `src/lib/api.ts`. Components never call `fetch` directly — they go through typed functions (`taskApi.list`, `taskApi.create`, etc.). This makes it easy to swap the HTTP layer (e.g. add auth headers, switch to Axios) without touching components.

---

## What I Would Improve With More Time

1. **Authentication** : Add Laravel Sanctum for token-based auth; protect routes with middleware; add login/register pages on the frontend.

2. **Optimistic updates** : Currently mutations wait for the server before updating the UI. TanStack Query supports optimistic updates (immediate UI change, rollback on failure) for a snappier feel.

3. **Edit task in-place** : A modal or inline edit form on the task list, rather than navigating to a separate page.

4. **Soft deletes** : Use `SoftDeletes` in Eloquent + a "Trash" view where tasks can be restored.

5. **Search** : A full-text search endpoint (`GET /api/tasks?search=keyword`) backed by a MySQL `FULLTEXT` index or Laravel Scout.

6. **More test coverage** : Add frontend integration tests with Playwright or React Testing Library. Add unit tests for `TaskService` with a mocked repository.

7. **CI/CD pipeline** : A GitHub Actions workflow that runs `php artisan test` and `npm run lint` on every pull request.

8. **Deployment** : Deploy backend to Laravel Forge / Railway, frontend to Vercel, with environment-specific configs.
