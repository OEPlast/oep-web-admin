'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useStaffUser,
  useUserPermissions,
  useRoles,
  useEditUserRoles,
  useRevokeAdminAccess,
  type Role,
} from '@/hooks/use-role-management';
import {
  Title,
  Text,
  Button,
  Avatar,
  Badge,
  Loader,
} from 'rizzui';
import cn from '@core/utils/class-names';
import { PiArrowLeft, PiArrowsClockwise, PiUserMinus } from 'react-icons/pi';
import Link from 'next/link';
import EditRolesModal from './edit-roles-modal';
import toast from 'react-hot-toast';

interface UserDetailClientProps {
  userId: string;
}

export default function UserDetailClient({ userId }: UserDetailClientProps) {
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const revokeAccessMutation = useRevokeAdminAccess();

  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
    refetch: refetchUser,
  } = useStaffUser(userId);

  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissions,
  } = useUserPermissions(userId);

  const { data: allRoles } = useRoles();
console.log({allRoles});

  const isLoading = userLoading || permissionsLoading;
  const error = userError || permissionsError;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader variant="spinner" size="xl" />
        <Text className="mt-4 text-gray-600">Loading user details...</Text>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Text className="text-red-500 text-lg font-semibold mb-2">
          Error loading user details
        </Text>
        <Text className="text-gray-600 mb-4">
          {error instanceof Error ? error.message : 'User not found'}
        </Text>
        <Button
          onClick={() => {
            refetchUser();
            refetchPermissions();
          }}
          variant="outline"
          className="mt-2"
        >
          <PiArrowsClockwise className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  const userRoles = userData.roles || [];
  const permissions = permissionsData || [];

  const handleRevokeAccess = async () => {
    if (!window.confirm('Are you sure you want to revoke admin access for this user? They will be demoted to a regular user.')) {
      return;
    }

    try {
      await revokeAccessMutation.mutateAsync(userId);
      toast.success('Admin access revoked successfully');
      router.push('/roles-permissions');
    } catch (error) {
      toast.error('Failed to revoke admin access');
      console.error('Error revoking access:', error);
    }
  };

  return (
    <div className="@container">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/roles-permissions">
            <Button variant="outline" className="w-auto">
              <PiArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <Title as="h2" className="text-2xl font-bold">
            User Details
          </Title>
        </div>
        {userData.role === 'employee' && (
          <Button
            variant="outline"
            color="danger"
            onClick={handleRevokeAccess}
            isLoading={revokeAccessMutation.isPending}
          >
            <PiUserMinus className="mr-2 h-4 w-4" />
            Revoke Admin Access
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 @3xl:grid-cols-3">
        {/* User Info Card */}
        <div className="col-span-1 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col items-center p-6">
            <Avatar
              src="/avatar-placeholder.png"
              name={`${userData.firstName} ${userData.lastName}`}
              size="xl"
              className="mb-4"
            />
            <Title as="h3" className="text-xl font-semibold mb-1">
              {userData.firstName} {userData.lastName}
            </Title>
            <Text className="text-gray-600 mb-3">{userData.email}</Text>
            <Badge
              variant="flat"
              size="lg"
              color={
                userData.role === 'owner'
                  ? 'primary'
                  : userData.role === 'employee'
                  ? 'secondary'
                  : 'warning'
              }
              className="capitalize"
            >
              {userData.role}
            </Badge>
          </div>

          <div className="border-t border-gray-200 px-6 py-4">
            <div className="space-y-3">
              <div>
                <Text className="text-sm text-gray-500">Status</Text>
                <Badge
                  variant="flat"
                  color="success"
                >
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Roles and Permissions */}
        <div className="col-span-1 @3xl:col-span-2 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            {/* Roles Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Title as="h4" className="text-lg font-semibold">
                  Assigned Roles
                </Title>
                {userData.role === 'employee' && (
                  <Button
                    size="sm"
                    onClick={() => setShowEditModal(true)}
                    variant="outline"
                  >
                    Edit Roles
                  </Button>
                )}
              </div>

              {userRoles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userRoles.map((role) => (
                    <Badge
                      key={role._id}
                      variant="outline"
                      size="lg"
                      className="capitalize"
                    >
                      {role.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <Text className="text-gray-500 italic">No roles assigned</Text>
              )}
            </div>

            {/* Permissions Section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <Title as="h4" className="text-lg font-semibold">
                  Permissions
                </Title>
                <Badge variant="flat" size="lg">
                  {permissions.length} {permissions.length === 1 ? 'resource' : 'resources'}
                </Badge>
              </div>

              {permissions.length > 0 ? (
                <div className="space-y-3">
                  {permissions.map((perm, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <Text className="font-semibold capitalize mb-2">
                            {perm.resource.replace(/_/g, ' ')}
                          </Text>
                          <div className="flex flex-wrap gap-2">
                            {perm.actions.map((action, actionIndex) => (
                              <Badge
                                key={actionIndex}
                                variant="flat"
                                color="info"
                                size="sm"
                                className="capitalize"
                              >
                                {action === '*' ? 'All': action }
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                  <Text className="text-gray-500 italic">
                    No permissions assigned
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Roles Modal */}
      {showEditModal && allRoles && (
        <EditRolesModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          userId={userId}
          currentRoles={userRoles}
          allRoles={allRoles}
        />
      )}
    </div>
  );
}
