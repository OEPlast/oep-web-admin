/**
 * CDN URL utilities
 * Constructs full CDN URLs from relative paths
 *
 * Base URL is read from `NEXT_PUBLIC_CDN_BASE_URL` (client-visible — this is called from
 * Client Components too) with the historical value as the fallback — mirrors
 * `shared/emails/src/cdn-url.ts` and storefront's `libs/cdn-url.ts`.
 */

function resolveCdnBaseUrl(): string {
  const configured = (process.env.NEXT_PUBLIC_CDN_BASE_URL ?? '').trim();
  const base = configured.length > 0 ? configured : 'https://oeptest.b-cdn.net/';
  return base.endsWith('/') ? base : `${base}/`;
}

const CDN_BASE_URL = resolveCdnBaseUrl();

/**
 * Constructs full CDN URL from a relative path
 * @param path - Relative path from upload response (e.g., "reviews/c140fb28-...")
 * @returns Full CDN URL or original if already a full URL
 */
export function getCdnUrl(path: string | undefined | null): string {
  if (!path) return '';
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Construct full CDN URL
  return `${CDN_BASE_URL}${cleanPath}`;
}

/**
 * Get CDN base URL
 */
export function getCdnBaseUrl(): string {
  return CDN_BASE_URL;
}

/**
 * Check if a URL is a CDN URL
 */
export function isCdnUrl(url: string): boolean {
  return url.startsWith(CDN_BASE_URL);
}

/**
 * Extract path from CDN URL
 * @param url - Full CDN URL
 * @returns Relative path
 */
export function extractPathFromCdnUrl(url: string): string {
  if (url.startsWith(CDN_BASE_URL)) {
    return url.slice(CDN_BASE_URL.length);
  }
  return url;
}
