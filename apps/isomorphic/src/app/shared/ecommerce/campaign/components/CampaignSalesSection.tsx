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
  Badge,
  cn,
  Checkbox,
} from 'rizzui';
import { Controller } from 'react-hook-form';
import { useSales } from '@/hooks/queries/useSales';
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  PiMagnifyingGlassBold,
  PiXBold,
  PiCheckBold,
  PiPlusBold,
  PiTagBold,
} from 'react-icons/pi';

interface CampaignSalesSectionProps {
  control: Control<CreateCampaignInput>;
  errors: FieldErrors<CreateCampaignInput>;
}

export default function CampaignSalesSection({
  control,
  errors,
}: CampaignSalesSectionProps) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch sales with search - minimum 2 characters
  const { data: salesData, isLoading } = useSales({
    limit: 40,
    search: debouncedSearch.trim().length >= 2 ? debouncedSearch : '',
  });

  const displayedSales = salesData?.sales || [];

  return (
    <div className="space-y-3">
      <FormLabelWithTooltip
        label="Sales"
        tooltip="Select sales to include in this campaign. You can add multiple sales."
      />

      <Controller
        name="sales"
        control={control}
        render={({ field }) => {
          const saleOptions = useMemo(() => {
            if (!salesData?.sales) return [];
            return salesData.sales
              .filter((sale) => field.value?.includes(sale._id))
              .map((sale) => ({
                label: sale.title,
                value: sale._id,
                type: sale.type,
                isActive: sale.isActive,
              }));
          }, [salesData, field.value]);

          return (
            <>
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <MultiSelect
                    clearable
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="No sales selected"
                    optionClassName="p-0"
                    options={saleOptions}
                    dropdownClassName="min-w-80"
                    onClear={() => field.onChange([])}
                    getOptionDisplayValue={(option, selected) =>
                      renderSaleOptionDisplayValue(option, selected)
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
                      Select Sales
                    </Text>
                    <Input
                      placeholder="Search by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      prefix={<PiMagnifyingGlassBold className="size-4" />}
                      clearable
                      onClear={() => setSearchQuery('')}
                    />
                  </div>

                  {/* Sales List */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader variant="spinner" size="lg" />
                        <Text className="ml-3 text-gray-600">
                          {searchQuery ? 'Searching...' : 'Loading sales...'}
                        </Text>
                      </div>
                    ) : displayedSales.length === 0 ? (
                      <div className="py-8 text-center">
                        <Text className="text-gray-500">
                          {searchQuery
                            ? 'No sales found matching your search'
                            : 'No sales available'}
                        </Text>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {displayedSales.map((sale) => {
                          const isSelected = field.value?.includes(sale._id);
                          return (
                            <div
                              key={sale._id}
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
                                      (id) => id !== sale._id
                                    )
                                  );
                                } else {
                                  field.onChange([...currentValues, sale._id]);
                                }
                              }}
                            >
                              <Checkbox
                                checked={isSelected}
                                onChange={() => {}}
                                className="pointer-events-none"
                              />
                              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50">
                                <PiTagBold className="h-6 w-6 text-gray-400" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <Text className="truncate font-medium">
                                  {sale.title}
                                </Text>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge
                                    size="sm"
                                    variant="flat"
                                    color={
                                      sale.isActive ? 'success' : 'secondary'
                                    }
                                  >
                                    {sale.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  <span className="text-gray-500">
                                    {sale.type}
                                  </span>
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

      {errors.sales && (
        <Text className="text-sm text-red-500">{errors.sales.message}</Text>
      )}
    </div>
  );
}

function renderSaleOptionDisplayValue(option: any, selected: boolean) {
  return (
    <div className={cn('flex w-full items-center gap-3 px-3 py-1.5 pe-4')}>
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded bg-gray-100">
        <PiTagBold className="h-5 w-5 text-gray-500" />
      </div>
      <div className="min-w-0 flex-1">
        <Text fontWeight="medium" className="truncate">
          {option.label}
        </Text>
        <div className="flex items-center gap-2">
          <Badge
            size="sm"
            variant="flat"
            color={option.isActive ? 'success' : 'secondary'}
          >
            {option.isActive ? 'Active' : 'Inactive'}
          </Badge>
          <Text className="truncate text-xs text-gray-500">{option.type}</Text>
        </div>
      </div>
      {selected && <PiCheckBold className="ms-auto size-5 flex-shrink-0" />}
    </div>
  );
}
