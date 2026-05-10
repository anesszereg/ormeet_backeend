/**
 * Base URL for the front-end Vite app (where users are sent for login,
 * search, event detail pages, etc.). Override in production with the
 * env var `NEXT_PUBLIC_APP_URL`.
 */
export const FRONTEND_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173";

/**
 * Base URL for the NestJS backend API. Override with
 * `NEXT_PUBLIC_API_URL` (e.g. https://ormeet-backeend.onrender.com).
 */
export const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
