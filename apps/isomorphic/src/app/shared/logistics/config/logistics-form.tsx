'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Loader, Text, ActionIcon } from 'rizzui';
import { PiPlusBold, PiTrashDuotone } from 'react-icons/pi';
import { routes } from '@/config/routes';
import {
  useCreateLogisticsConfig,
  useUpdateLogisticsConfig,
  useLogisticsCountry,
} from '@/hooks/use-logistics';
import {
  logisticsConfigSchema,
  type LogisticsConfigFormData,
} from '@/validators/logistics-schema';

interface LogisticsConfigFormProps {
  configId?: string;
  countryName?: string;
}

export default function LogisticsConfigForm({
  configId,
  countryName,
}: LogisticsConfigFormProps) {
  const router = useRouter();
  const isEditMode = !!configId;

  const { data: existingConfig, isLoading: isLoadingConfig } =
    useLogisticsCountry(countryName || '', {
      enabled: isEditMode && !!countryName,
    });

  const createConfig = useCreateLogisticsConfig((data) => {
  router.push(routes.eCommerce.logistics.home);
  });

  const updateConfig = useUpdateLogisticsConfig((data) => {
  router.push(routes.eCommerce.logistics.configDetails(configId!));
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<LogisticsConfigFormData>({
    resolver: zodResolver(logisticsConfigSchema),
    defaultValues: {
      countryCode: '',
      countryName: '',
      states: [],
    },
  });

  const {
    fields: stateFields,
    append: appendState,
    remove: removeState,
  } = useFieldArray({
    control,
    name: 'states',
  });

  // Load existing data in edit mode
  useEffect(() => {
    if (existingConfig && isEditMode) {
      reset({
        countryCode: existingConfig.countryCode,
        countryName: existingConfig.countryName,
        states: existingConfig.states.map((state) => ({
          ...state,
          fallbackPrice: state.fallbackPrice || 0,
          fallbackEtaDays: state.fallbackEtaDays || 0,
          cities: state.cities || [],
          lgas: state.lgas || [],
        })),
      });
    }
  }, [existingConfig, isEditMode, reset]);

  const onSubmit = (data: LogisticsConfigFormData) => {
    if (isEditMode && configId) {
      updateConfig.mutate({
        id: configId,
        data,
      });
    } else {
      createConfig.mutate(data);
    }
  };

  const isSubmitting = createConfig.isPending || updateConfig.isPending;

  if (isEditMode && isLoadingConfig) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="@container">
      <div className="mb-6 rounded-lg border border-muted p-6">
        <h3 className="mb-4 text-lg font-semibold">Country Information</h3>

        <div className="grid gap-4 @lg:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Country Code <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('countryCode', {
                onChange: (e) =>
                  setValue('countryCode', String(e.target.value || '').toUpperCase(), {
                    shouldDirty: true,
                    shouldValidate: true,
                  }),
              })}
              inputClassName="uppercase"
              placeholder="e.g., NG, GH, KE"
              error={errors.countryCode?.message}
              disabled={isEditMode}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Country Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('countryName')}
              placeholder="e.g., Nigeria"
              error={errors.countryName?.message}
              disabled={isEditMode}
            />
          </div>
        </div>
      </div>

      {/* States Section */}
      <div className="mb-6 rounded-lg border border-muted p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">States Configuration</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendState({
                name: '',
                fallbackPrice: 0,
                fallbackEtaDays: 0,
                cities: [],
                lgas: [],
              })
            }
          >
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Add State
          </Button>
        </div>

        {stateFields.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <Text className="mb-2 text-gray-500">No states added yet</Text>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendState({
                  name: '',
                  fallbackPrice: 0,
                  fallbackEtaDays: 0,
                  cities: [],
                  lgas: [],
                })
              }
            >
              <PiPlusBold className="me-1.5 h-4 w-4" />
              Add State
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {stateFields.map((stateField, stateIndex) => (
              <StateFieldGroup
                key={stateField.id}
                control={control}
                register={register}
                stateIndex={stateIndex}
                errors={errors}
                onRemove={() => removeState(stateIndex)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditMode ? 'Update Configuration' : 'Create Configuration'}
        </Button>
      </div>
    </form>
  );
}

// State Field Group Component
function StateFieldGroup({
  control,
  register,
  stateIndex,
  errors,
  onRemove,
}: {
  control: any;
  register: any;
  stateIndex: number;
  errors: any;
  onRemove: () => void;
}) {
  const {
    fields: cityFields,
    append: appendCity,
    remove: removeCity,
  } = useFieldArray({
    control,
    name: `states.${stateIndex}.cities`,
  });

  const {
    fields: lgaFields,
    append: appendLGA,
    remove: removeLGA,
  } = useFieldArray({
    control,
    name: `states.${stateIndex}.lgas`,
  });

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="mb-4 flex items-center justify-between">
        <Text className="font-semibold">State #{stateIndex + 1}</Text>
        <ActionIcon
          size="sm"
          variant="outline"
          color="danger"
          onClick={onRemove}
        >
          <PiTrashDuotone className="h-4 w-4" />
        </ActionIcon>
      </div>

      {/* State Basic Info */}
      <div className="mb-6 grid gap-4 grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium">
            State Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register(`states.${stateIndex}.name`)}
            placeholder="e.g., Lagos"
            error={errors.states?.[stateIndex]?.name?.message}
          />
        </div>

        

        <div>
          <label className="mb-2 block text-sm font-medium">
            Fallback Price (₦)
          </label>
          <Input
            type="number"
            {...register(`states.${stateIndex}.fallbackPrice`, {
              valueAsNumber: true,
            })}
            placeholder="0"
            error={errors.states?.[stateIndex]?.fallbackPrice?.message}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Fallback ETA (days)
          </label>
          <Input
            type="number"
            {...register(`states.${stateIndex}.fallbackEtaDays`, {
              valueAsNumber: true,
            })}
            placeholder="0"
            error={errors.states?.[stateIndex]?.fallbackEtaDays?.message}
          />
        </div>
      </div>

      {/* Cities Section */}
      <div className="mb-4 rounded-lg bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <Text className="font-medium">Cities</Text>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendCity({ name: '', price: undefined as unknown as number, etaDays: undefined as unknown as number })
            }
          >
            <PiPlusBold className="me-1 h-3 w-3" />
            Add City
          </Button>
        </div>

        {cityFields.length === 0 ? (
          <Text className="text-center text-sm text-gray-500">
            No cities added
          </Text>
        ) : (
          <div className="space-y-3">
            {/* Header row - only once at the top */}
            <div className="hidden @lg:grid @lg:grid-cols-4 @lg:gap-2">
              <Text className="text-xs font-medium text-gray-500">City name</Text>
              <Text className="text-xs font-medium text-gray-500">Price (₦)</Text>
              <Text className="text-xs font-medium text-gray-500">ETA (days)</Text>
              <Text className="text-xs font-medium text-gray-500">Action</Text>
            </div>
            {cityFields.map((cityField, cityIndex) => (
              <div key={cityField.id} className="grid gap-2 @lg:grid-cols-4">
                <Input
                  {...register(`states.${stateIndex}.cities.${cityIndex}.name`)}
                  placeholder="City name"
                  size="sm"
                  className="w-full"
                />
                
                <Input
                  type="number"
                  {...register(`states.${stateIndex}.cities.${cityIndex}.price`, {
                    setValueAs: (v: any) => (v === '' || v === null ? undefined : Number(v)),
                  })}
                  placeholder="Price"
                  size="sm"
                  className="w-full"
                />
                <Input
                  type="number"
                  {...register(`states.${stateIndex}.cities.${cityIndex}.etaDays`, {
                    setValueAs: (v: any) => (v === '' || v === null ? undefined : Number(v)),
                  })}
                  placeholder="ETA"
                  size="sm"
                  className="w-full"
                />
                <ActionIcon
                  size="sm"
                  variant="outline"
                  color="danger"
                  onClick={() => removeCity(cityIndex)}
                >
                  <PiTrashDuotone className="h-4 w-4" />
                </ActionIcon>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LGAs Section */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <Text className="font-medium">Local Government Areas (LGAs)</Text>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              appendLGA({ name: '', price: undefined as unknown as number, etaDays: undefined as unknown as number })
            }
          >
            <PiPlusBold className="me-1 h-3 w-3" />
            Add LGA
          </Button>
        </div>

        {lgaFields.length === 0 ? (
          <Text className="text-center text-sm text-gray-500">
            No LGAs added
          </Text>
        ) : (
          <div className="space-y-3">
            {/* Header row - only once at the top */}
            <div className="hidden @lg:grid @lg:grid-cols-4 @lg:gap-2">
              <Text className="text-xs font-medium text-gray-500">LGA name</Text>
              <Text className="text-xs font-medium text-gray-500">Price (₦)</Text>
              <Text className="text-xs font-medium text-gray-500">ETA (days)</Text>
              <Text className="text-xs font-medium text-gray-500">Action</Text>
            </div>
            {lgaFields.map((lgaField, lgaIndex) => (
              <div key={lgaField.id} className="grid gap-2 @lg:grid-cols-4">
                <Input
                  {...register(`states.${stateIndex}.lgas.${lgaIndex}.name`)}
                  placeholder="LGA name"
                  size="sm"
                  className="w-full"
                />
                
                <Input
                  type="number"
                  {...register(`states.${stateIndex}.lgas.${lgaIndex}.price`, {
                    setValueAs: (v: any) => (v === '' || v === null ? undefined : Number(v)),
                  })}
                  placeholder="Price"
                  size="sm"
                  className="w-full"
                />
                <Input
                  type="number"
                  {...register(`states.${stateIndex}.lgas.${lgaIndex}.etaDays`, {
                    setValueAs: (v: any) => (v === '' || v === null ? undefined : Number(v)),
                  })}
                  placeholder="ETA"
                  size="sm"
                  className="w-full"
                />
                <ActionIcon
                  size="sm"
                  variant="outline"
                  color="danger"
                  onClick={() => removeLGA(lgaIndex)}
                >
                  <PiTrashDuotone className="h-4 w-4" />
                </ActionIcon>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
