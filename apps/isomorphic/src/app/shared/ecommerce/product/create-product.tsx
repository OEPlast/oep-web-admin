'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Loader, Text } from 'rizzui';
import { routes } from '@/config/routes';
import { useCreateProduct } from '@/hooks/mutations/useProductMutations';
import { clearPreparedVylux, usePreparedVylux, VyluxPrepared } from '@/hooks/queries/useVylux';
import { handleApiError } from '@/libs/axios';
import { extractBackendErrors, BackendValidationError } from '@/libs/form-errors';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CreateProductInput } from '@/validators/product-schema';
import CreateEditProduct from '@/app/shared/ecommerce/product/create-edit';
import VyluxReferencePanel from '@/app/shared/ecommerce/product/vylux-import/reference-panel';

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

/** A Vylux product's pictures and name as the form's starting values (stock 100, a small parcel). */
const fromVylux = ({ product, images, suggestedSku }: VyluxPrepared): Partial<CreateProductInput> => ({
  name: product.title,
  slug: toSlug(product.title),
  sku: suggestedSku,
  description_images: images,
  stock: 100,
  weight: 0.2,
  length: 10,
  width: 10,
  height: 5,
});

export default function CreateProduct() {
  const router = useRouter();
  const vyluxParam = Number(useSearchParams().get('vylux'));
  const vyluxId = Number.isInteger(vyluxParam) && vyluxParam > 0 ? vyluxParam : null;
  const prepared = usePreparedVylux(vyluxId);
  const initialValues = useMemo(() => (prepared.data ? fromVylux(prepared.data) : undefined), [prepared.data]);
  const [, setApiErrors] = useState<BackendValidationError[] | null>(null);

  const createProduct = useCreateProduct({
    onSuccess: () => {
      if (vyluxId) clearPreparedVylux(vyluxId);
      toast.success('Product created successfully');
      router.push(routes.eCommerce.products);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const backendErrors = extractBackendErrors(error.response.data);
        if (backendErrors) {
          setApiErrors(backendErrors);
        } else {
          const backendMessage = error.response.data?.message;
          toast.error(backendMessage || 'Something went wrong, try again');
        }
      } else {
        toast.error('Something went wrong, try again');
      }
    },
  });

  const handleSubmit = (data: CreateProductInput) => {
    setApiErrors(null);
    createProduct.mutate(vyluxId ? { ...data, vyluxId } : data);
  };

  if (vyluxId && prepared.isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-gray-500">
        <Loader size="lg" />
        <Text>Copying the pictures from Vylux…</Text>
      </div>
    );
  }
  if (vyluxId && prepared.isError) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not get this Vylux product</Text>
        <Text className="text-sm">
          {handleApiError(prepared.error)}.{' '}
          <Link href={routes.eCommerce.importVylux} className="underline">
            Back to Import from Vylux
          </Link>
        </Text>
      </Alert>
    );
  }

  return (
    <CreateEditProduct
      // Remount once the Vylux values arrive so they become the form's defaults.
      key={vyluxId ?? 'new'}
      mode="create"
      onSubmit={handleSubmit}
      isLoading={createProduct.isPending}
      initialValues={initialValues}
      intro={prepared.data ? <VyluxReferencePanel product={prepared.data.product} /> : undefined}
    />
  );
}
