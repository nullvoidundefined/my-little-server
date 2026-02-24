# my-little-server

REST API for tracking jobs, recruiters, and recruiting firms. Built with Express, TypeScript, and PostgreSQL.

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
| `npm run test`    | Run tests                     |
| `npm run test:coverage` | Run tests with coverage   |
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
