'use client';

import DeletePopover from '@core/components/delete-popover';
import { routes } from '@/config/routes';
import PencilIcon from '@core/components/icons/pencil';
import { createColumnHelper } from '@tanstack/react-table';
import Image from 'next/image';
import Link from 'next/link';
import { ActionIcon, Badge, Checkbox, Text, Title, Tooltip } from 'rizzui';
import { CategoryType } from '../category-types';
import { getCdnUrl } from '@core/utils/cdn-url';
import EyeIcon from '@core/components/icons/eye';

const columnHelper = createColumnHelper<CategoryType>();

export const categoriesColumns = [
  columnHelper.display({
    id: 'checked',
    size: 50,
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        className="ps-3.5"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
      />
    ),
  }),
  columnHelper.display({
    id: 'image',
    size: 120,
    header: 'Image',
    cell: ({ row }) => (
      <figure className="relative aspect-square w-20 overflow-hidden rounded-lg bg-gray-100">
        <Image
          alt={row.original.name}
          src={getCdnUrl(row.original.image)}
          fill
          sizes="(max-width: 768px) 100vw"
          className="object-cover"
        />
      </figure>
    ),
  }),
  columnHelper.accessor('name', {
    id: 'name',
    size: 200,
    header: 'Category Name',
    cell: ({ getValue, row }) => (
      <Link href={routes.eCommerce.categoryDetails(row.original._id)}>
        <Title as="h6" className="!text-sm font-medium hover:text-primary">
          {getValue()}
        </Title>
      </Link>
    ),
  }),
  columnHelper.accessor('slug', {
    id: 'slug',
    size: 180,
    header: 'Slug',
    cell: ({ getValue }) => (
      <Text className="text-xs font-mono text-gray-600">{getValue()}</Text>
    ),
  }),
  columnHelper.accessor('priority', {
    id: 'priority',
    size: 100,
    header: 'Priority',
    cell: ({ getValue }) => (
      <Badge
        variant="flat"
        color={getValue() ? 'success' : 'secondary'}
        className="font-medium"
      >
        {getValue() ? 'Yes' : 'No'}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: 'parentCount',
    size: 100,
    header: 'Parents',
    cell: ({ row }) => (
      <p
        className="text-xs"
      >
        {row.original.parent?.length || 0}
      </p>
    ),
  }),
  columnHelper.display({
    id: 'subcategoryCount',
    size: 120,
    header: 'Subcategories',
    cell: ({ row }) => (
      <p
        className="text-xs"
      >
        {row.original.subcategoryCount || 0}
      </p>
    ),
  }),
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 140,
    header: 'Created',
    cell: ({ getValue }) => (
      <Text className="text-xs">{new Date(getValue()).toLocaleDateString()}</Text>
    ),
  }),
  columnHelper.display({
    id: 'action',
    size: 140,
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <div className="flex items-center justify-end gap-3 pe-4">
        <Tooltip content={'View Details'} placement="top" color="invert">
          <Link href={routes.eCommerce.categoryDetails(row.original._id)}>
            <ActionIcon size="sm" variant="outline">
              <EyeIcon className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
        <Tooltip content={'Edit Category'} placement="top" color="invert">
          <Link href={routes.eCommerce.editCategory(row.original._id)}>
            <ActionIcon size="sm" variant="outline">
              <PencilIcon className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
        <DeletePopover
          title={`Delete category`}
          description={`Are you sure you want to delete "${row.original.name}"? This will also remove it from parent references.`}
          onDelete={() => meta?.handleDeleteRow?.(row.original)}
        />
      </div>
    ),
  }),
];
