'use client';

import { Control, FieldErrors } from 'react-hook-form';
import { FormLabelWithTooltip } from '@core/ui/form-label-with-tooltip';
import { CreateCampaignInput } from '@/validators/create-campaign.schema';
import { DatePicker } from '@core/ui/datepicker';
import { Controller } from 'react-hook-form';
import { Text } from 'rizzui';

interface CampaignDatesFormProps {
  control: Control<CreateCampaignInput>;
  errors: FieldErrors<CreateCampaignInput>;
}

export default function CampaignDatesForm({
  control,
  errors,
}: CampaignDatesFormProps) {
  return (
    <div className="space-y-5">
      <Text className="text-sm text-gray-600">
        Optional: Set a specific time frame for this campaign. Both dates must
        be provided together.
      </Text>

      <div className="grid gap-5 @lg:grid-cols-2">
        {/* Start Date */}
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <div>
              <FormLabelWithTooltip
                label="Start Date"
                tooltip="When this campaign becomes active and visible to customers."
              />
              <DatePicker
                selected={field.value}
                onChange={field.onChange}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select start date"
                inputProps={{
                  placeholder: 'Select start date',
                }}
                className="w-full"
              />
              {errors.startDate && (
                <Text className="mt-1 text-sm text-red-500">
                  {errors.startDate.message}
                </Text>
              )}
            </div>
          )}
        />

        {/* End Date */}
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <div>
              <FormLabelWithTooltip
                label="End Date"
                tooltip="When this campaign expires and is no longer visible to customers."
              />
              <DatePicker
                selected={field.value}
                onChange={field.onChange}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select end date"
                inputProps={{
                  placeholder: 'Select end date',
                }}
                className="w-full"
              />
              {errors.endDate && (
                <Text className="mt-1 text-sm text-red-500">
                  {errors.endDate.message}
                </Text>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}
