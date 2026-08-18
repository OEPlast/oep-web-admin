/**
 * Store branding (currently just `storeName`), fetched once from Main-server and cached
 * indefinitely by Next.js's Data Cache — no time-based revalidation. Only busted on-demand by
 * `/api/revalidate-branding`, called by Main-server the moment Settings are saved.
 *
 * This is deliberately a separate, server-only fetch rather than the existing
 * `hooks/queries/useStoreSettings` — that hook is client-side React Query and can't run inside
 * server-only `generateMetadata`.
 *
 * Falls back to `NEXT_PUBLIC_STORE_NAME` on any failure — a generic title beats a broken page.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const FALLBACK_STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Rawura';

export async function getStoreName(): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/settings/branding`, {
      next: { tags: ['branding'] },
    });

    if (!response.ok) return FALLBACK_STORE_NAME;

    const json = (await response.json()) as { data?: { storeName?: string } };
    const storeName = json?.data?.storeName;

    return typeof storeName === 'string' && storeName.trim() ? storeName : FALLBACK_STORE_NAME;
  } catch {
    return FALLBACK_STORE_NAME;
  }
}
