'use client';

import { useState, useEffect } from 'react';
import { Button, Checkbox } from 'rizzui';
import { PiTrash, PiPlayCircle } from 'react-icons/pi';
import Image from 'next/image';
import UploadZone from '@core/ui/file-upload/upload-zone';
import cn from '@core/utils/class-names';
import { getCdnUrl } from '@core/utils/cdn-url';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { CreateProductInput } from '@/validators/product-schema';
import { UploadedFile } from '@core/utils/upload-history';

interface ProductMedia {
  url: string;
  cover_image: boolean;
  mediaType?: 'image' | 'video';
  miniUrl?: string;
}

interface ProductImageManagerProps {
  images: ProductMedia[];
  onChange: (images: ProductMedia[]) => void;
  error?: string;
  className?: string;
  getValues: UseFormGetValues<CreateProductInput>;
  setValue: UseFormSetValue<CreateProductInput>;
}

export default function ProductImageManager({
  images = [],
  onChange,
  error,
  className,
  setValue,
  getValues,
}: ProductImageManagerProps) {
  const [displayImages, setDisplayImages] = useState<ProductMedia[]>(images);

  useEffect(() => {
    setDisplayImages(images);
  }, [images]);

  const handleSetCoverImage = (index: number) => {
    const updatedImages = displayImages.map((img, idx) => ({
      ...img,
      cover_image: idx === index,
    }));
    setDisplayImages(updatedImages);
    onChange(updatedImages);
  };

  const handleDeleteImage = (index: number) => {
    const updatedImages = displayImages.filter((_, idx) => idx !== index);
    if (displayImages[index].cover_image && updatedImages.length > 0) {
      // Re-assign cover to first image (not video)
      const firstImageIdx = updatedImages.findIndex((m) => (m.mediaType ?? 'image') === 'image');
      if (firstImageIdx !== -1) updatedImages[firstImageIdx].cover_image = true;
    }
    setDisplayImages(updatedImages);
    onChange(updatedImages);
  };

  const finalSetValue = (
    name: string,
    value: Array<ProductMedia | UploadedFile>
  ) => {
    const newMedia = value.map((item) => {
      if ('cover_image' in item) {
        return { ...item } as ProductMedia;
      }
      const uploaded = item as UploadedFile;
      const isVideo = uploaded.mediaType === 'video';
      return {
        url: uploaded.path,
        cover_image: false,
        mediaType: uploaded.mediaType ?? 'image',
        ...(isVideo && uploaded.thumbnailPath ? { miniUrl: uploaded.thumbnailPath } : {}),
      } as ProductMedia;
    });

    // Auto-assign cover to first image if none selected
    const hasCover = newMedia.some((m) => m.cover_image);
    if (!hasCover) {
      const firstImageIdx = newMedia.findIndex((m) => (m.mediaType ?? 'image') === 'image');
      if (firstImageIdx !== -1) newMedia[firstImageIdx].cover_image = true;
    }

    setValue('description_images', newMedia);
  };

  return (
    <div className={cn('space-y-5', className)}>
      {displayImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {displayImages.map((item, index) => {
            const isVideo = item.mediaType === 'video';
            const thumbnailSrc = isVideo
              ? item.miniUrl
                ? getCdnUrl(item.miniUrl)
                : null
              : getCdnUrl(item.url);

            return (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-lg border border-gray-300"
              >
                {isVideo ? (
                  thumbnailSrc ? (
                    <>
                      <Image
                        src={thumbnailSrc}
                        alt={`Product video ${index + 1} thumbnail`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PiPlayCircle className="h-10 w-10 text-white drop-shadow-lg" />
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-100">
                      <PiPlayCircle className="h-10 w-10 text-gray-400" />
                    </div>
                  )
                ) : (
                  <Image
                    src={getCdnUrl(item.url)}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                )}

                <div className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                  {isVideo ? 'Video' : 'Image'}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-md transition-opacity hover:bg-red-600 group-hover:opacity-100"
                  title="Delete"
                >
                  <PiTrash className="h-4 w-4" />
                </button>

                {!isVideo && (
                  <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1">
                    <Checkbox
                      label="Cover"
                      checked={!!item.cover_image}
                      onChange={() => handleSetCoverImage(index)}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
        <UploadZone
          name="description_images"
          getValues={getValues}
          setValue={finalSetValue}
          multiple={true}
          accept="image/*,video/*"
          label={
            displayImages.length > 0
              ? 'Add More Images / Videos'
              : 'Upload Product Images / Videos'
          }
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
