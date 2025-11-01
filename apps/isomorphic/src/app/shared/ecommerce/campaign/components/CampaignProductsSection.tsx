'use client';

import { Control, FieldErrors } from 'react-hook-form';
import { FormLabelWithTooltip } from '@core/ui/form-label-with-tooltip';
import { CreateCampaignInput } from '@/validators/create-campaign.schema';
import {
  Button,
  Drawer,
  Input,
  Text,
  Loader,
  MultiSelect,
  CheckboxGroup,
  cn,
  Checkbox,
} from 'rizzui';
import { Controller } from 'react-hook-form';
import { useProducts, useProductSearch } from '@/hooks/queries/useProducts';
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  PiMagnifyingGlassBold,
  PiXBold,
  PiCheckBold,
  PiPlusBold,
} from 'react-icons/pi';
import Image from 'next/image';
import { getCdnUrl } from '@core/utils/cdn-url';

interface CampaignProductsSectionProps {
  control: Control<CreateCampaignInput>;
  errors: FieldErrors<CreateCampaignInput>;
}

export default function CampaignProductsSection({
  control,
  errors,
}: CampaignProductsSectionProps) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch initial products (first 50) when drawer opens
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    page: 1,
    limit: 50,
  });

  // Search products when user types (debounced) - minimum 2 characters
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
    <div className="space-y-3">
      <FormLabelWithTooltip
        label="Products"
        tooltip="Select products to include in this campaign. You can add multiple products."
      />

      <Controller
        name="products"
        control={control}
        render={({ field }) => {
          const productOptions = useMemo(() => {
            if (!productsData?.data) return [];
            return productsData.data
              .filter((product) => field.value?.includes(product._id))
              .map((product) => ({
                label: product.name,
                value: product._id,
                image: product.description_images.find((img) => img.cover_image)?.url,
              }));
          }, [productsData, field.value]);

          return (
            <>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <MultiSelect
                    clearable
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="No products selected"
                    optionClassName="p-0"
                    options={productOptions}
                    dropdownClassName="min-w-80"
                    onClear={() => field.onChange([])}
                    getOptionDisplayValue={(option, selected) =>
                      renderOptionDisplayValue(option, selected)
                    }
                  />
                </div>
                <Button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  variant="outline"
                  className="flex-shrink-0"
                >
                  <PiPlusBold className="h-4 w-4" />
                </Button>
              </div>

              <Drawer
                isOpen={isDrawerOpen}
                onClose={() => {
                  setDrawerOpen(false);
                  setSearchQuery('');
                }}
              >
                <div className="flex h-full flex-col">
                  {/* Header */}
                  <div className="border-b border-gray-200 p-4">
                    <Text className="mb-4 text-lg font-semibold">
                      Select Products
                    </Text>
                    <Input
                      placeholder="Search by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      prefix={<PiMagnifyingGlassBold className="size-4" />}
                      clearable
                      onClear={() => setSearchQuery('')}
                    />
                  </div>

                  {/* Product List */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader variant="spinner" size="lg" />
                        <Text className="ml-3 text-gray-600">
                          {searchQuery ? 'Searching...' : 'Loading products...'}
                        </Text>
                      </div>
                    ) : displayedProducts.length === 0 ? (
                      <div className="py-8 text-center">
                        <Text className="text-gray-500">
                          {searchQuery
                            ? 'No products found matching your search'
                            : 'No products available'}
                        </Text>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {displayedProducts.map((product) => {
                          const isSelected = field.value?.includes(product._id);
                          return (
                            <div
                              key={product._id}
                              className={cn(
                                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all',
                                isSelected
                                  ? 'border-primary bg-primary-lighter'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              )}
                              onClick={() => {
                                const currentValues = field.value || [];
                                if (isSelected) {
                                  field.onChange(
                                    currentValues.filter(
                                      (id) => id !== product._id
                                    )
                                  );
                                } else {
                                  field.onChange([
                                    ...currentValues,
                                    product._id,
                                  ]);
                                }
                              }}
                            >
                              <Checkbox
                                checked={isSelected}
                                onChange={() => {}}
                                className="pointer-events-none"
                              />
                              <Image
                                src={
                                  getCdnUrl(product.description_images.find((img) => img.cover_image)?.url) ||
                                  '/placeholder.png'
                                }
                                alt={product.name}
                                width={48}
                                height={48}
                                className="h-12 w-12 flex-shrink-0 rounded-md border border-gray-200 object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <Text className="truncate font-medium">
                                  {product.name}
                                </Text>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {product.category?.name && (
                                    <span>{product.category.name}</span>
                                  )}
                                  {product.stock !== undefined && (
                                    <>
                                      <span>•</span>
                                      <span>Stock: {product.stock}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {isSelected && (
                                <PiCheckBold className="h-5 w-5 text-primary" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </Drawer>
            </>
          );
        }}
      />

      {errors.products && (
        <Text className="text-sm text-red-500">{errors.products.message}</Text>
      )}
    </div>
  );
}

function renderOptionDisplayValue(option: any, selected: boolean) {
  return (
    <div className={cn('flex w-full items-center gap-3 px-3 py-1.5 pe-4')}>
      <Image
        src={option.image || '/placeholder.png'}
        alt={option.label}
        width={36}
        height={36}
        className="size-9 flex-shrink-0 rounded bg-muted object-cover"
      />
      <div className="min-w-0 flex-1">
        <Text fontWeight="medium" className="truncate">
          {option.label}
        </Text>
        <Text className="truncate text-xs text-gray-500">{option.value}</Text>
      </div>
      {selected && <PiCheckBold className="ms-auto size-5 flex-shrink-0" />}
    </div>
  );
}
