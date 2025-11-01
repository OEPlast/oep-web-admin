'use client';
import React, { useState } from 'react';
import { Button, Text, Alert } from 'rizzui';
import { Form } from '@core/ui/form';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateSalesInput,
  createSalesSchema,
} from '@/validators/create-sale.schema';
import { useCreateSale } from '@/hooks/mutations/useSalesMutations';
import { useProducts, Product } from '@/hooks/queries/useProducts';
import { handleApiError } from '@/libs/axios';
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

const initialDefaultValues: CreateSalesInput = {
  title: '',
  type: 'Normal',
  product: '',
  campaign: '',
  limit: 0,
  deleted: false,
  isHot: false,
  startDate: new Date(),
  endDate: new Date(),
  variants: [
    {
      attributeName: 'All',
      attributeValue: 'All',
      discount: 10,
      amountOff: 0,
      maxBuys: 0,
      boughtCount: 0,
    },
  ],
  isActive: true,
};

export default function CreateSales() {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );

  // Fetch products for the dropdown
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    error: productsError,
  } = useProducts();

  // Create sale mutation
  const createSaleMutation = useCreateSale();

  // Form setup
  const methods = useForm<CreateSalesInput>({
    resolver: zodResolver(createSalesSchema),
    mode: 'onChange',
    defaultValues: initialDefaultValues,
  });

  // Update filtered products when products data changes
  React.useEffect(() => {
    if (productsData?.data) {
      const transformedProducts = productsData.data.map((p: Product) => ({
        ...p,
        image:
          p.description_images?.find((img: any) => img.cover_image)?.url || '',
        subCategories: { _id: '', name: '' },
        attributes: (p.attributes || []).map((attr) => ({
          name: attr.name,
          children: attr.children.map((child) => ({
            name: child.name,
            price: child.price,
            discount: 0,
            stock: child.stock,
            image: child.image,
          })),
        })),
        coverImage: p.description_images?.find((img: any) => img.cover_image)
          ?.url,
      }));
      setFilteredProducts(transformedProducts);
    }
  }, [productsData]);

  const onSubmit: SubmitHandler<CreateSalesInput> = async (data) => {
    try {
      await createSaleMutation.mutateAsync({
        ...data,
        // Convert dates to ISO strings for API
        startDate: data.startDate?.toISOString(),
        endDate: data.endDate?.toISOString(),
      });

      // Reset form on success
      methods.reset(initialDefaultValues);
      setSelectedProduct(null);
    } catch (error) {
      // Error toast is handled by the mutation hook
      console.error('Failed to create sale:', error);
    }
  };

  const handleSearch = (query: string) => {
    if (!productsData?.data) return;

    const filtered = productsData.data
      .filter(
        (product: Product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.sku.toString().includes(query)
      )
      .map((p: Product) => ({
        ...p,
        image:
          p.description_images?.find((img: any) => img.cover_image)?.url || '',
        subCategories: { _id: '', name: '' },
        attributes: (p.attributes || []).map((attr) => ({
          name: attr.name,
          children: attr.children.map((child) => ({
            name: child.name,
            price: child.price,
            discount: 0,
            stock: child.stock,
            image: child.image,
          })),
        })),
        coverImage: p.description_images?.find((img: any) => img.cover_image)
          ?.url,
      }));

    setFilteredProducts(filtered);
  };

  const description =
    'Fill in the details below to create a new sale. Set the title, type, product, campaign, and variants.';

  // Loading state for products
  if (isLoadingProducts) {
    return (
      <div className="p-6">
        <Text className="text-center">Loading products...</Text>
      </div>
    );
  }

  // Error state for products
  if (productsError) {
    return (
      <div className="p-6">
        <Alert color="danger" className="mb-4">
          <strong>Error loading products:</strong>{' '}
          {handleApiError(productsError)}
        </Alert>
      </div>
    );
  }

  return (
    <Form<CreateSalesInput>
      onSubmit={onSubmit}
      useFormProps={{
        ...methods,
      }}
      className="isomorphic-form flex max-w-3xl flex-col justify-start gap-3 rounded-lg bg-white p-0.5"
    >
      {({
        register,
        control,
        setValue,
        reset,
        watch,
        formState: { errors },
        handleSubmit,
      }) => {
        return (
          <>
            <Text className="mb-2 text-sm text-gray-500">{description}</Text>

            {/* Display create mutation error */}
            {createSaleMutation.isError && (
              <Alert color="danger" className="mb-4">
                <strong>Failed to create sale:</strong>{' '}
                {handleApiError(createSaleMutation.error)}
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
                  filteredProducts={filteredProducts}
                  handleSearch={handleSearch}
                  isEditMode={false}
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

            <footer className="mt-6 flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full @xl:w-auto"
                onClick={() => methods.reset()}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={createSaleMutation.isPending}
                isLoading={createSaleMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 @xl:w-auto"
              >
                {createSaleMutation.isPending ? 'Creating...' : 'Create Sale'}
              </Button>
            </footer>
          </>
        );
      }}
    </Form>
  );
}
