'use client';

import React, { useEffect, useState } from 'react';
import { Button, Text, Alert } from 'rizzui';
import { Form } from '@core/ui/form';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateSalesInput,
  createSalesSchema,
} from '@/validators/create-sale.schema';
import { useSaleById } from '@/hooks/queries/useSales';
import { useUpdateSale } from '@/hooks/mutations/useSalesMutations';
import { handleApiError } from '@/libs/axios';
import { Sale } from '@/types/sales';
import SaleInfoForm from './components/SaleInfoForm';
import SaleTypeSpecificFields from './components/SaleTypeSpecificFields';
import SaleVariantsForm from './components/SaleVariantsForm';

// Product type for form component compatibility
interface ProductType {
  _id: string;
  name: string;
  image: string;
  stock: number;
  slug: string;
  category: {
    _id: string;
    name: string;
  };
  subCategories: {
    _id: string;
    name: string;
  };
  attributes: {
    name: string;
    children: {
      name: string;
      price: number;
      discount: number;
      stock: number;
      image: string;
    }[];
  }[];
  coverImage?: string;
}

interface EditSalesProps {
  saleId: string;
}

function defaultValues(saleData?: Sale): CreateSalesInput {
  if (!saleData) {
    return {
      title: '',
      type: 'Normal',
      product: '',
      campaign: '',
      limit: 0,
      deleted: false,
      startDate: new Date(),
      endDate: new Date(),
      variants: [],
      isActive: true,
      isHot: false,
    };
  }

  return {
    title: saleData.title || '',
    type: saleData.type || 'Normal',
    product: saleData.product._id,
    campaign: saleData.campaign || '',
    limit: saleData.variants.reduce((sum, v) => sum + v.maxBuys, 0),
    deleted: saleData.deleted || false,
    startDate: saleData.startDate ? new Date(saleData.startDate) : new Date(),
    endDate: saleData.endDate ? new Date(saleData.endDate) : new Date(),
    variants: saleData.variants.map((v) => ({
      attributeName: v.attributeName || null,
      attributeValue: v.attributeValue || null,
      discount: v.discount || 0,
      maxBuys: v.maxBuys || 0,
      boughtCount: v.boughtCount || 0,
    })),
    isActive: saleData.isActive,
    isHot: saleData.isHot,
  };
}

export default function EditSales({ saleId }: EditSalesProps) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );

  // Fetch sale data (includes product information)
  const {
    data: saleData,
    isLoading: isLoadingSale,
    error: saleError,
    isError: isSaleError,
  } = useSaleById(saleId);

  // Update sale mutation
  const updateSaleMutation = useUpdateSale();

  // Form setup
  const methods = useForm<CreateSalesInput>({
    resolver: zodResolver(createSalesSchema),
    mode: 'onChange',
    defaultValues: defaultValues(saleData),
  });

  const onSubmit: SubmitHandler<CreateSalesInput> = async (data) => {
    try {
      await updateSaleMutation.mutateAsync({
        id: saleId,
        data: {
          ...data,
          // Convert dates to ISO strings for API
          startDate: data.startDate?.toISOString(),
          endDate: data.endDate?.toISOString(),
        },
      });
      // Success toast is handled by the mutation hook
    } catch (error) {
      // Error toast is handled by the mutation hook
      console.error('Failed to update sale:', error);
    }
  };

  const handleSearch = (query: string) => {
    // No-op since we're editing an existing sale with a fixed product
    console.log('Search not applicable in edit mode:', query);
  };

  const description =
    'Modify the details below to update the sale. Adjust the title, type, product, campaign, and variants as needed.';

  // Loading state
  if (isLoadingSale) {
    return (
      <div className="p-6">
        <Text className="text-center">Loading sale data...</Text>
      </div>
    );
  }

  // Error state
  if (isSaleError) {
    return (
      <div className="p-6">
        <Alert color="danger" className="mb-4">
          <strong>Error loading sale:</strong> {handleApiError(saleError)}
        </Alert>
      </div>
    );
  }

  if (!saleData) {
    return (
      <div className="p-6">
        <Alert color="danger" className="mb-4">
          <strong>Sale not found</strong>
        </Alert>
      </div>
    );
  }

  return (
    <Form<CreateSalesInput>
      onSubmit={onSubmit}
      useFormProps={{
        mode: 'onChange',
        resolver: zodResolver(createSalesSchema),
        defaultValues: methods.getValues(),
      }}
      className="isomorphic-form flex max-w-3xl flex-col justify-start gap-3 rounded-lg bg-white"
    >
      {({
        register,
        control,
        setValue,
        watch,
        formState: { errors, isDirty },
      }) => {
        return (
          <>
            <Text className="mb-6 text-sm text-gray-500">{description}</Text>

            {/* Display update mutation error */}
            {updateSaleMutation.isError && (
              <Alert color="danger" className="mb-4">
                <strong>Failed to update sale:</strong>{' '}
                {handleApiError(updateSaleMutation.error)}
              </Alert>
            )}

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <SaleInfoForm
                  control={control}
                  errors={errors}
                  register={register}
                  setValue={setValue}
                  selectedProduct={selectedProduct}
                  setSelectedProduct={setSelectedProduct}
                  isDrawerOpen={isDrawerOpen}
                  setDrawerOpen={setDrawerOpen}
                  filteredProducts={[]} // Empty since we're editing existing sale
                  handleSearch={handleSearch}
                  isEditMode={true}
                />
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SaleTypeSpecificFields
                control={control}
                errors={errors}
                watch={watch}
                register={register}
              />
            </section>

            <section>
              <SaleVariantsForm
                control={control}
                errors={errors}
                watch={watch}
                register={register}
                setValue={setValue}
                selectedProduct={selectedProduct}
              />
            </section>

            <footer className="mt-8 flex justify-end gap-4 border-t border-gray-200 pt-6">
              <Button
                type="submit"
                disabled={!isDirty || updateSaleMutation.isPending}
                isLoading={updateSaleMutation.isPending}
                className={`w-full text-white @xl:w-auto ${
                  !isDirty
                    ? 'bg-gray-300 text-gray-500'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                }`}
              >
                {updateSaleMutation.isPending ? 'Updating...' : 'Update Sale'}
              </Button>
            </footer>
          </>
        );
      }}
    </Form>
  );
}
