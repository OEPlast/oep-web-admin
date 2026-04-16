'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { QRCodeSVG } from 'qrcode.react';
import { Badge, Title, Text } from 'rizzui';
import Table from '@core/components/legacy-table';
import { siteConfig } from '@/config/site.config';
import { InvoiceFormInput } from '@/validators/create-invoice.schema';

interface InvoicePreviewProps {
  formData: InvoiceFormInput;
  orderId?: string | null;
  deliveryType: 'shipping' | 'pickup';
}

const columns = [
  {
    title: '#',
    dataIndex: 'id',
    key: 'id',
    width: 50,
    render: (_: any, __: any, index: number) => <Text>{index + 1}</Text>,
  },
  {
    title: 'Item',
    dataIndex: 'item',
    key: 'item',
    width: 250,
    render: (item: string, record: any) => (
      <>
        <Title as="h6" className="mb-0.5 text-sm font-medium">
          {item}
        </Title>
        {record.description && (
          <Text
            as="p"
            className="max-w-[250px] overflow-hidden truncate text-sm text-gray-500"
          >
            {record.description}
          </Text>
        )}
      </>
    ),
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 100,
  },
  {
    title: 'Unit Price',
    dataIndex: 'price',
    key: 'price',
    width: 150,
    render: (value: number) => (
      <Text className="font-medium">₦{value.toLocaleString()}</Text>
    ),
  },
  {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
    width: 150,
    render: (_: any, record: any) => {
      const total = record.quantity * record.price;
      return <Text className="font-medium">₦{total.toLocaleString()}</Text>;
    },
  },
];

export default function InvoicePreview({
  formData,
  orderId,
  deliveryType,
}: InvoicePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  // Calculate subtotal
  const subtotal = formData.items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // Calculate total
  const total =
    subtotal +
    (formData.shipping || 0) +
    (formData.taxes || 0) -
    (formData.discount || 0);

  console.log(total);

  // Prepare items for table with id
  const tableItems = formData.items.map((item, index) => ({
    ...item,
    id: index + 1,
  }));

  // QR code URL - only show if orderId exists
  const qrCodeUrl = orderId
    ? `${process.env.NEXT_PUBLIC_STOREFRONT_URL || 'http://localhost:3009'}/my-account/orders/${orderId}`
    : null;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          /* Hide everything except the invoice */
          body * {
            visibility: hidden;
          }

          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible;
          }

          #invoice-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          /* Hide navigation, headers, footers, buttons */
          header,
          nav,
          footer,
          .no-print,
          button {
            display: none !important;
          }

          /* Ensure proper page breaks */
          @page {
            margin: 1cm;
          }

          /* Prevent page breaks inside elements */
          table,
          .invoice-section {
            page-break-inside: avoid;
          }
        }
      `,
        }}
      />

      <div
        id="invoice-print-area"
        ref={printRef}
        className="w-full rounded-xl border border-muted p-5 text-sm sm:p-6 lg:p-8 2xl:p-10"
      >
        <div className="mb-12 flex flex-col-reverse items-start justify-between md:mb-16 md:flex-row">
          {/* <Image
            src={siteConfig.logo}
            alt={siteConfig.title}
            className="h-auto w-[100px] dark:invert"
            priority
          /> */}
          <h1 className="text-xl font-extrabold tracking-wide">{`Olu Executive Plastics 'n Essentials`}</h1>
          <div className="mb-4 md:mb-0">
            <Badge
              variant="flat"
              color={formData.status === 'Paid' ? 'success' : 'warning'}
              rounded="md"
              className="mb-3 md:mb-2"
            >
              {formData.status}
            </Badge>
            <Title as="h6">INV - {formData.invoiceNumber}</Title>
            <Text className="mt-0.5 text-gray-500">Invoice Number</Text>
          </div>
        </div>

        <div className="mb-12 grid gap-4 xs:grid-cols-2 sm:grid-cols-3 sm:grid-rows-1">
          {/* From Section */}
          <div className="">
            <Title as="h6" className="mb-3.5 font-semibold">
              From
            </Title>
            <Text className="mb-1.5 text-sm font-semibold uppercase">
              OEP, INC
            </Text>
            <Text className="mb-1.5">
              No 1, Abule ojo busstop <br /> Lagos
            </Text>
            <Text className="mb-4 sm:mb-6 md:mb-8">{`+2348028299167`}</Text>
            <div>
              <Text className="mb-2 text-sm font-semibold">Creation Date</Text>
              <Text>
                {formData.createDate
                  ? new Date(formData.createDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </Text>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="mt-4 xs:mt-0">
            <Title as="h6" className="mb-3.5 font-semibold">
              Bill To
            </Title>
            <Text className="mb-1.5 text-sm font-semibold uppercase">
              {formData.toName || 'N/A'}
            </Text>
            {deliveryType === 'shipping' ? (
              <>
                <Text className="mb-1.5">{formData.toAddress || 'N/A'}</Text>
                {formData.toPhone && (
                  <Text className="mb-4 sm:mb-6 md:mb-8">
                    {formData.toPhone}
                  </Text>
                )}
              </>
            ) : null}
          </div>

          {/* QR Code Section - Only show if orderId exists */}
          {qrCodeUrl && (
            <div className="mt-4 flex sm:mt-6 md:mt-0 md:justify-end">
              <QRCodeSVG
                value={qrCodeUrl}
                className="h-28 w-28 lg:h-32 lg:w-32"
              />
            </div>
          )}
        </div>

        {/* Items Table */}
        <Table
          data={tableItems}
          columns={columns}
          variant="minimal"
          rowKey={(record: any) => record.id}
          scroll={{ x: 660 }}
          className="mb-11"
        />

        {/* Summary Section */}
        <div className="flex flex-col-reverse items-start justify-between border-t border-muted pb-4 pt-8 xs:flex-row">
          <div className="mt-6 max-w-md pe-4 xs:mt-0">
            <Title
              as="h6"
              className="mb-1 text-xs font-semibold uppercase xs:mb-2 xs:text-sm"
            >
              Notes
            </Title>
            <Text className="leading-[1.7]">
              Thank you for your business. Should you need any assistance,
              please contact us.
            </Text>
          </div>
          <div className="w-full max-w-sm">
            <Text className="flex items-center justify-between border-b border-muted pb-3.5 lg:pb-5">
              Subtotal:{' '}
              <Text as="span" className="font-semibold">
                ₦{subtotal.toLocaleString()}
              </Text>
            </Text>
            <Text className="flex items-center justify-between border-b border-muted py-3.5 lg:py-5">
              Shipping:{' '}
              <Text as="span" className="font-semibold">
                ₦{(formData.shipping || 0).toLocaleString()}
              </Text>
            </Text>
            <Text className="flex items-center justify-between border-b border-muted py-3.5 lg:py-5">
              Discount:{' '}
              <Text as="span" className="font-semibold">
                ₦{(formData.discount || 0).toLocaleString()}
              </Text>
            </Text>
            <Text className="flex items-center justify-between border-b border-muted py-3.5 lg:py-5">
              Taxes:
              <Text as="span" className="font-semibold">
                ₦{(formData.taxes || 0).toLocaleString()}
              </Text>
            </Text>
            <Text className="flex items-center justify-between pt-4 text-base font-semibold text-gray-900 lg:pt-5">
              Total: <Text as="span">₦{total.toLocaleString()}</Text>
            </Text>
          </div>
        </div>
      </div>
    </>
  );
}
