'use client';

import { useState, useEffect } from 'react';
import { Button, Checkbox } from 'rizzui';
import { PiTrash } from 'react-icons/pi';
import Image from 'next/image';
import UploadZone from '@core/ui/file-upload/upload-zone';
import cn from '@core/utils/class-names';
import { getCdnUrl } from '@core/utils/cdn-url';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { CreateProductInput } from '@/validators/product-schema';

interface ProductImage {
  url: string;
  cover_image: boolean;
}

interface ProductImageManagerProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
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
  getValues
}: ProductImageManagerProps) {
  const [displayImages, setDisplayImages] = useState<ProductImage[]>(images);

  // Sync displayImages with images prop
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
    // If we deleted the cover image and there are still images, set the first one as cover
    if (displayImages[index].cover_image && updatedImages.length > 0) {
      updatedImages[0].cover_image = true;
    }
    setDisplayImages(updatedImages);
    onChange(updatedImages);
  };

  return (
    <div className={cn('space-y-5', className)}>
      {displayImages.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {displayImages.map((image, index) => (
            <div 
              key={index} 
              className="group relative aspect-square overflow-hidden rounded-lg border border-gray-300"
            >
              <Image
                src={getCdnUrl(image.url)}
                alt={`Product image ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(index)}
                className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 shadow-md transition-opacity hover:bg-red-600 group-hover:opacity-100"
                title="Delete image"
              >
                <PiTrash className="h-4 w-4" />
              </button>
              <div className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1">
                <Checkbox
                  label="Cover"
                  checked={!!image.cover_image}
                  onChange={() => handleSetCoverImage(index)}
                  className="text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border-2 border-dashed border-gray-300 p-6">
        <UploadZone
          name="description_images"
          getValues={getValues}
          setValue={setValue}
          multiple={true}
          label={displayImages.length > 0 ? 'Add More Images' : 'Upload Product Images'}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
