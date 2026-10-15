/**
 * Optional admin features, switched on per deployment with a comma-separated list:
 *
 *   NEXT_PUBLIC_STORE_FEATURES=vylux,content,support,pickup,stockAlerts,wholesale
 *
 * Unset means none (wholesale tiers excepted, see isWholesaleEnabled), so a deployment that doesn't list a feature keeps the admin exactly as it
 * was. The backend still enforces its own checks; this only decides what the admin shows.
 */
export type StoreFeature = 'vylux' | 'content' | 'support' | 'pickup' | 'stockAlerts' | 'wholesale' | 'collections';

// Referenced literally so Next.js inlines it into the client bundle at build time.
const enabled = new Set(
  (process.env.NEXT_PUBLIC_STORE_FEATURES ?? '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean)
);

export const hasFeature = (feature: StoreFeature): boolean => enabled.has(feature);

/**
 * Wholesale pricing tiers are the one feature that is on by default: deployments that predate
 * NEXT_PUBLIC_STORE_FEATURES (Rawura) use them. Once a deployment lists its features, tiers only
 * show when the list includes `wholesale`.
 */
export const isWholesaleEnabled = (): boolean =>
  !process.env.NEXT_PUBLIC_STORE_FEATURES || hasFeature('wholesale');
