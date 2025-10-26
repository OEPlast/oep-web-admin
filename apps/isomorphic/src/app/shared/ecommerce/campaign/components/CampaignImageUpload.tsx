'use client';

import {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { FormLabelWithTooltip } from '@core/ui/form-label-with-tooltip';
import { CreateCampaignInput } from '@/validators/create-campaign.schema';
import { PiXBold } from 'react-icons/pi';
import { Button, Text } from 'rizzui';
import UploadZone from '@core/ui/file-upload/upload-zone';
import Image from 'next/image';
import { Controller } from 'react-hook-form';
import { getCdnUrl } from '@core/utils/cdn-url';

interface CampaignImageUploadProps {
  control: Control<CreateCampaignInput>;
  setValue: UseFormSetValue<CreateCampaignInput>;
  watch: UseFormWatch<CreateCampaignInput>;
  errors: FieldErrors<CreateCampaignInput>;
  getValues: UseFormGetValues<CreateCampaignInput>;
}

export default function CampaignImageUpload({
  control,
  setValue,
  getValues,
  watch,
  errors,
}: CampaignImageUploadProps) {
  const imageValue = watch('image');

  const handleRemoveImage = () => {
    setValue('image', '');
  };

  return (
    <div className="space-y-3">
      <FormLabelWithTooltip
        label="Campaign Image"
        tooltip="Upload a banner image for this campaign. Recommended size: 1200x400px. JPG or PNG format."
        required
      />

      {!imageValue ? (
        <Controller
          name="image"
          control={control}
          render={({ field }) => (
            <UploadZone
              name="image"
              getValues={getValues}
              setValue={setValue}
              label="Upload Campaign Image"
            />
          )}
        />
      ) : (
        <div className="relative overflow-hidden rounded-lg border border-gray-200">
          <img
            src={getCdnUrl(imageValue)}
            alt="Campaign"
            width={800}
            height={300}
            className="h-auto w-full object-cover"
          />
          <Button
            type="button"
            onClick={handleRemoveImage}
            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-white p-0 shadow-md hover:bg-red-50"
            variant="flat"
          >
            <PiXBold className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )}

      {errors.image && (
        <Text className="text-sm text-red-500">{errors.image.message}</Text>
      )}
    </div>
  );
}
