'use client';

import { useFormContext } from 'react-hook-form';
import { Button, Text } from 'rizzui';
import { PiArrowDownBold } from 'react-icons/pi';
import toast from 'react-hot-toast';
import { VyluxProduct } from '@/hooks/queries/useVylux';
import { CreateProductInput } from '@/validators/product-schema';
import { VyluxDetails, VyluxMediaViewer } from './product-modal';

/**
 * The scraper product being turned into a store product, kept in view above the product form:
 * the same pictures, name, Vylux price and caption the import page showed.
 */
export default function VyluxReferencePanel({ product }: { product: VyluxProduct }) {
  const { setValue, getValues } = useFormContext<CreateProductInput>();

  const applyCaption = () => {
    if (getValues('description')?.trim() && !window.confirm('Replace the current description with the Vylux caption?')) return;
    setValue('description', product.description, { shouldDirty: true, shouldValidate: true });
    toast.success('Caption copied into the description');
  };

  return (
    <section className="mb-8 rounded-xl bg-gray-900 p-5 text-white @container md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <Text className="text-sm font-semibold uppercase tracking-wider text-gray-300">From Vylux · #{product.vyluxId}</Text>
        <Text className="text-xs text-gray-400">
          Pictures and name are filled in below. Set the price, category and the rest as you like.
        </Text>
      </div>
      <div className="grid gap-6 @3xl:grid-cols-[minmax(0,320px)_1fr]">
        <VyluxMediaViewer product={product} compact />
        <div className="space-y-4">
          <VyluxDetails product={product} tone="dark" />
          {product.description && (
            <Button type="button" size="sm" variant="outline" onClick={applyCaption} className="border-gray-500 text-white hover:border-white hover:bg-white hover:text-gray-900">
              <PiArrowDownBold className="me-1.5 h-4 w-4" />
              Use caption as description
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
