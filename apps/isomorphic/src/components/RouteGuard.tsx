'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { usePermissions, PermissionResource, PermissionAction } from '@/hooks/queries/usePermissions';
import AccessDeniedPage from '@/app/shared/access-denied';

interface RouteGuardProps {
  children: React.ReactNode;
  /**
   * Resources required to access this route (ANY match grants access)
   */
  resources: (PermissionResource | string)[];
  /**
   * Action required for the resources
   */
  action: PermissionAction | string;
}

/**
 * Simplified route guard that renders AccessDeniedPage instead of redirecting
 * Automatically uses current pathname for permission checks
 * 
 * @example
 * ```tsx
 * // Protects the current route, shows AccessDenied if no permission
 * <RouteGuard 
 *   resources={[PermissionResource.PRODUCTS]} 
 *   action={PermissionAction.READ}
 * >
 *   <ProductsPage />
 * </RouteGuard>
 * ```
 */
export function RouteGuard({ 
  children, 
  resources, 
  action, 
}: RouteGuardProps) {
  const pathname = usePathname();
  const { hasPermission, isLoading } = usePermissions();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAccess = () => {
      // Wait for permissions to load
      if (isLoading) {
        setHasAccess(null);
        return;
      }

      // Check if user has required permissions
      const permitted = hasPermission(resources, action);

      if (!permitted) {
        console.warn(`[RouteGuard] Access denied to ${pathname}. Required:`, {
          resources,
          action,
        });
      }

      setHasAccess(permitted);
    };

    checkAccess();
  }, [pathname, isLoading, hasPermission, resources, action]);

  // Show loading state while checking permissions
  if (isLoading || hasAccess === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
          <p className="text-sm text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Show access denied page if no permission
  if (!hasAccess) {
    return <AccessDeniedPage />;
  }

  // Render children if access granted
  return <>{children}</>;
}