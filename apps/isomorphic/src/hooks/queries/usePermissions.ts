'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';

/**
 * Permission resources - matches backend PermissionResource enum
 */
export enum PermissionResource {
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  SUBCATEGORIES = 'subcategories',
  ATTRIBUTES = 'attributes',
  INVENTORY = 'inventory',
  ORDERS = 'orders',
  USERS = 'users',
  ROLES = 'roles',
  SALES = 'sales',
  COUPONS = 'coupons',
  REVIEWS = 'reviews',
  CAMPAIGNS = 'campaigns',
  INTENTS = 'intents',
  BANNERS = 'banners',
  GALLERY = 'gallery',
  ANALYTICS = 'analytics',
  INVOICES = 'invoices',
  LOGISTICS = 'logistics',
  TRANSACTIONS = 'transactions',
  DELIVERY = 'delivery',
  SETTINGS = 'settings',
}

/**
 * Permission actions - matches backend PermissionAction enum
 */
export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  ALL = 'all',
  WILDCARD = '*',
}

/**
 * Permission structure for a role
 */
export interface RolePermission {
  resource: PermissionResource | string;
  actions: (PermissionAction | string)[];
}

/**
 * Role with permissions
 */
export interface UserRole {
  name: string;
  description: string;
  permissions: RolePermission[];
  isActive: boolean;
}

/**
 * User permissions response
 */
export interface UserPermissions {
  legacyRole: string;
  roles: UserRole[];
}

/**
 * React Query hook for fetching current user's permissions
 * 
 * @returns Query result with user permissions data and refresh function
 * 
 */
export const usePermissions = () => {
  const queryClient = useQueryClient();

  const query = useQuery<UserPermissions>({
    queryKey: ['userPermissions'],
    queryFn: async () => {
      const response = await apiClient.get<UserPermissions>(api.user.permissions);
      
      if (!response.data) {
        throw new Error('No permissions data returned');
      }
      
      return response.data;
    },
    placeholderData: { legacyRole: 'employee', roles: [] },
    staleTime: 10 * 60 * 1000, // 10 minutes - permissions don't change frequently
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 3,
  });

  /**
   * Refresh permissions data by invalidating the cache
   * Useful after role changes or permission updates
   */
  const refreshPermissions = () => {
    queryClient.invalidateQueries({ queryKey: ['userPermissions'] });
  };


/**
 * Helper function to check if user has a specific permission
 * 
 * @param permissions - User permissions object
 * @param resource - Permission resource (e.g., PermissionResource.PRODUCTS or 'products')
 * @param action - Permission action (e.g., PermissionAction.CREATE or 'create')
 * @returns true if user has the permission
 * 
 * @example
 * ```tsx
 * const { permissions } = usePermissions();
 * const canCreateProducts = hasPermission(permissions, PermissionResource.PRODUCTS, PermissionAction.CREATE);
 * // Or with strings:
 * const canCreateProducts = hasPermission(permissions, 'products', 'create');
 * ```
 */
const hasPermission = (
  resources: (PermissionResource | string)[],
  action: PermissionAction | string
): boolean => {
    
    const permissions = query.data;
  if (!permissions?.roles) return false;

  if(permissions.legacyRole === 'owner') return true;

  // Normalize to lowercase string for comparison
  for(const resource of resources) {
  const targetResource = typeof resource === 'string' ? resource.toLowerCase() : resource;
  const targetAction = typeof action === 'string' ? action.toLowerCase() : action;

  const hasPermissonInternal = permissions.roles.some((role) => {
    if (!role.isActive) return false;

    return role.permissions.some((perm) => {
      const permResource = perm.resource;
      
      // Check for exact resource match or wildcard
      const resourceMatch = permResource === targetResource || permResource === 'all';
      
      // Check for exact action match or wildcard
      const actionMatch = perm.actions.some(a => {
        const permAction = typeof a === 'string' ? a.toLowerCase() : a;
        return permAction === targetAction || permAction === 'all' || permAction === '*';
      });

      return resourceMatch && actionMatch;
    });
  });

  if(hasPermissonInternal) return true;
}
return false;
};

return {
    isLoading: query.isLoading || query.isFetching,
    permissions: query.data,
    refreshPermissions,
    hasPermission

  };
};

