# Backend — Quick Reference

This folder contains the backend API for the assignment. The backend implements:

- User registration & login with password hashing and JWT authentication
- Role-based access (user / admin)
- CRUD APIs for tasks with `createdAt`, `updatedAt`, `createdBy`, `updatedBy`
- API versioning under `/api/v1`, input validation and error handling

Quick start (in-memory/demo)

```powershell
cd 'f:/New folder/backend'
$env:DEV_IN_MEMORY='1'
npm install
npm start
```

Configuration

See `backend/.env.example` for recommended environment variables. Key ones:

- `JWT_SECRET` — JWT signing secret
- `DEV_IN_MEMORY` — `1` to run without external DB
- `CACHE_MAX`, `CACHE_TTL` — in-process LRU cache settings

Postman

Import `docs/postman_collection.json` and use the collection requests to exercise the API. The collection contains Register, Login, Get Me, Create/List/Update/Delete Tasks.
