'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Input, Text, Switch, Loader } from 'rizzui';
import { useGIGConfig, useGIGStations } from '@/hooks/queries/useGIGConfig';
import { useUpdateGIGConfig } from '@/hooks/mutations/useGIGConfigMutation';
import { handleApiError } from '@/libs/axios';

const gigConfigSchema = z.object({
  senderName: z.string().min(1, 'Sender name is required'),
  senderPhoneNumber: z.string().min(1, 'Phone number is required'),
  senderAddress: z.string().min(1, 'Address is required'),
  senderLocality: z.string().optional().default(''),
  senderStationId: z.coerce.number().min(1, 'Station is required'),
  senderLatitude: z.coerce.number().optional().default(0),
  senderLongitude: z.coerce.number().optional().default(0),
  senderCountryCode: z.string().optional().default('NG'),
  customerCode: z.string().min(1, 'Customer code is required'),
  customerType: z.string().optional().default(''),
  vehicleType: z.string().optional().default('BIKE'),
  defaultPickUpOptions: z.string().optional().default(''),
  isActive: z.boolean().default(false),
});

type GIGConfigFormData = z.infer<typeof gigConfigSchema>;

export default function GIGConfigClient() {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: config,
    isLoading: isLoadingConfig,
    error: configError,
    isError: isConfigError,
    isSuccess: isConfigLoaded,
  } = useGIGConfig();

  const { data: stations, isLoading: isLoadingStations } = useGIGStations();

  const updateConfig = useUpdateGIGConfig({
    onSuccess: () => {
      setFormError(null);
    },
    onError: (error) => {
      setFormError(handleApiError(error));
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<GIGConfigFormData>({
    resolver: zodResolver(gigConfigSchema),
    defaultValues: {
      senderName: '',
      senderPhoneNumber: '',
      senderAddress: '',
      senderLocality: '',
      senderStationId: 4,
      senderLatitude: 0,
      senderLongitude: 0,
      senderCountryCode: 'NG',
      customerCode: '',
      customerType: '',
      vehicleType: 'BIKE',
      defaultPickUpOptions: '',
      isActive: false,
    },
  });

  const isActive = watch('isActive');

  // Populate form with existing config — only on first load, never on refetch
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (config && !hasInitialized.current) {
      hasInitialized.current = true;
      reset({
        senderName: config.senderName,
        senderPhoneNumber: config.senderPhoneNumber,
        senderAddress: config.senderAddress,
        senderLocality: config.senderLocality || '',
        senderStationId: config.senderStationId,
        senderLatitude: config.senderLatitude || 0,
        senderLongitude: config.senderLongitude || 0,
        senderCountryCode: config.senderCountryCode || 'NG',
        customerCode: config.customerCode,
        customerType: config.customerType || '',
        vehicleType: config.vehicleType || 'BIKE',
        defaultPickUpOptions: config.defaultPickUpOptions || '',
        isActive: config.isActive,
      });
    }
  }, [config, reset]);

  const onSubmit = (data: GIGConfigFormData) => {
    setFormError(null);
    updateConfig.mutate(data);
  };

  if (isLoadingConfig) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader size="xl" />
      </div>
    );
  }

  if (isConfigError && configError) {
    return (
      <Alert color="danger" className="m-6">
        <strong>Error loading GIG config:</strong> {handleApiError(configError)}
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Text className="text-2xl font-bold">GIG Logistics Configuration</Text>
        <Text className="text-sm text-gray-600">
          Configure your GIG Logistics sender details and shipping preferences.
        </Text>
      </div>

      {isConfigLoaded && !config && (
        <Alert color="info" className="mb-4">
          No configuration found. Fill in the form below to set up GIG
          Logistics.
        </Alert>
      )}

      {formError && (
        <Alert color="danger" className="mb-4">
          <strong>Error:</strong> {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <Text className="font-semibold">Enable GIG Logistics</Text>
              <Text className="text-sm text-gray-600">
                When enabled, customers can choose GIG as a shipping option at
                checkout.
              </Text>
            </div>
            <Switch
              checked={isActive}
              onChange={() => setValue('isActive', !isActive)}
            />
          </div>
        </div>

        {/* Sender Details */}
        <div className="rounded-lg border p-4">
          <Text className="mb-4 text-lg font-semibold">Sender Details</Text>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Sender Name"
              placeholder="Store name"
              {...register('senderName')}
              error={errors.senderName?.message}
            />
            <Input
              label="Phone Number"
              placeholder="+234..."
              {...register('senderPhoneNumber')}
              error={errors.senderPhoneNumber?.message}
            />
            <div className="md:col-span-2">
              <Input
                label="Address"
                placeholder="Full sender address"
                {...register('senderAddress')}
                error={errors.senderAddress?.message}
              />
            </div>
            <Input
              label="Locality"
              placeholder="Area/Locality"
              {...register('senderLocality')}
              error={errors.senderLocality?.message}
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Sender Station
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={watch('senderStationId')}
                onChange={(e) =>
                  setValue('senderStationId', Number(e.target.value), {
                    shouldValidate: true,
                  })
                }
              >
                {isLoadingStations ? (
                  <option>Loading stations...</option>
                ) : (
                  stations?.map((station) => (
                    <option key={station.StationId} value={station.StationId}>
                      {station.StationName} ({station.StateName})
                    </option>
                  ))
                )}
              </select>
              {errors.senderStationId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.senderStationId.message}
                </p>
              )}
            </div>
            <Input
              label="Country Code"
              placeholder="NG"
              {...register('senderCountryCode')}
              error={errors.senderCountryCode?.message}
            />
          </div>

          {/* Coordinates */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              {...register('senderLatitude', { valueAsNumber: true })}
              error={errors.senderLatitude?.message}
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              {...register('senderLongitude', { valueAsNumber: true })}
              error={errors.senderLongitude?.message}
            />
          </div>
        </div>

        {/* GIG Account */}
        <div className="rounded-lg border p-4">
          <Text className="mb-4 text-lg font-semibold">GIG Account</Text>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Customer Code"
              placeholder="ECO017121"
              {...register('customerCode')}
              error={errors.customerCode?.message}
            />
            <Input
              label="Customer Type"
              placeholder="Optional"
              {...register('customerType')}
              error={errors.customerType?.message}
            />
          </div>
        </div>

        {/* Shipment Defaults */}
        <div className="rounded-lg border p-4">
          <Text className="mb-4 text-lg font-semibold">Shipment Defaults</Text>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Vehicle Type
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                {...register('vehicleType')}
              >
                <option value="BIKE">Bike</option>
                <option value="VAN">Van</option>
                <option value="TRUCK">Truck</option>
              </select>
            </div>
            <Input
              label="Pick Up Options"
              placeholder="Optional"
              {...register('defaultPickUpOptions')}
              error={errors.defaultPickUpOptions?.message}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={updateConfig.isPending}
            disabled={updateConfig.isPending}
          >
            {updateConfig.isPending
              ? 'Saving...'
              : config
                ? 'Save Configuration'
                : 'Create Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
}
