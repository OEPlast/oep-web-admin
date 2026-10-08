import { notFound } from 'next/navigation';
import { hasFeature, StoreFeature } from '@/config/features';

/** Renders its children only when the deployment enables `feature`; otherwise the page 404s. */
export default function FeatureGate({ feature, children }: { feature: StoreFeature; children: React.ReactNode }) {
  if (!hasFeature(feature)) notFound();
  return <>{children}</>;
}
