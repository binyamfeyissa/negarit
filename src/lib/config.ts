export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") ??
  "https://negarit-backend.onrender.com/api/v1";

// Backend origin (strips /api/v1 suffix)
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, "");

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

