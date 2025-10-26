'use client';

import DeletePopover from '@core/components/delete-popover';
import { routes } from '@/config/routes';
import { Product } from '@/hooks/queries/useProducts';
import PencilIcon from '@core/components/icons/pencil';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { ActionIcon, Checkbox, Flex, Text, Tooltip } from 'rizzui';
import Image from 'next/image';
import { getCdnUrl } from '@core/utils/cdn-url';
import ProductStatusBadge from '../ProductStatusBadge';
import StockStatus from '../StockStatus';
import { PiStar, PiCopySimple } from 'react-icons/pi';

const columnHelper = createColumnHelper<Product>();

export const productsListColumns = [
  columnHelper.display({
    id: 'select',
    size: 50,
    header: ({ table }) => (
      <Checkbox
        className="ps-3.5"
        aria-label="Select all rows"
        checked={table.getIsAllPageRowsSelected()}
        onChange={() => table.toggleAllPageRowsSelected()}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className="ps-3.5"
        aria-label="Select row"
        checked={row.getIsSelected()}
        onChange={() => row.toggleSelected()}
      />
    ),
  }),
  columnHelper.accessor('name', {
    id: 'name',
    size: 300,
    header: 'Product',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-gray-200">
          <Image
            src={getCdnUrl(row.original.description_images?.[0]?.url || '')}
            alt={row.original.name}
            fill
            className="object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/images/placeholder.png';
            }}
          />
        </div>
        <div className="flex flex-col">
          <Link
            href={routes.eCommerce.ediProduct(row.original._id)}
            className="font-medium text-gray-900 hover:text-primary"
          >
            {row.original.name}
          </Link>
          <span className="text-xs text-gray-500">
            {row.original.category?.name || 'Uncategorized'}
          </span>
        </div>
      </div>
    ),
  }),
  columnHelper.display({
    id: 'sku',
    size: 150,
    header: 'SKU',
    cell: ({ row }) => (
      <Text className="text-sm font-medium text-gray-700">
        {row.original.sku}
      </Text>
    ),
  }),
  columnHelper.accessor('stock', {
    id: 'stock',
    size: 200,
    header: 'Stock',
    cell: ({ row }) => (
      <StockStatus
        stock={row.original.stock}
        lowStockThreshold={row.original.lowStockThreshold}
      />
    ),
  }),
  columnHelper.accessor('price', {
    id: 'price',
    size: 150,
    header: 'Price',
    cell: ({ row }) => (
      <Text className="font-medium text-gray-900">
        ${row.original.price.toFixed(2)}
      </Text>
    ),
  }),
  columnHelper.display({
    id: 'rating',
    size: 150,
    header: 'Rating',
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <PiStar className="h-4 w-4 fill-yellow-500 text-yellow-500" />
        <span className="text-sm font-medium">
          {row.original.totalRating
            ? row.original.totalRating.toFixed(1)
            : 'N/A'}
        </span>
        {row.original.reviewCount !== undefined && (
          <span className="text-xs text-gray-500">
            ({row.original.reviewCount})
          </span>
        )}
      </div>
    ),
  }),
  columnHelper.accessor('status', {
    id: 'status',
    size: 120,
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => <ProductStatusBadge status={row.original.status} />,
  }),
  columnHelper.display({
    id: 'action',
    size: 150,
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <Flex align="center" justify="end" gap="3" className="pe-4">
        <Tooltip
          size="sm"
          content="Edit Product"
          placement="top"
          color="invert"
        >
          <Link href={routes.eCommerce.ediProduct(row.original._id)}>
            <ActionIcon
              as="span"
              size="sm"
              variant="outline"
              aria-label="Edit Product"
            >
              <PencilIcon className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>

        <Tooltip
          size="sm"
          content="Duplicate Product"
          placement="top"
          color="invert"
        >
          <ActionIcon
            size="sm"
            variant="outline"
            aria-label="Duplicate Product"
            onClick={() => {
              const metaWithDuplicate = meta as any;
              metaWithDuplicate?.handleDuplicateRow?.(row.original);
            }}
          >
            <PiCopySimple className="h-4 w-4" />
          </ActionIcon>
        </Tooltip>

        <DeletePopover
          title="Delete the product"
          description={`Are you sure you want to delete "${row.original.name}"?`}
          onDelete={() =>
            meta?.handleDeleteRow && meta?.handleDeleteRow(row.original)
          }
        />
      </Flex>
    ),
  }),
];
