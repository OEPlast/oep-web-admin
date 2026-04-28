'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SubmitHandler, Controller } from 'react-hook-form';
import { Form } from '@core/ui/form';
import { Text, Input, Select, Textarea, Alert, Loader } from 'rizzui';
import { PhoneNumber } from '@core/ui/phone-input';
import { DatePicker } from '@core/ui/datepicker';
import {
  FormBlockWrapper,
  statusOptions,
  renderOptionDisplayValue,
} from '@/app/shared/invoice/form-utils';
import { AddInvoiceItems } from '@/app/shared/invoice/add-invoice-items';
import FormFooter from '@core/components/form-footer';
import { toast } from 'react-hot-toast';
import {
  InvoiceFormInput,
  invoiceFormSchema,
} from '@/validators/create-invoice.schema';
import { useOrderById } from '@/hooks/queries/useOrders';
import InvoicePreview from '@/app/shared/invoice/invoice-preview';

const invoiceItems = [{ item: '', description: '', quantity: 1, price: 0 }];

export default function CreateInvoice({
  id,
  record,
}: {
  id?: string;
  record?: InvoiceFormInput;
}) {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [reset, setReset] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'shipping' | 'pickup'>(
    'shipping'
  );
  const [isPreview, setIsPreview] = useState(false);

  // Fetch order data if orderId is present
  const {
    data: orderData,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
  } = useOrderById(orderId || '', {
    enabled: !!orderId,
  });

  // Update delivery type when order data changes
  useEffect(() => {
    if (orderData) {
      const deliveryTypeValue =
        (orderData.deliveryType as 'shipping' | 'pickup' | undefined) ||
        'shipping';
      setDeliveryType(deliveryTypeValue);
    }
  }, [orderData]);

  // Generate UUID for manual invoices
  const [manualInvoiceNumber] = useState(() => {
    if (typeof window !== 'undefined' && window.crypto) {
      return crypto.randomUUID();
    }
    // Fallback UUID v4 generation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  });

  const onSubmit: SubmitHandler<InvoiceFormInput> = (data) => {
    // No backend submission - form is for preview/print only
  };

  const newItems = record?.items
    ? record.items.map((item) => ({
        ...item,
        price: item.price ?? 0,
      }))
    : invoiceItems;

  // Transform order data to invoice form data when order is loaded
  const getDefaultValues = (): Partial<InvoiceFormInput> => {
    if (orderData && orderId) {
      // Map order data to invoice form
      const deliveryTypeValue = orderData.deliveryType || 'shipping';

      // From fields (shipping address if available, else "Pickup")
      let fromName = '';
      let fromAddress = '';
      let fromPhone = '';

      if (deliveryTypeValue === 'shipping' && orderData.shippingAddress) {
        fromName =
          `${orderData.shippingAddress.firstName || ''} ${orderData.shippingAddress.lastName || ''}`.trim();
        fromAddress = [
          orderData.shippingAddress.address1,
          orderData.shippingAddress.address2,
          orderData.shippingAddress.city,
          orderData.shippingAddress.state,
          orderData.shippingAddress.country,
          orderData.shippingAddress.zipCode,
        ]
          .filter(Boolean)
          .join(', ');
        fromPhone = orderData.shippingAddress.phoneNumber || '';
      } else {
        // Pickup order
        fromName = orderData.contact?.name || '';
        fromAddress = 'Pickup';
        fromPhone = orderData.contact?.phone || '';
      }

      // To fields (customer/user info)
      const toName = orderData.contact?.name || '';
      const toAddress = orderData.shippingAddress
        ? [
            orderData.shippingAddress.address1,
            orderData.shippingAddress.address2,
            orderData.shippingAddress.city,
            orderData.shippingAddress.state,
            orderData.shippingAddress.country,
            orderData.shippingAddress.zipCode,
          ]
            .filter(Boolean)
            .join(', ')
        : '';
      const toPhone =
        orderData.contact?.phone ||
        orderData.shippingAddress?.phoneNumber ||
        '';

      // Map products to invoice items
      const items =
        orderData?.products?.map((product) => ({
          item: product.name,
          description:
            product.attributes
              ?.map((attr) => `${attr.name}: ${attr.value}`)
              .join(', ') || '',
          quantity: product.quantity,
          price: product.price,
        })) ?? [];

      return {
        fromName,
        fromAddress,
        fromPhone,
        toName,
        toAddress,
        toPhone,
        invoiceNumber: orderId,
        createDate: new Date(),
        status: 'Paid',
        shipping: orderData.shippingPrice || 0,
        discount: orderData.couponDiscount || 0,
        taxes: orderData.taxPrice || 0,
        items: items.length > 0 ? items : invoiceItems,
      };
    }

    // Manual invoice creation
    return {
      ...record,
      invoiceNumber: manualInvoiceNumber,
      createDate: new Date(),
      items: newItems,
    };
  };

  // Show loading state while fetching order
  if (orderId && isOrderLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  // Show error if order fetch failed
  if (orderId && isOrderError) {
    return (
      <Alert color="danger" className="mb-4">
        <Text className="font-semibold">Failed to load order</Text>
        <Text className="mt-1 text-sm">
          {orderError instanceof Error
            ? orderError.message
            : 'Could not fetch order details. Please try again.'}
        </Text>
      </Alert>
    );
  }

  return (
    <Form<InvoiceFormInput>
      validationSchema={invoiceFormSchema}
      resetValues={reset}
      onSubmit={onSubmit}
      useFormProps={{
        defaultValues: getDefaultValues(),
      }}
      className="flex flex-grow flex-col @container [&_label]:font-medium"
    >
      {({ register, control, watch, formState: { errors } }) => {
        const formData = watch();

        return (
          <>
            {!isPreview && (
              <div className="flex-grow pb-10">
                <div className="grid grid-cols-1 gap-8 divide-y divide-dashed divide-gray-200 @2xl:gap-10 @3xl:gap-12">
                  <FormBlockWrapper
                    title={'From:'}
                    description={'From who is sending this invoice'}
                  >
                    <Input
                      label="Name"
                      placeholder="Enter your name"
                      {...register('fromName')}
                      error={errors.fromName?.message}
                    />
                    <Controller
                      name="fromPhone"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <PhoneNumber
                          label="Phone Number"
                          country="ng"
                          value={value}
                          onChange={onChange}
                        />
                      )}
                    />
                    <Textarea
                      label="Address"
                      placeholder="Enter your address"
                      {...register('fromAddress')}
                      error={errors.fromAddress?.message}
                      textareaClassName="h-20"
                      className="col-span-2"
                    />
                  </FormBlockWrapper>

                  <FormBlockWrapper
                    title={'To:'}
                    description={'To who will receive this invoice'}
                    className="pt-7 @2xl:pt-9 @3xl:pt-11"
                  >
                    <Input
                      label="Name"
                      placeholder="Enter your name"
                      {...register('toName')}
                      error={errors.toName?.message}
                    />
                    <Controller
                      name="toPhone"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <PhoneNumber
                          label="Phone Number"
                          country="ng"
                          value={value}
                          onChange={onChange}
                        />
                      )}
                    />
                    <Textarea
                      label="Address"
                      placeholder="Enter your address"
                      {...register('toAddress')}
                      error={errors.toAddress?.message}
                      textareaClassName="h-20"
                      className="col-span-2"
                    />
                  </FormBlockWrapper>

                  <FormBlockWrapper
                    title={'Schedule:'}
                    description={'To he who will receive this invoice'}
                    className="pt-7 @2xl:pt-9 @3xl:pt-11"
                  >
                    <div className="col-span-2 grid grid-cols-1 items-baseline gap-5 @lg:grid-cols-2 @5xl:grid-cols-4">
                      <Input
                        label="Invoice Number"
                        placeholder="Enter invoice number"
                        {...register('invoiceNumber')}
                        readOnly
                        error={errors.invoiceNumber?.message}
                      />
                      <div className="[&>.react-datepicker-wrapper]:w-full">
                        <Controller
                          name="createDate"
                          control={control}
                          render={({ field: { value, onChange } }) => (
                            <DatePicker
                              inputProps={{ label: 'Date Create' }}
                              placeholderText="Select Date"
                              selected={value}
                              onChange={onChange}
                            />
                          )}
                        />
                      </div>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field: { name, onChange, value } }) => (
                          <Select
                            dropdownClassName="!z-10 h-auto"
                            inPortal={false}
                            options={statusOptions}
                            value={value}
                            onChange={onChange}
                            name={name}
                            label="Status"
                            error={errors?.status?.message}
                            getOptionValue={(option) => option.value}
                            getOptionDisplayValue={(option) =>
                              renderOptionDisplayValue(option.value as string)
                            }
                            displayValue={(selected: string) =>
                              renderOptionDisplayValue(selected)
                            }
                          />
                        )}
                      />
                    </div>
                  </FormBlockWrapper>

                  <AddInvoiceItems
                    watch={watch}
                    control={control}
                    register={register}
                    errors={errors}
                  />
                </div>
              </div>
            )}

            {isPreview && (
              <div className="flex-grow pb-10">
                <InvoicePreview
                  formData={formData}
                  orderId={orderId}
                  deliveryType={deliveryType}
                />
              </div>
            )}

            {/* Custom footer with preview toggle */}
            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-4 py-4">
              {!isPreview ? (
                <button
                  type="button"
                  onClick={() => setIsPreview(true)}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  Preview & Print
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsPreview(false)}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  >
                    Close Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  >
                    Print
                  </button>
                </>
              )}
            </div>
          </>
        );
      }}
    </Form>
  );
}
