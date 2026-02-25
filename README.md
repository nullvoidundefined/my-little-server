# my-little-server

REST API for tracking jobs, recruiters, and recruiting firms. Built with Express, TypeScript, and PostgreSQL.

**Data model:** This is a **single-user** app. The jobs, recruiters, and recruiting_firms tables have no `user_id` column; there is no per-user data isolation. All authenticated users share the same data. If you need multi-tenant isolation, add `user_id` to those tables and scope all queries by it.

## Prerequisites

- Node.js 22+
- PostgreSQL (e.g. [Neon](https://neon.tech), or local)

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and set DATABASE_URL (and optionally PORT, CORS_ORIGIN, NODE_ENV)
npm run migrate:up
```

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Run with hot reload (tsx watch) |
| `npm run build`   | Compile TypeScript to `dist/`  |
| `npm run start`   | Run compiled app (`node dist/index.js`) |
| `npm run migrate:up`   | Apply pending migrations      |
| `npm run migrate:down` | Roll back one migration       |
| `npm run test`    | Run unit tests (mocks DB)     |
| `npm run test:coverage` | Run unit tests with coverage   |
| `npm run test:integration` | Run integration tests (real DB; see below) |
| `npm run lint`    | Lint source                   |
| `npm run format:check` | Check formatting (Prettier) |
| `npm run format`  | Format code                   |

## API

Base URL: `http://localhost:3000` (or your `PORT`).

- **`GET /health`** — Health check (returns `{ status, db }`).

### Jobs

| Method   | Path        | Description        |
| -------- | ----------- | ------------------- |
| `GET`    | `/jobs`     | List jobs (query: `limit`, `offset`) |
| `GET`    | `/jobs/:id` | Get one job         |
| `POST`   | `/jobs`     | Create job (body: `company`, `role`, optional `status`, `applied_date`, `notes`) |
| `PATCH`  | `/jobs/:id` | Update job (partial body) |
| `DELETE` | `/jobs/:id` | Delete job          |

### Recruiters

| Method   | Path               | Description        |
| -------- | ------------------ | ------------------- |
| `GET`    | `/recruiters`      | List recruiters     |
| `GET`    | `/recruiters/:id`  | Get one recruiter   |
| `POST`   | `/recruiters`      | Create recruiter   |
| `PATCH`  | `/recruiters/:id`  | Update recruiter   |
| `DELETE` | `/recruiters/:id`  | Delete recruiter   |

### Recruiting firms

| Method   | Path                      | Description        |
| -------- | ------------------------- | ------------------- |
| `GET`    | `/recruiting-firms`       | List firms          |
| `GET`    | `/recruiting-firms/:id`   | Get one firm        |
| `POST`   | `/recruiting-firms`       | Create firm         |
| `PATCH`  | `/recruiting-firms/:id`   | Update firm         |
| `DELETE` | `/recruiting-firms/:id`   | Delete firm         |

Error responses use the shape `{ error: { message: string } }`.

**CSRF:** For `POST`, `PATCH`, `PUT`, and `DELETE`, send the header `X-Requested-With: XMLHttpRequest` (or any value). Requests without it receive 403.

## Integration tests (guidance)

Unit tests mock the DB and handlers; integration tests run the full stack (Express + repos + PostgreSQL).

**Setup**

- Use a **separate test database** (e.g. a Neon branch or a local `my_little_server_test`). Set `DATABASE_URL` (or a dedicated `TEST_DATABASE_URL`) so integration tests never touch dev/prod data.
- Apply migrations before running: `npm run migrate:up` (or run migrations in test setup).
- Optionally add a Vitest project in `vitest.config.ts` that runs only `**/*.integration.test.ts` (or a `tests/integration/` folder) so you can run `npm run test` for units only and `npm run test:integration` for integration.

**What to test**

- **Happy paths**: e.g. `POST /jobs` with valid body → 201 and the created job in the response; `GET /jobs/:id` returns it; `PATCH`/`DELETE` behave as expected. Same idea for recruiters and recruiting firms.
- **Validation**: invalid body or `:id` → 400; non-existent `:id` for GET/PATCH/DELETE → 404.
- **Pagination**: `GET /jobs?limit=2&offset=1` returns the correct slice.

**Structure**

- Create the Express app (or import it) in the test file or a shared setup; do **not** call `app.listen()` if you use supertest (supertest calls the app internally).
- Use **supertest** with the app: `request(app).get('/jobs').expect(200)`.
- Seed data only when needed (e.g. create a job then GET/PATCH/DELETE it); avoid relying on existing dev data.
- Clean up created rows in `afterEach`/`afterAll` if you care about repeatability, or use a fresh DB/branch per run.

**CI**

- In CI, set `DATABASE_URL` (or `TEST_DATABASE_URL`) to a dedicated test DB and run migrations before `npm run test:integration`. Keep the test DB small and short-lived if possible (e.g. Neon branch that gets reset or dropped after the run).
