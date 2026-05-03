/**
 * Flask backend origin (no trailing slash).
 * Production: set NEXT_PUBLIC_API_URL in Vercel / .env.local, e.g. https://fyp-1xcl.onrender.com
 */
export function getBackendBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000").trim().replace(/\/+$/, "");
}

/** Absolute URL for an API path (path must start with `/`, e.g. `/api/login`). */
export function backendUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendBaseUrl()}${p}`;
}
