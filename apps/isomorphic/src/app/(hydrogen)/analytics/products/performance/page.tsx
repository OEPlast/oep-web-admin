import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductPerformanceClient from './performance-client';

export const metadata: Metadata = {
  title: 'Product Performance | OEPlast Admin',
  description: 'Full analytics for a single product',
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
