'use client';

import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { Avatar, Button, Checkbox, Text, Title } from 'rizzui';
import { CouponTableMoreAction } from '@core/components/table-utils/coupon-table-more';

import Link from 'next/link';
import { SalesDataType } from './table';

const columnHelper = createColumnHelper<SalesDataType>();

export const salesColumns = [
  columnHelper.display({
    id: 'title',
    size: 200,
    header: 'Title',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-500">{row.original.title}</Text>
    ),
  }),
  columnHelper.display({
    id: 'productImage',
    size: 100,
    header: 'Product Image',
    cell: ({ row }) => (
      <img
        src={row.original.product.coverImage}
        alt={row.original.product.name}
        className="h-10 w-10 rounded-md object-cover"
      />
    ),
  }),
  columnHelper.display({
    id: 'productName',
    size: 200,
    header: 'Product Name',
    cell: ({ row }) => (
      <Text className="text-sm font-medium">{row.original.product.name}</Text>
    ),
  }),
  columnHelper.display({
    id: 'productSlug',
    size: 200,
    header: 'Product Slug',
    cell: ({ row }) => (
      <Text className="text-xs text-gray-500">
        Slug: {row.original.product.slug}
      </Text>
    ),
  }),
  columnHelper.display({
    id: 'category',
    size: 200,
    header: 'Category',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-500">
        {row.original.product.category.name}
      </Text>
    ),
  }),
  columnHelper.display({
    id: 'subCategories',
    size: 200,
    header: 'Sub-Category',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-500">
        {row.original.product.subCategories.name}
      </Text>
    ),
  }),
  columnHelper.accessor('variants', {
    id: 'variants',
    size: 300,
    header: 'Variants',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-500">
        {row.original.variants
          .map((variant) => {
            if (!variant.attributeName && !variant.attributeValue) {
              return 'All';
            }
            return `${variant.attributeName || 'Default'}: ${variant.attributeValue || 'N/A'} (${variant.discount}%, Limit: ${variant.limit})`;
          })
          .join(', ')}
      </Text>
    ),
  }),
  columnHelper.accessor('campaign', {
    id: 'campaign',
    size: 200,
    header: 'Campaign',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-500">
        {row.original.campaign || 'N/A'}
      </Text>
    ),
  }),
  columnHelper.accessor('limit', {
    id: 'limit',
    size: 100,
    header: 'Limit',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-500">{row.original.limit}</Text>
    ),
  }),
  columnHelper.accessor('maxBuys', {
    id: 'maxBuys',
    size: 100,
    header: 'Max Buys',
    cell: ({ row }: { row: { original: SalesDataType } }) => {
      const totalMaxBuys = row.original.variants.reduce(
        (sum, variant) => sum + variant.maxBuys,
        0
      );
      return <Text className="text-sm text-gray-500">{totalMaxBuys}</Text>;
    },
  }),
  columnHelper.accessor('boughtCount', {
    id: 'boughtCount',
    size: 100,
    header: 'Bought Count',
    cell: ({ row }: { row: { original: SalesDataType } }) => {
      const totalBoughtCount = row.original.variants.reduce(
        (sum, variant) => sum + variant.boughtCount,
        0
      );
      return <Text className="text-sm text-gray-500">{totalBoughtCount}</Text>;
    },
  }),
  columnHelper.accessor('startDate', {
    id: 'startDate',
    size: 200,
    header: 'Start Date',
    cell: ({ row }) => <DateCell date={new Date(row.original.startDate)} />,
  }),
  columnHelper.accessor('endDate', {
    id: 'endDate',
    size: 200,
    header: 'End Date',
    cell: ({ row }) => <DateCell date={new Date(row.original.endDate)} />,
  }),
  columnHelper.accessor('deleted', {
    id: 'deleted',
    size: 100,
    header: 'Deleted',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-500">
        {row.original.deleted ? 'Yes' : 'No'}
      </Text>
    ),
  }),
];
