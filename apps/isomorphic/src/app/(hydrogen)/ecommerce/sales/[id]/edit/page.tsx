import Link from 'next/link';
import { Metadata } from 'next';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import { metaObject } from '@/config/site.config';
import PageHeader from '@/app/shared/page-header';
import EditSales from '@/app/shared/ecommerce/sales/edit-sales';
import { salesData } from '@/data/sales-data';
import { CreateSalesInput } from '@/validators/create-sale.schema';
import { Text } from 'rizzui/typography';
// import CreateFlashSale from '@/app/shared/ecommerce/flash-sales/create-flash-sale'; // To be implemented

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = (await params).id;
  return metaObject(`Edit ${id}`);
}

const pageHeader = {
  title: 'Edit Flash Sale',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      href: routes.eCommerce.flashSales,
      name: 'Flash Sales',
    },
    {
      name: 'Edit',
    },
  ],
};

export default async function EditFlashSalePage({ params }: any) {
  const id = (await params).id;
  // Server-side fetch of sale data by ID (mock implementation)
  const saleId = id;
  const fetchedSale: (CreateSalesInput & { _id: string }) | null =
    id === 'sale_to_edit_123'
      ? {
          _id: id,
          title: 'Summer Discount Bonanza',
          type: 'Limited',
          product: salesData.find(
            (p) => p.product._id === '664fdf8a24fbb2a2c03eabe0'
          )!.product._id,
          campaign: '',
          limit: 50,
          deleted: false,
          startDate: new Date(new Date().setDate(new Date().getDate() - 5)),
          endDate: new Date(new Date().setDate(new Date().getDate() + 10)),
          variants: [
            {
              attributeName: 'Color',
              attributeValue: 'Black',
              discount: 15,
              maxBuys: 30,
              boughtCount: 5,
            },
            {
              attributeName: 'Color',
              attributeValue: 'White',
              discount: 10,
              maxBuys: 20,
              boughtCount: 2,
            },
          ],
          isActive: true,
        }
      : null;

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <Link
          href={routes.eCommerce.flashSales}
          className="mt-4 w-full @lg:mt-0 @lg:w-auto"
        >
          <Button as="span" className="w-full @lg:w-auto" variant="outline">
            Cancel
          </Button>
        </Link>
      </PageHeader>
      {!fetchedSale ? (
        <div className="p-6">
          <Text className="text-center text-red-500">Sale not found.</Text>
        </div>
      ) : (
        <EditSales saleId={saleId} initialSaleData={fetchedSale} />
      )}
    </>
  );
}
