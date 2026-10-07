/**
 * Application Configuration
 *
 * In production (e.g. Vercel same-origin deployment), API_BASE_URL defaults to "/api".
 * In local development, defaults to "http://localhost:8000" if NEXT_PUBLIC_API_URL is unset.
 */
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:8000");
