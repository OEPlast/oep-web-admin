'use client';

import { useState } from 'react';
import { PiXBold } from 'react-icons/pi';
import { Controller, SubmitHandler } from 'react-hook-form';
import { Form } from '@core/ui/form';
import { ActionIcon, Title, Button, Text, RadioGroup, Radio } from 'rizzui';
import {
  ChangeUserTypeInput,
  changeUserTypeSchema,
} from '@/validators/edit-role.schema';
import { useModal } from '@/app/shared/modal-views/use-modal';
import { userTypeOptions } from '@/types/roles-permissions.types';
import { useChangeUserRole } from '@/hooks/use-role-management';

interface ChangeUserTypeProps {
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'user' | 'employee';
  };
}

export default function ChangeUserType({ user }: ChangeUserTypeProps) {
  const { closeModal } = useModal();
  const changeUserRoleMutation = useChangeUserRole();

  const onSubmit: SubmitHandler<ChangeUserTypeInput> = async (data) => {
    try {
      await changeUserRoleMutation.mutateAsync({
        userId: user._id,
        role: data.role,
      });
      closeModal();
    } catch (error) {
      console.error('Error changing user type:', error);
    }
  };

  return (
    <Form<ChangeUserTypeInput>
      onSubmit={onSubmit}
      validationSchema={changeUserTypeSchema}
      useFormProps={{
        defaultValues: {
          userId: user._id,
          role: user.role,
        },
      }}
      className="flex flex-grow flex-col gap-6 p-6 @container [&_.rizzui-input-label]:font-medium [&_.rizzui-input-label]:text-gray-900"
    >
      {({ register, control, formState: { errors } }) => (
        <>
          <div className="flex items-center justify-between">
            <Title as="h4" className="font-semibold">
              Change User Type
            </Title>
            <ActionIcon size="sm" variant="text" onClick={closeModal}>
              <PiXBold className="h-auto w-5" />
            </ActionIcon>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <Text className="mb-1 text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </Text>
            <Text className="text-sm text-gray-600">{user.email}</Text>
            <Text className="mt-2 text-xs text-gray-500">
              Current role:{' '}
              <span className="font-medium capitalize">{user.role}</span>
            </Text>
          </div>

          <div className="space-y-3">
            <Title as="h6" className="text-sm font-medium text-gray-900">
              Select New Role
            </Title>
            <Controller
              name="role"
              control={control}
              render={({ field: { onChange, value } }) => (
                <RadioGroup
                  value={value}
                  setValue={onChange}
                  className="space-y-3"
                >
                  {userTypeOptions.map((option) => (
                    <Radio
                      key={option.value}
                      value={option.value}
                      label={
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {option.label}
                          </span>
                          <span className="text-sm text-gray-500">
                            {option.description}
                          </span>
                        </div>
                      }
                      className="rounded-lg border border-gray-200 p-3 hover:border-gray-300"
                    />
                  ))}
                </RadioGroup>
              )}
            />
            {errors.role?.message && (
              <Text className="text-sm text-red-500">
                {errors.role.message}
              </Text>
            )}
          </div>

          <div className="flex items-center justify-end gap-4">
            <Button
              variant="outline"
              onClick={closeModal}
              className="w-full @xl:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={changeUserRoleMutation.isPending}
              className="w-full @xl:w-auto"
            >
              Update Role
            </Button>
          </div>
        </>
      )}
    </Form>
  );
}
