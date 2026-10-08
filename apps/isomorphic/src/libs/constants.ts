import { hasFeature } from '@/config/features';

/**
 * Permission resources that only exist for optional features. Listed only when the deployment
 * enables the feature, so a deployment without them keeps the same role editor.
 */
export function featureRoleResources(): string[] {
  const extra: string[] = [];
  if (hasFeature('content')) extra.push('content');
  if (hasFeature('support') || hasFeature('stockAlerts')) extra.push('support');
  if (hasFeature('pickup')) extra.push('pickup');
  return extra;
}

export const ROLES_RESOURCES = [
  'products',
  'categories',
  'subcategories',
  'attributes',
  'inventory',
  'orders',
  'users',
  'roles',
  'sales',
  'coupons',
  'reviews',
  'campaigns',
  'banners',
  'gallery',
  'analytics',
  'invoices',
  'logistics',
  'transactions',
  'delivery',
  ...featureRoleResources(),
];

export const ROLE_ACTIONS = ['*', 'create', 'read', 'update', 'delete'];
