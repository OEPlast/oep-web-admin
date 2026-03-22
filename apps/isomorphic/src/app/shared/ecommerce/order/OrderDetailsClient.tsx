'use client';

import { Alert, Text, Badge } from 'rizzui';
import { useOrderById } from '@/hooks/queries/useOrders';
import { handleApiError } from '@/libs/axios';

interface OrderDetailsClientProps {
  id: string;
}

// Define interfaces for the actual API response structure
interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  quantity: number;
  price: number;
  attributes: any[];
  sale: any;
  saleDiscount: number;
}

interface TrackingHistory {
  _id: string;
  location: string;
  timestamp: string;
  description: string;
}

export default function OrderDetailsClient({ id }: OrderDetailsClientProps) {
  const { data: order, isLoading, error, isError } = useOrderById(id);

  if (isLoading) return <div className="p-6">Loading order...</div>;
  if (isError)
    return (
      <Alert color="danger" className="mb-4">
        <strong>Error:</strong> {handleApiError(error)}
      </Alert>
    );
  if (!order) return <div className="p-6">Order not found</div>;

  // Helper to get payment status badge
  const getPaymentStatusBadge = () => {
    if (order.isPaid) {
      return <Badge color="success">Paid</Badge>;
    }
    return <Badge color="warning">Unpaid</Badge>;
  };

  // Helper to get order status badge
  const getOrderStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: any; label: string }> = {
      Pending: { color: 'warning', label: 'Pending' },
      Processing: { color: 'info', label: 'Processing' },
      Shipped: { color: 'secondary', label: 'Shipped' },
      Delivered: { color: 'success', label: 'Delivered' },
      Cancelled: { color: 'danger', label: 'Cancelled' },
    };
    const statusInfo = statusMap[status] || { color: 'default', label: status };
    return <Badge color={statusInfo.color}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <Text className="text-2xl font-bold">Order #{order.orderNumber}</Text>
          <Text className="text-sm text-gray-600">
            {new Date(order.createdAt).toLocaleString()}
          </Text>
        </div>
        <div className="flex gap-2">
          {getOrderStatusBadge(order.status)}
          {getPaymentStatusBadge()}
        </div>
      </div>

      {/* Customer Info */}
      <div className="rounded-lg border p-4">
        <Text className="mb-3 text-lg font-semibold">Customer Information</Text>
        <div className="space-y-2">
          {order.user.name && (
            <div>
              <Text className="text-sm text-gray-600">Name:</Text>
              <Text className="font-medium">{order.user.name}</Text>
            </div>
          )}
          <div>
            <Text className="text-sm text-gray-600">Email:</Text>
            <Text className="font-medium">{order.user.email}</Text>
          </div>
          {order.contact?.phone && (
            <div>
              <Text className="text-sm text-gray-600">Phone:</Text>
              <Text className="font-medium">{order.contact.phone}</Text>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="rounded-lg border p-4">
        <Text className="mb-3 text-lg font-semibold">Order Items</Text>
        <div className="space-y-3">
          {order.products &&
            order.products.map((product: ProductItem) => (
              <div
                key={product._id}
                className="flex items-center gap-4 border-b pb-3 last:border-b-0"
              >
                {product.image && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || ''}/${product.image}`}
                    alt={product.name}
                    className="h-16 w-16 rounded object-cover"
                  />
                )}
                <div className="flex-1">
                  <Text className="font-medium">{product.name}</Text>
                  <Text className="text-sm text-gray-600">
                    Quantity: {product.quantity}
                  </Text>
                  {product.attributes && product.attributes.length > 0 && (
                    <Text className="text-sm text-gray-600">
                      {product.attributes
                        .map((attr: any) => `${attr.key}: ${attr.value}`)
                        .join(', ')}
                    </Text>
                  )}
                </div>
                <div className="text-right">
                  <Text className="font-medium">
                    ₦{product.price.toLocaleString()}
                  </Text>
                  {product.saleDiscount > 0 && (
                    <Text className="text-sm text-green-600">
                      -₦{product.saleDiscount.toLocaleString()}
                    </Text>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      {/* Pricing Breakdown */}
      <div className="rounded-lg border p-4">
        <Text className="mb-3 text-lg font-semibold">Pricing Summary</Text>
        <div className="space-y-2">
          {/* Check !== undefined instead of truthy */}
          {order.totalBeforeDiscount !== undefined && (
            <div className="flex justify-between">
              <Text className="text-gray-600">Subtotal:</Text>
              <Text className="font-medium">
                ₦{order.totalBeforeDiscount.toLocaleString()}
              </Text>
            </div>
          )}

          {/* Only show coupon if discount > 0 AND code exists */}
          {order.coupon?.code && order.couponDiscount! > 0 && (
            <div className="flex justify-between text-green-600">
              <Text>Coupon ({order.coupon.code}):</Text>
              <Text className="font-medium">
                -₦{order.couponDiscount!.toLocaleString()}
              </Text>
            </div>
          )}

          {/* Check !== undefined instead of truthy */}
          {order.shippingPrice !== undefined && (
            <div className="flex justify-between">
              <Text className="text-gray-600">Shipping:</Text>
              <Text className="font-medium">
                ₦{order.shippingPrice.toLocaleString()}
              </Text>
            </div>
          )}

          {/* Tax only shows if > 0 (this condition is correct) */}
          {order.taxPrice !== undefined && order.taxPrice > 0 && (
            <div className="flex justify-between">
              <Text className="text-gray-600">Tax:</Text>
              <Text className="font-medium">
                ₦{order.taxPrice.toLocaleString()}
              </Text>
            </div>
          )}

          {/* Check !== undefined instead of truthy */}
          {order.total !== undefined && (
            <div className="flex justify-between border-t pt-2 font-bold">
              <Text>Total:</Text>
              <Text>₦{order.total.toLocaleString()}</Text>
            </div>
          )}
        </div>
      </div>

      {/* Shipping & Billing Addresses */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Shipping Address */}
        <div className="rounded-lg border p-4">
          <Text className="mb-3 text-lg font-semibold">Shipping Address</Text>
          {order.shippingAddress ? (
            <div className="space-y-1">
              <Text className="font-medium">
                {order.shippingAddress.firstName}{' '}
                {order.shippingAddress.lastName}
              </Text>
              <Text className="text-sm text-gray-600">
                {order.shippingAddress.phoneNumber}
              </Text>
              <Text className="text-sm text-gray-600">
                {order.shippingAddress.address1}
              </Text>
              {order.shippingAddress.address2 && (
                <Text className="text-sm text-gray-600">
                  {order.shippingAddress.address2}
                </Text>
              )}
              <Text className="text-sm text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </Text>
              <Text className="text-sm text-gray-600">
                {order.shippingAddress.country}
              </Text>
              {order.shippingAddress.lga && (
                <Text className="text-sm text-gray-600">
                  LGA: {order.shippingAddress.lga}
                </Text>
              )}
            </div>
          ) : (
            <Text className="font-medium">PICKUP</Text>
          )}
        </div>

        {/* Billing Address */}
        {order.billingAddress && (
          <div className="rounded-lg border p-4">
            <Text className="mb-3 text-lg font-semibold">Billing Address</Text>
            <div className="space-y-1">
              <Text className="font-medium">
                {order.billingAddress.firstName} {order.billingAddress.lastName}
              </Text>
              <Text className="text-sm text-gray-600">
                {order.billingAddress.phoneNumber}
              </Text>
              <Text className="text-sm text-gray-600">
                {order.billingAddress.address1}
              </Text>
              {order.billingAddress.address2 && (
                <Text className="text-sm text-gray-600">
                  {order.billingAddress.address2}
                </Text>
              )}
              <Text className="text-sm text-gray-600">
                {order.billingAddress.city}, {order.billingAddress.state}{' '}
                {order.billingAddress.zipCode}
              </Text>
              <Text className="text-sm text-gray-600">
                {order.billingAddress.country}
              </Text>
              {order.billingAddress.lga && (
                <Text className="text-sm text-gray-600">
                  LGA: {order.billingAddress.lga}
                </Text>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment & Transaction Info */}
      {order.transaction && (
        <div className="rounded-lg border p-4">
          <Text className="mb-3 text-lg font-semibold">
            Payment Information
          </Text>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text className="text-gray-600">Payment Method:</Text>
              <Text className="font-medium capitalize">
                {order.transaction.paymentMethod}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-gray-600">Gateway:</Text>
              <Text className="font-medium capitalize">
                {order.transaction.paymentGateway}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-gray-600">Reference:</Text>
              <Text className="font-medium">{order.transaction.reference}</Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-gray-600">Amount:</Text>
              <Text className="font-medium">
                ₦{order.transaction.amount.toLocaleString()}
              </Text>
            </div>
            <div className="flex justify-between">
              <Text className="text-gray-600">Status:</Text>
              <Badge
                color={
                  order.transaction.status === 'completed'
                    ? 'success'
                    : 'warning'
                }
              >
                {order.transaction.status}
              </Badge>
            </div>
            {order.transaction.paidAt && (
              <div className="flex justify-between">
                <Text className="text-gray-600">Paid At:</Text>
                <Text className="font-medium">
                  {new Date(order.transaction.paidAt).toLocaleString()}
                </Text>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery Type */}
      <div className="rounded-lg border p-4">
        <Text className="mb-2 font-semibold">Delivery Type</Text>
        <Badge className="capitalize">{order.deliveryType}</Badge>
      </div>

      {/* GIG Logistics Tracking */}
      {order.deliveryType === 'gig' && order.gigWaybill && (
        <div className="rounded-lg border p-4">
          <Text className="mb-3 text-lg font-semibold">GIG Logistics</Text>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Text className="text-gray-600">Waybill Number:</Text>
              <Text className="font-mono font-medium">{order.gigWaybill}</Text>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
