'use client';

import { useState, useMemo } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Controller, SubmitHandler } from 'react-hook-form';
import { Form } from '@core/ui/form';
import { Input, Button, ActionIcon, Title, Select } from 'rizzui';
import {
  CreateUserInput,
  createUserSchema,
} from '@/validators/create-user.schema';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { useRoles, useAddUserAsEmployee } from '@/hooks/use-role-management';
import { userTypeOptions } from '@/types/roles-permissions.types';
import toast from 'react-hot-toast';

export default function CreateUser() {
  const { closeModal } = useModal();
  const [reset, setReset] = useState({});
  const { data: rolesData } = useRoles();
  const addUserAsEmployeeMutation = useAddUserAsEmployee();

  const roles = useMemo(
    () =>
      rolesData?.map((role) => ({
        label: role.name,
        value: role._id, // Use _id instead of name
      })) || [],
    [rolesData]
  );

  const onSubmit: SubmitHandler<CreateUserInput> = async (data) => {
    try {
      // Only add as employee if userType is 'employee'
      if (data.userType === 'employee') {
        await addUserAsEmployeeMutation.mutateAsync({
          email: data.email,
          roleIds: [data.role], // role is the role ID
        });
        toast.success('User added as employee successfully');
      } else {
        // For regular users, you might need a different endpoint
        toast('Regular user creation not yet implemented');
        return;
      }
      
      setReset({
        email: '',
        userType: 'user',
        role: '',
      });
      closeModal();
    } catch (error) {
      toast.error('Failed to create user');
      console.error('Error creating user:', error);
    }
  };

  return (
    <Form<CreateUserInput>
      resetValues={reset}
      onSubmit={onSubmit}
      validationSchema={createUserSchema}
      useFormProps={{
        defaultValues: {
          email: '',
          userType: 'user',
          role: '',
        },
      }}
      className="grid grid-cols-1 gap-6 p-6 @container md:grid-cols-2 [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, control, watch, formState: { errors } }) => {
        return (
          <>
            <div className="col-span-full flex items-center justify-between">
              <Title as="h4" className="font-semibold">
                Add a new User
              </Title>
              <ActionIcon size="sm" variant="text" onClick={closeModal}>
                <PiXBold className="h-auto w-5" />
              </ActionIcon>
            </div>

            <Input
              label="Email"
              placeholder="Enter user's Email Address"
              className="col-span-full"
              {...register('email')}
              error={errors.email?.message}
            />

            <Controller
              name="userType"
              control={control}
              render={({ field: { name, onChange, value } }) => (
                <Select
                  options={userTypeOptions}
                  value={value}
                  onChange={onChange}
                  name={name}
                  label="User Type"
                  placeholder="Select user type"
                  className="col-span-full"
                  error={errors?.userType?.message}
                  getOptionValue={(option: { value: string; label: string }) => option.value}
                  displayValue={(selected: string) =>
                    userTypeOptions.find((option: { value: string; label: string }) => option.value === selected)?.label ??
                    selected
                  }
                  dropdownClassName="!z-[1]"
                  inPortal={false}
                />
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field: { name, onChange, value } }) => (
                <Select
                  options={roles}
                  value={value}
                  onChange={onChange}
                  name={name}
                  label="Role"
                  className="col-span-full"
                  error={errors?.role?.message}
                  getOptionValue={(option: { value: string; label: string }) => option.value}
                  displayValue={(selected: string) =>
                    roles.find((option: { value: string; label: string }) => option.value === selected)?.label ??
                    selected
                  }
                  dropdownClassName="!z-[1]"
                  inPortal={false}
                />
              )}
            />

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
                isLoading={addUserAsEmployeeMutation.isPending}
                className="w-full @xl:w-auto"
              >
                Create User
              </Button>
            </div>
          </>
        );
      }}
    </Form>
  );
}
