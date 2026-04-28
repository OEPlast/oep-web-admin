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
  category?: string;
  setValue: (name: keyof CreateBannerFormInput, value: string) => void;
  getValues: (name: string) => any;
  error?: string | undefined;
};

export const BannerImageBlock: React.FC<BannerImageBlockProps> = ({
  imageUrl,
  category,
  error,
  setValue,
  getValues,
}) => {
  const [localImageUrl, setLocalImageUrl] = useState(
    () => getCdnUrl(imageUrl) || ''
  );
  const bannerImage = getValues('imageUrl');

  const removeLocalImage = () => {
    setLocalImageUrl('');
    setValue('imageUrl', '');
  };

  return (
    <HorizontalFormBlockWrapper
      title="Banner Image"
      description=""
      isModalView={true}
    >
      {bannerImage ? (
        <div className="col-span-full">
          <div className="relative">
            <figure className="group relative h-52 w-full rounded-md bg-gray-50">
              <img
                src={getCdnUrl(bannerImage)}
                alt="Banner preview"
                className="h-full w-full rounded-md object-cover"
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
      ) : null}

      {!bannerImage ? (
        <>
          {category === 'D' ? (
            <p className="col-span-full -mt-2 text-sm font-semibold italic text-gray-500">
              The image must be in format of 1920 x 440.
            </p>
          ) : null}
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
              value: string
            ) => {
              setValue(name as keyof CreateBannerFormInput, value);
              if (name === 'imageUrl') {
                console.log(value);

                setLocalImageUrl(value);
              }
            }}
            className="col-span-full"
          />
        </>
      ) : null}

      {error ? <Text className="text-md text-red-600">{error}</Text> : null}
    </HorizontalFormBlockWrapper>
  );
};
