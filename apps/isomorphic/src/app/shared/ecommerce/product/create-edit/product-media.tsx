import { Controller, useFormContext } from 'react-hook-form';
import VerticalFormBlockWrapper from '@/app/shared/VerticalFormBlockWrapper';
import cn from '@core/utils/class-names';
import ProductImageManager from '../ProductImageManager';

interface ProductMediaProps {
  className?: string;
}

export default function ProductMedia({ className }: ProductMediaProps) {
  const { control, getValues, setValue, formState: { errors } } = useFormContext();

  return (
    <VerticalFormBlockWrapper
      title="Upload Product Images"
      description="Upload your product image gallery here (mark one as cover image)"
      className={cn(className)}
    >
      <Controller
        name="description_images"
        control={control}
        render={({ field }) => (
          <ProductImageManager
            images={field.value || []}
            getValues={getValues as any}
            setValue={setValue as any}
            onChange={field.onChange}
            error={errors.description_images?.message as string}
          />
        )}
      />
    </VerticalFormBlockWrapper>
  );
}
