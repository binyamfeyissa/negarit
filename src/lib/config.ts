// In the browser, route through the Next.js rewrite proxy (/negarit-api → backend)
// so that the backend's Set-Cookie is delivered on localhost:3000 (first-party).
// The server-side fallback uses the direct backend URL for SSR/build-time fetches.
export const API_BASE_URL =
  typeof window !== "undefined"
    ? "/negarit-api"
    : (process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "https://negarit-backend.onrender.com/api/v1");

const _DIRECT_BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ?? "https://negarit-backend.onrender.com/api/v1";

// Backend origin (strips /api/v1 suffix) — always the real backend URL for file links
export const BACKEND_ORIGIN = _DIRECT_BACKEND.replace(/\/api\/v1\/?$/, "");

/**
 * Converts a backend upload path to a full URL.
 * Handles:
 *   /uploads/resumes/file.pdf  → https://negarit-backend.onrender.com/uploads/resumes/file.pdf
 *   https://...                → returned unchanged
 *   null / undefined           → null
 */
export function fileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${BACKEND_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

