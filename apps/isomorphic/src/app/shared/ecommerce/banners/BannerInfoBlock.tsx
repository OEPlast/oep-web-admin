'use client';
import { CreateBannerFormInput } from '@/validators/create-banner.schema';
import { useState, useEffect, useRef } from 'react';
import HorizontalFormBlockWrapper from '@/app/shared/HorizontalFormBlockWrapper';
import UploadZone, { FileType } from '@core/ui/file-upload/upload-zone';
import { PiTrashBold } from 'react-icons/pi';
import { Text } from 'rizzui';
import { getCdnUrl } from '@core/utils/cdn-url';

type BannerImageBlockProps = {
  imageUrl: string;
  setValue: (name: keyof CreateBannerFormInput, value: string) => void;
  getValues: (name: string) => any;
  error?: string | undefined;
};

export const BannerImageBlock: React.FC<BannerImageBlockProps> = ({
  imageUrl,
  error,
  setValue,
  getValues,
}) => {
  const [localImageUrl, setLocalImageUrl] = useState(() => getCdnUrl(imageUrl) || '');

  const removeLocalImage = () => {
    setLocalImageUrl('');
    setValue('imageUrl', '');
  }
  return (
    <HorizontalFormBlockWrapper
      title="Banner Image"
      description="Your banner image here"
      isModalView={true}
    >
      {localImageUrl ? (
        <div className="col-span-full">
          <div className="relative">
            <figure className="group relative h-40 w-full max-w-sm rounded-md bg-gray-50">
               <img
                src={localImageUrl}
                alt="Banner preview"
                className="h-full w-full rounded-md object-contain"
              /> 
              <button
                type="button"
                className="absolute right-2 top-2 rounded-full bg-gray-700/70 p-1.5 transition duration-300 hover:bg-red-500"
                onClick={removeLocalImage}
              >
                <PiTrashBold className="text-white" />
              </button>
            </figure>
          </div>
        </div>
      ) : (
        <UploadZone
          label="Upload Banner Image"
          name="imageUrl"
          getValues={getValues}
          setValue={(
            name:
              | 'name'
              | 'imageUrl'
              | 'pageLink'
              | 'active'
              | 'category'
              | '_id'
              | 'createdAt',
            value: FileType[]
          ) => {            
            setValue(name as keyof CreateBannerFormInput, value[0]?.path || '');
            if (name === 'imageUrl') {
              setLocalImageUrl(value[0]?.url || '');
            }
          }}
          className="col-span-full"
        />
      )}

      {error ? <Text className="text-md text-red-600">{error}</Text> : null}
    </HorizontalFormBlockWrapper>
  );
};
