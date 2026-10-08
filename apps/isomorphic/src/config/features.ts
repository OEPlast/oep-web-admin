/**
 * Optional admin features, switched on per deployment with a comma-separated list:
 *
 *   NEXT_PUBLIC_STORE_FEATURES=vylux,content,support,pickup,stockAlerts
 *
 * Unset means none, so a deployment that doesn't list a feature keeps the admin exactly as it
 * was. The backend still enforces its own checks; this only decides what the admin shows.
 */
export type StoreFeature = 'vylux' | 'content' | 'support' | 'pickup' | 'stockAlerts';

// Referenced literally so Next.js inlines it into the client bundle at build time.
const enabled = new Set(
  (process.env.NEXT_PUBLIC_STORE_FEATURES ?? '')
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean)
);

export const hasFeature = (feature: StoreFeature): boolean => enabled.has(feature);
