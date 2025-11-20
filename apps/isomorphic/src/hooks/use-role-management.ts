/**
 * TanStack Query hooks for Role Management
 * All API calls using apiClient are defined directly in this file
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/libs/axios';
import { api } from '@/libs/endpoints';

// TypeScript Interfaces
export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Array<{
    resource: string;
    actions: string[];
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRolePayload {
  name: string;
  description?: string;
  permissions?: Array<{
    resource: string;
    actions: string[];
  }>;
}

export interface UpdateRolePayload extends CreateRolePayload {}

export interface StaffUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'employee' | 'owner';
  roles?: Role[];
  image?: string;
  joinedAt: string;
  emailVerified?: string;
  suspended: boolean;
  orderCount: number;
  totalSpent: number;
  permissionCount?: number;
}

export interface StaffListResponse {
  users: StaffUser[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface AssignRolePayload {
  roleIds: string[];
}

// Query Keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...roleKeys.lists(), { filters }] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...staffKeys.lists(), { filters }] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
  permissions: (id: string) =>
    [...staffKeys.detail(id), 'permissions'] as const,
};

// ====================
// API Functions
// ====================

async function getAllRoles(): Promise<Role[]> {
  const response = await apiClient.get<Role[]>(api.roles.list);
  return response.data || [];
}

async function getRoleById(roleId: string): Promise<Role> {
  const response = await apiClient.get<Role>(api.roles.byId(roleId));
  return response.data!;
}

async function createRole(payload: CreateRolePayload): Promise<Role> {
  const response = await apiClient.post<Role>(api.roles.create, payload);
  return response.data!;
}

async function updateRole(
  roleId: string,
  payload: UpdateRolePayload
): Promise<Role> {
  const response = await apiClient.put<Role>(api.roles.update(roleId), payload);
  return response.data!;
}

async function deleteRole(roleId: string): Promise<void> {
  await apiClient.delete(api.roles.delete(roleId));
}

async function toggleRoleStatus(roleId: string): Promise<Role> {
  const response = await apiClient.patch<Role>(api.roles.toggleStatus(roleId));
  return response.data!;
}

async function getStaff(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'employee' | 'owner';
  sortBy?: string;
  order?: 'asc' | 'desc';
}): Promise<StaffListResponse> {
  const response = await apiClient.get<StaffListResponse>(api.staff.list, {
    params,
  });
  return response.data!;
}

async function getStaffUserById(userId: string): Promise<{
  roles: Role[];
  role: string;
  email: string;
  firstName: string;
  lastName: string;
}> {
  const response = await apiClient.get<any>(api.staff.userRoles(userId));
  // Backend sometimes returns { message, data: { ... } } or the payload directly.
  const payload = response?.data?.data ?? response?.data ?? {};

  // Support legacy naming (legacyRole) and normalize to `role`.
  const role = payload.role ?? payload.legacyRole ?? 'user';
  const roles = (payload.roles ?? payload.roles_list ?? []) as Role[];

  return {
    roles,
    role,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
  };
}

async function changeUserRole(
  userId: string,
  role: 'user' | 'employee'
): Promise<StaffUser> {
  const response = await apiClient.put<StaffUser>(
    api.staff.changeRole(userId),
    { role }
  );
  return response.data!;
}

async function assignRoleToUser(
  userId: string,
  payload: AssignRolePayload
): Promise<StaffUser> {
  const response = await apiClient.post<StaffUser>(
    api.staff.assignRoles(userId),
    payload
  );
  return response.data!;
}

async function editUserRoles(
  userId: string,
  payload: AssignRolePayload
): Promise<StaffUser> {
  const response = await apiClient.put<StaffUser>(
    api.staff.editRoles(userId),
    payload
  );
  return response.data!;
}

async function getUserPermissions(userId: string): Promise<Array<{ resource: string; actions: string[] }>> {
  try {
    const response = await apiClient.get<{ resource: string; actions: string[]
    }[]>(api.staff.permissions(userId));
    if(!response.data) {
      throw new Error('No data received');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return [];
  }
}

async function suspendUser(userId: string): Promise<void> {
  await apiClient.put(api.staff.suspend(userId));
}

async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(api.staff.delete(userId));
}

async function addUserAsEmployee(
  email: string,
  roleIds: string[]
): Promise<StaffUser> {
  const response = await apiClient.post<StaffUser>(api.staff.addEmployee, {
    email,
    roleIds,
  });
  return response.data!;
}

async function revokeAdminAccess(userId: string): Promise<StaffUser> {
  const response = await apiClient.delete<StaffUser>(
    api.staff.revokeAccess(userId)
  );
  return response.data!;
}

async function getUserRolesList(userId: string): Promise<{
  roles: Role[];
  role: string;
  email: string;
  firstName: string;
  lastName: string;
}> {
  const response = await apiClient.get<any>(api.staff.userRoles(userId));
  const payload = response?.data?.data ?? response?.data ?? {};

  const role = payload.role ?? payload.legacyRole ?? 'user';
  const roles = (payload.roles ?? []) as Role[];

  return {
    roles,
    role,
    email: payload.email,
    firstName: payload.firstName,
    lastName: payload.lastName,
  };
}

// ====================
// React Query Hooks
// ====================

// Role Queries
export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: getAllRoles,
  });
}

export function useRole(roleId: string) {
  return useQuery({
    queryKey: roleKeys.detail(roleId),
    queryFn: () => getRoleById(roleId),
    enabled: !!roleId,
  });
}

// Role Mutations
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string;
      payload: UpdateRolePayload;
    }) => updateRole(roleId, payload),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

export function useToggleRoleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => toggleRoleStatus(roleId),
    onSuccess: (_, roleId) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(roleId) });
    },
  });
}

// Staff Queries
export function useStaff(params?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: 'employee' | 'owner';
  sortBy?: string;
  order?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: staffKeys.list(params || {}),
    queryFn: () => getStaff(params),
  });
}

export function useStaffUser(userId: string) {
  return useQuery({
    queryKey: staffKeys.detail(userId),
    queryFn: () => getStaffUserById(userId),
    enabled: !!userId,
  });
}

export function useUserPermissions(userId: string) {  
  return useQuery({
    queryKey: staffKeys.permissions(userId),
    queryFn: () => getUserPermissions(userId),
    placeholderData: [],
    enabled: !!userId,
  });
}

// Staff Mutations
export function useChangeUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
    }: {
      userId: string;
      role: 'user' | 'employee';
    }) => changeUserRole(userId, role),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(userId) });
      queryClient.invalidateQueries({
        queryKey: staffKeys.permissions(userId),
      });
    },
  });
}

export function useAssignRoleToUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: AssignRolePayload;
    }) => assignRoleToUser(userId, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(userId) });
      queryClient.invalidateQueries({
        queryKey: staffKeys.permissions(userId),
      });
    },
  });
}

export function useEditUserRoles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: AssignRolePayload;
    }) => editUserRoles(userId, payload),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(userId) });
      queryClient.invalidateQueries({
        queryKey: staffKeys.permissions(userId),
      });
    },
  });
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => suspendUser(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(userId) });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}

export function useAddUserAsEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, roleIds }: { email: string; roleIds: string[] }) =>
      addUserAsEmployee(email, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}

export function useRevokeAdminAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => revokeAdminAccess(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(userId) });
      queryClient.invalidateQueries({
        queryKey: staffKeys.permissions(userId),
      });
    },
  });
}

export function useGetUserRoles(userId: string) {
  return useQuery({
    queryKey: staffKeys.detail(userId),
    queryFn: () => getUserRolesList(userId),
    enabled: !!userId,
  });
}
