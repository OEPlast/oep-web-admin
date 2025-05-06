'use client';

import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { Avatar, Button, Checkbox, Text, Title } from 'rizzui';
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
    id: 'id',
    size: 110,
    header: 'Id',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-500">{row.original._id}</Text>
    ),
  }),
  columnHelper.display({
    id: 'code',
    size: 150,
    header: 'Code',
    enableSorting: false,
    cell: ({ row }) => (
      <Link
        href={'/ecommerce/coupons/' + row.original.coupon}
        className="hover:underline"
      >
        <Text className="text-sm text-gray-500">{row.original.coupon}</Text>
      </Link>
    ),
  }),
  columnHelper.display({
    id: 'couponType',
    size: 200,
    header: 'Type',
    enableSorting: false,
    cell: ({ row }) => (
      <Text className="text-sm text-gray-500">{row.original.couponType}</Text>
    ),
  }),
  columnHelper.accessor('timesUsed', {
    id: 'timesUsed',
    size: 140,
    header: 'Times Used',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-500">{row.original.timesUsed}</Text>
    ),
  }),
  columnHelper.accessor('discount', {
    id: 'discount',
    size: 100,
    header: 'Discount',
    enableSorting: false,
    cell: ({ row }) => (
      <Text className="text-sm text-gray-500">{row.original.discount}</Text>
    ),
  }),
  columnHelper.accessor('startDate', {
    id: 'startDate',
    size: 200,
    header: 'Start',
    cell: ({ row }) => <DateCell date={row.original.startDate} />,
  }),
  columnHelper.accessor('endDate', {
    id: 'endDate',
    size: 200,
    header: 'End',
    cell: ({ row }) => <DateCell date={row.original.endDate} />,
  }),
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 200,
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
