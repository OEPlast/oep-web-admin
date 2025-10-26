'use client';

import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { Checkbox, Text, Badge } from 'rizzui';
import { CouponTableMoreAction } from '@core/components/table-utils/coupon-table-more';
import { CouponsDataType } from './table';
import Link from 'next/link';

const columnHelper = createColumnHelper<CouponsDataType>();

export const couponsColumns = [
  columnHelper.display({
    id: 'checked',
    size: 50,
    cell: ({ row }) => (
      <Checkbox
        className="ps-3.5"
        aria-label="Select row"
        checked={row.getIsSelected()}
        onChange={() => row.toggleSelected()}
        disabled={row.original.deleted}
      />
    ),
  }),

  columnHelper.display({
    id: 'code',
    size: 150,
    header: 'Code',
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={'/ecommerce/coupons/' + row.original._id}
        className="hover:underline"
      >
        <Text className="font-medium text-gray-900">{row.original.coupon}</Text>
      </Link>
    ),
  }),

  columnHelper.display({
    id: 'discount',
    size: 120,
    header: 'Discount',
    enableSorting: false,
    cell: ({ row }) => (
      <Text className="text-sm text-gray-700">
        {row.original.discount}
        {row.original.discountType === 'percentage' ? '%' : '$'}
      </Text>
    ),
  }),

  columnHelper.display({
    id: 'couponType',
    size: 180,
    header: 'Type',
    enableSorting: false,
    cell: ({ row }) => (
      <Text className="text-sm capitalize text-gray-500">
        {row.original.couponType.replace(/-/g, ' ')}
      </Text>
    ),
  }),

  columnHelper.accessor('timesUsed', {
    id: 'timesUsed',
    size: 100,
    header: 'Used',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-600">
        {row.original.timesUsed}
        {row.original.maxUsage ? ` / ${row.original.maxUsage}` : ''}
      </Text>
    ),
  }),

  columnHelper.display({
    id: 'status',
    size: 100,
    header: 'Status',
    cell: ({ row }) => {
      const now = new Date();
      const startDate = new Date(row.original.startDate);
      const endDate = new Date(row.original.endDate);
      const isActive = row.original.active;
      const isDeleted = row.original.deleted;
      const isExpired = now > endDate;
      const isUpcoming = now < startDate;

      let status = 'Active';
      let color: 'success' | 'warning' | 'danger' | 'secondary' = 'success';

      if (isDeleted) {
        status = 'Deleted';
        color = 'danger';
      } else if (!isActive) {
        status = 'Inactive';
        color = 'secondary';
      } else if (isExpired) {
        status = 'Expired';
        color = 'danger';
      } else if (isUpcoming) {
        status = 'Upcoming';
        color = 'warning';
      }

      return (
        <Badge variant="flat" color={color} size="sm">
          {status}
        </Badge>
      );
    },
  }),

  columnHelper.accessor('startDate', {
    id: 'startDate',
    size: 140,
    header: 'Start',
    cell: ({ row }) => <DateCell date={row.original.startDate} />,
  }),

  columnHelper.accessor('endDate', {
    id: 'endDate',
    size: 140,
    header: 'End',
    cell: ({ row }) => <DateCell date={row.original.endDate} />,
  }),

  columnHelper.display({
    id: 'stackable',
    size: 100,
    header: 'Stackable',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-500">
        {row.original.stackable ? 'Yes' : 'No'}
      </Text>
    ),
  }),

  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 140,
    header: 'Created',
    cell: ({ row }) => <DateCell date={row.original.createdAt} />,
  }),

  columnHelper.display({
    id: 'action',
    size: 50,
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <CouponTableMoreAction
        id={row.original._id}
        disabled={row.original.deleted}
        onDelete={() => meta?.handleDeleteRow?.(row.original)}
      />
    ),
  }),
];
