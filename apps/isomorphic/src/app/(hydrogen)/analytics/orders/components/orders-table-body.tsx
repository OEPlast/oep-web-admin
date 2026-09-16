import { Badge, Text } from 'rizzui';
import { formatNumber } from '@core/utils/format-number';
import cn from '@core/utils/class-names';
import type { OrdersTableResponse } from '@/types/analytics.types';
import IdLink from '@/app/shared/id-link';
import { routes } from '@/config/routes';

interface OrdersTableBodyProps {
  orders: OrdersTableResponse['data'];
  isLoading?: boolean;
}

const getStatusBadgeColor = (
  status: string
): 'success' | 'warning' | 'info' | 'danger' | 'secondary' => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'processing':
      return 'info';
    case 'cancelled':
    case 'failed':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default function OrdersTableBody({
  orders,
  isLoading,
}: OrdersTableBodyProps) {
  if (isLoading) {
    return (
      <tbody>
        <tr>
          <td colSpan={5} className="px-4 py-8">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-primary"></div>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  if (orders.length === 0) {
    return (
      <tbody>
        <tr>
          <td colSpan={5} className="px-4 py-8 text-center">
            <Text className="text-gray-500">No orders found</Text>
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody>
      {orders.map((order, index) => (
        <tr
          key={order._id}
          className={cn(
            'border-b border-gray-100 transition-colors hover:bg-gray-50',
            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
          )}
        >
          <td className="px-4 py-3">
            <IdLink href={routes.eCommerce.orderDetails(order._id)} title={order._id}>
              {order._id}
            </IdLink>
          </td>
          <td className="px-4 py-3">
            <div>
              <Text className="font-medium text-gray-900">
                {order.user?.firstName} {order.user?.lastName}
              </Text>
              <Text className="text-xs text-gray-500">
                {order.user?.email}
              </Text>
            </div>
          </td>
          <td className="px-4 py-3 text-right">
            <Text className="font-semibold text-gray-900">
              ₦{formatNumber(order.totalAmount || 0)}
            </Text>
          </td>
          <td className="px-4 py-3">
            <Badge
              color={getStatusBadgeColor(order.status)}
              className="capitalize"
            >
              {order.status}
            </Badge>
          </td>
          <td className="px-4 py-3">
            <Text className="text-sm text-gray-600">
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </td>
        </tr>
      ))}
    </tbody>
  );
}
