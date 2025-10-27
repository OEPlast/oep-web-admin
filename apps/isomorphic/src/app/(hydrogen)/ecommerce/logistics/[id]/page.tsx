'use client';

import { useParams, useRouter } from 'next/navigation';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import {
  useLogisticsCountries,
  useLogisticsCountry,
  useDeleteCountry,
} from '@/hooks/use-logistics';
import { Loader, Text, Button, Badge } from 'rizzui';
import { PiNotePencilDuotone, PiTrashDuotone } from 'react-icons/pi';
import DeletePopover from '@core/components/delete-popover';
import cn from '@core/utils/class-names';

export default function LogisticsConfigDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const configId = params.id as string;

  const { data: countries = [] } = useLogisticsCountries();
  const country = countries.find((c) => c._id === configId);

  const {
    data: config,
    isLoading,
    error,
  } = useLogisticsCountry(country?.countryName || '', { enabled: !!country });

  const deleteCountry = useDeleteCountry(() => {
  router.push(routes.eCommerce.logistics.home);
  });

  const pageHeader = {
    title: config?.countryName || 'Loading...',
    breadcrumb: [
      {
  href: routes.eCommerce.logistics.home,
        name: 'Logistics',
      },
      {
        name: config?.countryName || 'Details',
      },
    ],
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Loading..." breadcrumb={pageHeader.breadcrumb} />
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader variant="spinner" size="xl" />
        </div>
      </>
    );
  }

  if (error || !config) {
    return (
      <>
        <PageHeader title="Error" breadcrumb={pageHeader.breadcrumb} />
        <div className="flex min-h-[400px] items-center justify-center">
          <Text className="text-red-500">
            {error?.message || 'Configuration not found'}
          </Text>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <Button
            variant="outline"
            onClick={() => router.push(routes.eCommerce.logistics.editConfig(configId))}
          >
            <PiNotePencilDuotone className="me-1.5 h-[17px] w-[17px]" />
            Edit
          </Button>
          <DeletePopover
            title="Delete Country"
            description={`Are you sure you want to delete ${config.countryName}? This will remove all associated states, cities, and pricing data.`}
            onDelete={() => deleteCountry.mutate(configId)}
          />
        </div>
      </PageHeader>

      <div className="@container">
        <div className="grid gap-6 @4xl:grid-cols-2">
          {/* Country Info Card */}
          <div className="rounded-lg border border-muted p-6">
            <h3 className="mb-4 text-lg font-semibold">Country Information</h3>
            <div className="space-y-3">
              <div>
                <Text className="text-sm text-gray-500">Country Code</Text>
                <Text className="font-semibold">{config.countryCode}</Text>
              </div>
              <div>
                <Text className="text-sm text-gray-500">Country Name</Text>
                <Text className="font-semibold">{config.countryName}</Text>
              </div>
              <div>
                <Text className="text-sm text-gray-500">Total States</Text>
                <Text className="font-semibold">{config.states.length}</Text>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="rounded-lg border border-muted p-6">
            <h3 className="mb-4 text-lg font-semibold">Statistics</h3>
            <div className="space-y-3">
              <div>
                <Text className="text-sm text-gray-500">Total Cities</Text>
                <Text className="font-semibold">
                  {config.states.reduce(
                    (acc, state) => acc + (state.cities?.length || 0),
                    0
                  )}
                </Text>
              </div>
              <div>
                <Text className="text-sm text-gray-500">Total LGAs</Text>
                <Text className="font-semibold">
                  {config.states.reduce(
                    (acc, state) => acc + (state.lgas?.length || 0),
                    0
                  )}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* States List */}
        <div className="mt-6 rounded-lg border border-muted p-6">
          <h3 className="mb-4 text-lg font-semibold">States & Pricing</h3>
          {config.states.length === 0 ? (
            <Text className="text-center text-gray-500">
              No states configured yet. Click Edit to add states.
            </Text>
          ) : (
            <div className="grid grid-cols-1 gap-4 w-full">
              {config.states.map((state, index) => (
                <div key={index} className="rounded-lg border border-gray-200 p-4">
                  {/* State header */}
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <Text className="font-semibold uppercase">{state.name}</Text>
                    <div className="text-right">
                      <div className="flex flex-col items-end gap-1">
                        <div>
                          <Text className="text-sm text-gray-500">Fallback Price</Text>
                          <Text className="font-semibold">
                            {typeof state.fallbackPrice === 'number'
                              ? `₦${state.fallbackPrice.toLocaleString()}`
                              : '—'}
                          </Text>
                        </div>
                        <div>
                          <Text className="text-sm text-gray-500">Fallback ETA (days)</Text>
                          <Text className="font-semibold">
                            {typeof (state as any).fallbackEtaDays === 'number' ? `${(state as any).fallbackEtaDays}` : '—'}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cities */}
                  {state.cities && state.cities.length > 0 && (
                    <div className="mb-4">
                      <Text className="mb-2 text-sm font-medium text-gray-700">
                        Cities ({state.cities.length})
                      </Text>
                      <div className="overflow-x-auto">
                        <div className="max-h-64 w-full overflow-y-auto rounded-md border border-gray-200">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 z-10 bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">City</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">Price</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">ETA (days)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {state.cities.map((city, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium">
                                    <span className="truncate" title={city.name}>{city.name}</span>
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {typeof city.price === 'number' ? `₦${city.price.toLocaleString()}` : '—'}
                                  </td>
                                  <td className="px-3 py-2 text-gray-500">
                                    {typeof city.etaDays === 'number' ? `${city.etaDays}` : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LGAs */}
                  {state.lgas && state.lgas.length > 0 && (
                    <div>
                      <Text className="mb-2 text-sm font-medium text-gray-700">
                        LGAs ({state.lgas.length})
                      </Text>
                      <div className="overflow-x-auto">
                        <div className="max-h-64 w-full overflow-y-auto rounded-md border border-gray-200">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 z-10 bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">LGA</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">Price</th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">ETA (days)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {state.lgas.map((lga, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium">
                                    <span className="truncate" title={lga.name}>{lga.name}</span>
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">
                                    {typeof lga.price === 'number' ? `₦${lga.price.toLocaleString()}` : '—'}
                                  </td>
                                  <td className="px-3 py-2 text-gray-500">
                                    {typeof lga.etaDays === 'number' ? `${lga.etaDays}` : '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
