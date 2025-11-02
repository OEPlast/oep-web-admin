'use client';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form';
import { Button, Drawer, Input, Select, Text, Loader, Switch } from 'rizzui';
import { CreateSalesInput } from '@/validators/create-sale.schema';
import { LuReplace } from 'react-icons/lu';
import { useState } from 'react';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { useProducts, useProductSearch } from '@/hooks/queries/useProducts';
import { useDebounce } from '@/hooks/use-debounce';

const typeOptions = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Flash', label: 'Flash' },
];

interface SaleInfoFormProps {
  control: Control<CreateSalesInput>;
  errors: FieldErrors<CreateSalesInput>;
  register: UseFormRegister<CreateSalesInput>;
  setValue: UseFormSetValue<CreateSalesInput>;
  selectedProduct: {
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
  } | null;
  setSelectedProduct: React.Dispatch<React.SetStateAction<any | null>>;
  isDrawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  filteredProducts: any[]; // This prop is no longer used but kept for compatibility
  handleSearch: (query: string) => void; // This prop is no longer used but kept for compatibility
  isEditMode?: boolean;
}

export default function SaleInfoForm({
  control,
  errors,
  register,
  setValue,
  selectedProduct,
  setSelectedProduct,
  isDrawerOpen,
  setDrawerOpen,
  isEditMode,
}: SaleInfoFormProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch initial products (first 20) when drawer opens
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    page: 1,
    limit: 20,
  });

  // Search products when user types (debounced)
  const { data: searchResults, isLoading: isSearching } = useProductSearch(
    debouncedSearch,
    isDrawerOpen && debouncedSearch.trim().length >= 2
  );

  // Determine which products to display
  const displayedProducts =
    searchQuery.trim().length >= 2
      ? searchResults || []
      : productsData?.data || [];

  const isLoading = isLoadingProducts || isSearching;
  return (
    <>
      <Input
        className="mb-3"
        label="Title"
        placeholder="Sale Title"
        {...register('title', { required: true })}
        error={errors.title?.message}
      />
      <Controller
        name="type"
        control={control}
        render={({ field }) => (
          <Select
            className="mb-3"
            label="Type"
            options={typeOptions}
            value={field.value}
            onChange={(selectedOption) => {
              const selectedValue =
                (selectedOption as unknown as { value: string })?.value || '';
              field.onChange(selectedValue);

              if (selectedValue !== 'Flash') {
                setValue('startDate', new Date());
                setValue('endDate', new Date());
              }
            }}
            error={errors.type?.message as string}
          />
        )}
      />
      <Controller
        name="isHot"
        control={control}
        render={({ field }) => (
          <div className="mb-3">
            <label className="mb-2 block text-sm font-medium">
              Hot Sale
              <Text className="mt-1 text-xs font-normal text-gray-500">
                Show "Hot Sale" marquee banner and sold/available progress on
                product cards
              </Text>
            </label>
            <Switch
              checked={field.value}
              onChange={field.onChange}
              label={field.value ? 'Enabled' : 'Disabled'}
            />
          </div>
        )}
      />
      <div>
        <label className="mb-1 block font-medium">Product</label>
        {isEditMode && selectedProduct && (
          <Text className="mb-2 text-xs text-amber-600">
            Note: Changing product in edit mode will reset variants to default
            values.
          </Text>
        )}
        {!selectedProduct && (
          <Button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-full"
          >
            Select Product
          </Button>
        )}
        <Drawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setSearchQuery('');
          }}
        >
          <div className="p-4">
            <Text className="mb-4 text-lg font-semibold">Select Product</Text>
            <Input
              placeholder="Search by name, SKU, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-4"
              prefix={<PiMagnifyingGlassBold className="size-4" />}
              clearable
              onClear={() => setSearchQuery('')}
            />
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader variant="spinner" size="lg" />
                <Text className="ml-3 text-gray-600">
                  {searchQuery.length >= 2
                    ? 'Searching...'
                    : 'Loading products...'}
                </Text>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="py-8 text-center">
                <Text className="text-gray-500">
                  {searchQuery.length >= 2
                    ? 'No products found matching your search'
                    : searchQuery.length > 0 && searchQuery.length < 2
                      ? 'Type at least 2 characters to search'
                      : 'No products available'}
                </Text>
              </div>
            ) : (
              <div className="h-full space-y-2 overflow-y-auto">
                {displayedProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-3 transition-all hover:border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      setValue('product', product._id);
                      setSelectedProduct({
                        _id: product._id,
                        name: product.name,
                        image:
                          product.description_images.find(
                            (img) => img.cover_image
                          )?.url || '',
                        stock: product.stock,
                        slug: product.slug,
                        category: product.category,
                        // subCategories: product.subCategories || { _id: '', name: '' },
                        attributes: product.attributes || [],
                      });
                      // Only set default variants in create mode, not edit mode
                      if (!isEditMode) {
                        setValue('variants', [
                          {
                            attributeName: 'All',
                            attributeValue: 'All',
                            discount: 10,
                            maxBuys: 0,
                            boughtCount: 0,
                          },
                        ]);
                      }
                      setDrawerOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    <img
                      src={
                        product.description_images.find(
                          (img) => img.cover_image
                        )?.url || '/placeholder.png'
                      }
                      alt={product.name}
                      className="h-12 w-12 flex-shrink-0 rounded-md border border-gray-200 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Text className="truncate font-medium">
                        {product.name}
                      </Text>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{product.category?.name || 'No category'}</span>
                        {product.stock !== undefined && (
                          <>
                            <span>•</span>
                            <span>Stock: {product.stock}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Drawer>
        {errors.product && (
          <Text className="text-sm text-red-500">
            {errors.product.message as string}
          </Text>
        )}
      </div>
      {selectedProduct && (
        <div className="relative flex flex-col items-start gap-2 rounded-md border bg-gray-50 p-4">
          <div className="absolute right-2 top-2">
            <Button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="p-1 px-1.5"
            >
              <LuReplace className="h-4 w-4" />
            </Button>
          </div>
          <img
            src={selectedProduct.image}
            alt={selectedProduct.name}
            className="h-8 w-8 rounded-md object-cover"
          />
          <span className="text-sm font-medium">{selectedProduct.name}</span>
          <span className="text-xs text-gray-500">
            ID: {selectedProduct._id}
          </span>
        </div>
      )}
      {/* Campaign input can be added here if needed */}
      {/* <Input
        label="Campaign"
        placeholder="Campaign Name"
        {...register('campaign')}
        error={errors.campaign?.message}
      /> */}
    </>
  );
}
