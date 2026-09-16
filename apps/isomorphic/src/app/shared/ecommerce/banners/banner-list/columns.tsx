'use client';

import DeletePopover from '@core/components/delete-popover';
import { routes } from '@/config/routes';
import IdLink from '@/app/shared/id-link';
import PencilIcon from '@core/components/icons/pencil';
import { createColumnHelper } from '@tanstack/react-table';
import Image from 'next/image';
import Link from 'next/link';
import { ActionIcon, Checkbox, Switch, Text, Tooltip } from 'rizzui';
import { BannerType } from '../banner-types';
import { getCdnUrl } from '@core/utils/cdn-url';

const columnHelper = createColumnHelper<BannerType>();

export const bannersColumns = [
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
    size: 160,
    header: 'Image',
    cell: ({ row }) => (
      <figure className="relative aspect-[3/2] w-40 overflow-hidden rounded-lg bg-gray-100">
        <Image
          alt={row.original.name}
          src={getCdnUrl(row.original.imageUrl)}
          fill
          sizes="(max-width: 768px) 100vw"
          className="object-cover"
        />
      </figure>
    ),
  }),
  columnHelper.display({
    id: 'name',
    size: 200,
    header: 'Banner Name',
    cell: ({ row }) => (
      <IdLink
        href={routes.eCommerce.bannerDetails(row.original._id)}
        className="text-sm"
      >
        {row.original.name}
      </IdLink>
    ),
  }),
  columnHelper.accessor('pageLink', {
    id: 'pageLink',
    size: 200,
    header: 'Page Link',
    cell: ({ getValue }) => <Text>{getValue()}</Text>,
  }),
  columnHelper.display({
    id: 'category',
    size: 30,
    header: 'Category',
    cell: ({ row }) => (
      <Text className="text-center">{row.original.category}</Text>
    ),
  }),
columnHelper.accessor('active', {
  id: 'active',
  size: 120,
  header: 'Status',
  cell: ({ row, table: { options: { meta } } }) => (
    <div className="flex items-center gap-2">
      <Switch
        checked={row.original.active}
        onChange={() => meta?.handleToggleBannerActive?.(row.original._id)}
        disabled={meta?.isToggling}
      />
      <Text className="text-xs">
        {row.original.active ? 'Active' : 'Inactive'}
      </Text>
    </div>
  ),
}),
  columnHelper.accessor('createdAt', {
    id: 'createdAt',
    size: 140,
    header: 'Created',
    cell: ({ getValue }) => (
      <Text>{new Date(getValue()).toLocaleDateString()}</Text>
    ),
  }),
  columnHelper.display({
    id: 'action',
    size: 100,
    cell: ({
      row,
      table: {
        options: { meta },
      },
    }) => (
      <div className="flex items-center justify-end gap-3 pe-4">
        <Tooltip content={'Edit Banner'} placement="top" color="invert">
          <Link href={routes.eCommerce.editBanner(row.original._id)}>
            <ActionIcon size="sm" variant="outline">
              <PencilIcon className="h-4 w-4" />
            </ActionIcon>
          </Link>
        </Tooltip>
        <DeletePopover
          title={`Delete the banner`}
          description={`Are you sure you want to delete this banner "${row.original.name}"?`}
          onDelete={() => meta?.handleDeleteRow?.(row.original)}
        />
      </div>
    ),
  }),
];
