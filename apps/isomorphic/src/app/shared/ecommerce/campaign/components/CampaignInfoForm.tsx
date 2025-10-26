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

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

interface CampaignInfoFormProps {
  register: UseFormRegister<CreateCampaignInput>;
  control: Control<CreateCampaignInput>;
  errors: FieldErrors<CreateCampaignInput>;
}

export default function CampaignInfoForm({
  register,
  control,
  errors,
}: CampaignInfoFormProps) {
  return (
    <div className="space-y-5">
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
