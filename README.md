# Secure Task Manager — Overview

This repository contains a demo Secure Task Manager (MERN-style) implementing:

- Authentication with JWT stored in an `httpOnly` cookie (backend).
- Role-based access control (users and admins).
- Task CRUD (create/list/update/delete) with `createdAt`, `updatedAt`, `createdBy`, `updatedBy` metadata.
- DEV_IN_MEMORY fallback so reviewers can run the app locally without MongoDB or Redis.
- A minimal React (plain JS) frontend that uses `axios` with `withCredentials` to use the httpOnly cookie.

## Repository layout

- `backend/` — Express backend and API server.
- `frontend/` — React frontend (plain JavaScript) served by the dev server for local testing.
- `docs/` — Postman collection and usage guide for the API.
- `backend/.env.example` and `frontend/.env.example` — example environment variables.

## Quick Start (recommended)

### 1) Start the backend (in-memory/demo mode — no Mongo/Redis required):

```powershell
cd 'f:/New folder/backend'
$env:DEV_IN_MEMORY='1'
npm install
npm start
```

The backend will listen on `http://localhost:5000` by default and expose the API under `/api/v1`.

### 2) Start the frontend:

```powershell
cd 'f:/New folder/frontend'
npm install
npm start
```

The frontend dev server runs on `http://localhost:3000` by default (change with `PORT`). It is configured to call the backend API at `REACT_APP_API_BASE` (see `frontend/.env.example`).

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for recommended values.

Important backend vars:

- `JWT_SECRET` — set a secure secret for production.
- `DEV_IN_MEMORY` — set to `1` to run without Mongo/Redis.
- `CACHE_MAX`, `CACHE_TTL` — LRU cache settings when running in-memory.

## API testing (Postman)

1. Import the collection: `docs/postman_collection.json` into Postman.
2. Call `Auth / Register` then `Auth / Login` — Postman will retain cookies automatically.
3. Use `Tasks / Create Task`, then `Tasks / List Tasks` to get a task `_id`, then run `Tasks / Update Task` and `Tasks / Delete Task` (replace `:id` in the request URL with the returned `_id`).

## Demo accounts

Use these demo credentials for quick access during review (register these users locally if running in `DEV_IN_MEMORY` mode):

- Admin
	- Email: `admin@gmail.com`
	- Password: `admin@123`

- Users
	- Email: `user1@gmail.com` — Password: `user1@123`
	- Email: `user2@gmail.com` — Password: `user2@123`

If the demo users are not present in the in-memory store, register the emails above or promote a registered user to admin as described in the "Promoting a user to `admin`" section.

## PowerShell testing note

If you use PowerShell to test the API, preserve httpOnly cookies by using a persistent `WebRequestSession` when calling the auth endpoints. For example, use `Invoke-RestMethod` with `-WebSession` and run the Register/Login/Create/List/Update/Delete requests in sequence. Alternatively, import the Postman collection in `docs/` and run requests there.

## Promoting a user to `admin` (demo/in-memory mode)

If you're running with `DEV_IN_MEMORY=1`, the backend stores users in an in-memory array at `backend/src/config/inMemoryStore.js`.

Quick options to make a user an admin:

- Edit `backend/src/config/inMemoryStore.js` temporarily: add a `role: 'admin'` when creating the user or find the `users` array and set the role for the desired user, then restart the backend.
- If running with a real MongoDB instance, update the user's document in the `users` collection (e.g., via `mongo` shell or Compass) and set `role: 'admin'`.

## Security & production notes

- Cookies: the JWT is stored in an `httpOnly` cookie named `token`. In production the cookie is set with `secure: true` (TLS required) and `sameSite` set to `lax` by default — review for your deployment needs.
- Use a managed MongoDB and Redis in production. The in-process LRU cache is only for demos and small-scale testing.
- Run multiple backend instances behind a load balancer and use centralized storage for sessions and cache in production.

## Postman collection and tests

- `docs/postman_collection.json` includes requests for all auth and tasks endpoints. `docs/README_postman.md` contains usage details and small test snippets you can copy into Postman `Tests` tabs.

## Submission checklist (what reviewers will verify)

- Backend runs in `DEV_IN_MEMORY=1` mode with no external DB required.
- `token` cookie is `httpOnly` and frontend uses `withCredentials`.
- Task endpoints return `createdAt`, `updatedAt`, `createdBy`, and `updatedBy` metadata.
- Admin can edit any task but cannot delete tasks owned by others; owners can delete their own tasks.
- `backend/.env.example`, `frontend/.env.example`, and `docs/postman_collection.json` are present.


Quick Start (local demo)

1) Backend (in-memory/demo)

```powershell
cd 'f:/New folder/backend'
$env:DEV_IN_MEMORY='1'
npm install
npm start
```

2) Frontend

```powershell
cd 'f:/New folder/frontend'
npm install
npm start
```

Postman

Import `docs/postman_collection.json` and use the provided requests to exercise auth and tasks endpoints. Ensure cookies are preserved for protected requests.
