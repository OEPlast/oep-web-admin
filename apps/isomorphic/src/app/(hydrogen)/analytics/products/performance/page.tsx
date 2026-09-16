import { Suspense } from 'react';
import ProductPerformanceClient from './performance-client';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Product Performance', undefined, 'Full analytics for a single product'),
};

export default function ProductPerformancePage() {
  // `useSearchParams` opts the tree into client rendering, which Next requires a
  // Suspense boundary for — without it the route fails to prerender.
  return (
    <Suspense>
      <ProductPerformanceClient />
    </Suspense>
  );
}
