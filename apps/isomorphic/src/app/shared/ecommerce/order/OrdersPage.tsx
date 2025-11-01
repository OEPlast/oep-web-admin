'use client';

import { useState } from 'react';
import { useOrders } from '@/hooks/queries/useOrders';
import { Order, OrdersQueryParams } from '@/types/order.types';
import OrdersTable from './OrdersTable';
import OrderFilters from './OrderFilters';
import OrderDetailsDrawer from './OrderDetailsDrawer';
import { Loader, Text, Button } from 'rizzui';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import Link from 'next/link';
import { PiPlusBold } from 'react-icons/pi';
import ExportButton from '@/app/shared/export-button';

const pageHeader = {
  title: 'Orders',
  breadcrumb: [
    {
      href: routes.eCommerce.dashboard,
      name: 'E-Commerce',
    },
    {
      href: routes.eCommerce.orders,
      name: 'Orders',
    },
    {
      name: 'List',
    },
  ],
};

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [queryParams, setQueryParams] = useState<OrdersQueryParams>({
    page: 1,
    limit: 10,
  });

  const { data, isLoading, isError, error } = useOrders(queryParams);
console.log(data);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedOrder(null);
  };

  const handleFilterChange = (newParams: Partial<OrdersQueryParams>) => {
    setQueryParams((prev) => ({
      ...prev,
      ...newParams,
      page: 1,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader variant="spinner" size="xl" />
        <Text className="ml-3 text-gray-600">Loading orders...</Text>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20">
        <Text className="text-red-500">
          Error loading orders: {error?.message || 'Unknown error'}
        </Text>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <ExportButton
            data={data?.orders|| []}
            fileName="order_data"
            header="Order ID,Name,Email,Avatar,Items,Price,Status,Created At,Updated At"
          />
        </div>
      </PageHeader>

      <div className="space-y-6">
        <OrderFilters
          currentParams={queryParams}
          onChange={handleFilterChange}
        />

        <OrdersTable
          orders={data?.orders || []}
          onViewOrder={handleViewOrder}
          isLoading={isLoading}
        />
      </div>

      {selectedOrder && (
        <OrderDetailsDrawer
          order={selectedOrder}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
        />
      )}
    </>
  );
}
