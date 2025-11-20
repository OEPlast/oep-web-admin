'use client';

import { useState } from 'react';
import { PiCheckBold, PiXBold } from 'react-icons/pi';
import { Controller, SubmitHandler } from 'react-hook-form';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useUpdateRole } from '@/hooks/use-role-management';
import {
  ActionIcon,
  AdvancedCheckbox,
  Title,
  Button,
  CheckboxGroup,
  Input,
  Textarea,
} from 'rizzui';
import { Form } from '@core/ui/form';
import { EditRoleInput, editRoleSchema } from '@/validators/edit-role.schema';
import { ROLE_ACTIONS, ROLES_RESOURCES } from '@/libs/constants';

interface EditRoleProps {
  role?: {
    _id: string;
    name: string;
    description?: string;
    permissions?: Array<{
      resource: string;
      actions: string[];
    }>;
  };
}

export default function EditRole({ role }: EditRoleProps) {
  const { closeModal } = useModal();
  const updateRoleMutation = useUpdateRole();

  // Transform permissions to flat structure for checkboxes
  const initialPermissions: Record<string, string[]> = {};
  role?.permissions?.forEach(({ resource, actions }) => {
    initialPermissions[resource] = actions;
  });

  const [selectedPermissions, setSelectedPermissions] =
    useState<Record<string, string[]>>(initialPermissions);

  const onSubmit: SubmitHandler<EditRoleInput> = async (data) => {
    if (!role?._id) return;

    // Transform selectedPermissions to backend format
    const permissions = Object.entries(selectedPermissions)
      .filter(([_, actions]) => actions.length > 0)
      .map(([resource, actions]) => ({
        resource,
        actions,
      }));

    const payload = {
      ...data,
      permissions,
    };

    try {
      await updateRoleMutation.mutateAsync({ roleId: role._id, payload });
      closeModal();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handlePermissionChange = (resource: string, actions: string[]) => {
    // If '*' is selected, remove all other actions
    if (actions.includes('*')) {
      const wasAllSelected = selectedPermissions[resource]?.includes('*');
      // If '*' was already selected, keep the new selection without '*'
      if (wasAllSelected) {
        setSelectedPermissions((prev) => ({
          ...prev,
          [resource]: actions.filter((a) => a !== '*'),
        }));
      } else {
        // '*' is newly selected, only keep '*'
        setSelectedPermissions((prev) => ({
          ...prev,
          [resource]: ['*'],
        }));
      }
    } else {
      // No '*' in selection, set as is
      setSelectedPermissions((prev) => ({
        ...prev,
        [resource]: actions,
      }));
    }
  };

  return (
    <Form<EditRoleInput>
      onSubmit={onSubmit}
      validationSchema={editRoleSchema}
      useFormProps={{
        defaultValues: {
          name: role?.name || '',
          description: role?.description || '',
        },
      }}
      className="grid grid-cols-1 gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, control, formState: { errors } }) => (
        <>
          <div className="col-span-full flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              Edit Role
            </Title>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>

          <Input
            label="Role Name"
            placeholder="e.g., Content Manager"
            {...register('name')}
            error={errors.name?.message}
          />

          <Textarea
            label="Description"
            placeholder="Describe the role and its responsibilities..."
            {...register('description')}
            error={errors.description?.message}
            textareaClassName="h-20"
          />

          <div className="space-y-4">
            <Title as="h5" className="text-base font-semibold">
              Permissions
            </Title>
            <div className="max-h-[400px] space-y-3 overflow-y-auto rounded-lg border border-gray-200 p-4">
              {ROLES_RESOURCES.map((resource) => (
                <div
                  key={resource}
                  className="flex flex-col gap-2 border-b border-gray-100 pb-3 last:border-b-0 md:flex-row md:items-center md:justify-between"
                >
                  <Title
                    as="h6"
                    className="min-w-[140px] text-sm font-medium capitalize text-gray-700"
                  >
                    {resource.replace(/_/g, ' ')}
                  </Title>
                  <CheckboxGroup
                    values={selectedPermissions[resource] || []}
                    setValues={(actions) =>
                      handlePermissionChange(resource, actions as string[])
                    }
                    className="flex flex-wrap gap-2"
                  >
                    {ROLE_ACTIONS.map((action) => (
                      <AdvancedCheckbox
                        key={action}
                        name={`${resource}.${action}`}
                        value={action}
                        inputClassName="[&:checked~span>.icon]:block"
                        contentClassName="flex items-center justify-center"
                      >
                        <PiCheckBold className="icon me-1 hidden h-3 w-3" />
                        <span className="text-sm font-medium capitalize">
                          {action === '*' ? 'All' : action}
                        </span>
                      </AdvancedCheckbox>
                    ))}
                  </CheckboxGroup>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-full flex items-center justify-end gap-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="w-full @xl:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={updateRoleMutation.isPending}
              className="w-full @xl:w-auto"
            >
              Save Changes
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
