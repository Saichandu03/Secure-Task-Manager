# Frontend — Quick Reference

This folder contains the React (plain JS) frontend used to exercise the API. It provides UI to register, log in, view a protected dashboard, and perform CRUD actions on tasks.

Quick start

```powershell
cd 'f:/New folder/frontend'
npm install
npm start
```

Configuration

- Use `REACT_APP_API_BASE` to point the frontend to the backend API (see `frontend/.env.example`).

Notes

- The frontend sends credentials (httpOnly cookie) using the API client configured with `withCredentials: true`.
- Ensure the backend is running before using the frontend.
