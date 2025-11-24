# Secure Task Manager (MERN) - Assignment

This repository contains a modular monolith implementation of "Secure Task Manager".

Structure
- `backend/` - Node.js + Express API (MongoDB + Redis)
- `frontend/` - React (plain JS) frontend using Bootstrap and plain CSS

Quick Start (local dev)

1. Backend

```
cd backend
cp .env.example .env
npm install
npm run dev
```

2. Frontend

```
cd frontend
npm install
npm start
```

By default backend runs on `http://localhost:5000` and frontend on `http://localhost:3000`. The frontend sends requests with credentials included so cookies are used for auth.

Security & Scalability Notes
- JWT tokens stored in `httpOnly` cookies to prevent XSS access.
- Passwords hashed with `bcrypt`.
- Manual input validation + sanitization prevents injection and XSS.
- Redis used for caching task lists with TTL and invalidation on writes.
- Project follows modular structure (controllers, routes, middleware, utils) to allow horizontal scaling via stateless app servers behind a load balancer; sessions are stateless (JWT) so scaling is straightforward.

Optional improvements for production:
- Add rate-limiting, request size limits, and stricter CORS allowed origins.
- Use HTTPS + secure cookie flags and rotate JWT secrets.
- Add structured logging and monitoring (ELK or similar).
