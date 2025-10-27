'use client';

import { useParams } from 'next/navigation';
import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import LogisticsConfigForm from '@/app/shared/logistics/config/logistics-form';
import { useLogisticsCountries } from '@/hooks/use-logistics';
import { Loader, Text } from 'rizzui';

const pageHeader = {
  title: 'Edit Logistics Configuration',
  breadcrumb: [
    {
  href: routes.eCommerce.logistics.home,
      name: 'Logistics',
    },
    {
      name: 'Edit',
    },
  ],
};

export default function EditLogisticsConfigPage() {
  const params = useParams();
  const configId = params.id as string;

  const { data: countries = [], isLoading } = useLogisticsCountries();

  // Find the country by ID
  const country = countries.find((c) => c._id === configId);

  if (isLoading) {
    return (
      <>
        <PageHeader
          title={pageHeader.title}
          breadcrumb={pageHeader.breadcrumb}
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader variant="spinner" size="xl" />
        </div>
      </>
    );
  }

  if (!country) {
    return (
      <>
        <PageHeader
          title={pageHeader.title}
          breadcrumb={pageHeader.breadcrumb}
        />
        <div className="flex min-h-[400px] items-center justify-center">
          <Text className="text-red-500">Country not found</Text>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <LogisticsConfigForm
        configId={configId}
        countryName={country.countryName}
      />
    </>
  );
}
