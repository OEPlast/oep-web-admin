'use client';

import {
  Control,
  ControllerRenderProps,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';
import { Input, Select, Textarea } from 'rizzui';
import { FormLabelWithTooltip } from '@core/ui/form-label-with-tooltip';
import { CreateCampaignInput } from '@/validators/create-campaign.schema';
import { Controller } from 'react-hook-form';
import { useCheckCampaignSlug } from '@/hooks/queries/useCheckCampaignSlug';
import { Text } from 'rizzui';

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

interface CampaignInfoFormProps {
  register: UseFormRegister<CreateCampaignInput>;
  control: Control<CreateCampaignInput>;
  errors: FieldErrors<CreateCampaignInput>;
  excludeId?: string;
}

export default function CampaignInfoForm({
  register,
  control,
  errors,
  excludeId,
}: CampaignInfoFormProps) {
  // Slug live check - observe current slug value via a Controller
  return (
    <div className="space-y-5">
      {/* Slug */}
      <Controller
        name="slug"
        control={control}
        render={({ field }) => {
          const { data: availability, isFetching } = useCheckCampaignSlug(
            field.value || '',
            excludeId
          );
          return (
            <div>
              <Input
                label={
                  <FormLabelWithTooltip
                    label="Slug"
                    tooltip="Lowercase unique identifier shown in URLs. Only lowercase letters, numbers, and hyphens."
                    required
                  />
                }
                placeholder="e.g., summer-sale-2025"
                value={field.value || ''}
                onChange={(e) => field.onChange(e.target.value)}
                error={errors.slug?.message as string}
              />
              {field.value && !errors.slug && (
                <Text className="mt-1 text-xs">
                  {isFetching
                    ? 'Checking availability…'
                    : availability?.available
                      ? 'Slug is available'
                      : 'Slug is already in use'}
                </Text>
              )}
            </div>
          );
        }}
      />
      {/* Title */}
      <Input
        label={
          <FormLabelWithTooltip
            label="Campaign Title"
            tooltip="Enter a descriptive title for your campaign. This will be visible to customers."
            required
          />
        }
        placeholder="e.g., Summer Sale 2025"
        {...register('title')}
        error={errors.title?.message}
      />

      {/* Description */}
      <Textarea
        label={
          <FormLabelWithTooltip
            label="Description"
            tooltip="Provide additional details about the campaign. This helps customers understand the promotion."
          />
        }
        placeholder="Enter campaign description..."
        {...register('description')}
        error={errors.description?.message}
        rows={4}
      />

      {/* Status */}
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <Select
            label={
              <FormLabelWithTooltip
                label="Status"
                tooltip="Draft: Not visible to customers. Active: Campaign is live. Inactive: Campaign is paused."
              />
            }
            options={statusOptions}
            value={field.value}
            onChange={field.onChange}
            error={errors.status?.message as string}
            getOptionValue={(option) => option.value}
          />
        )}
      />
    </div>
  );
}
