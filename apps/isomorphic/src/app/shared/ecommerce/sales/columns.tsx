'use client';

import DateCell from '@core/ui/date-cell';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge, Text, Tooltip, ActionIcon, Button } from 'rizzui';
import { PiToggleLeftFill, PiToggleRightFill, PiEye, PiPencil, PiTrash } from 'react-icons/pi';
import { useToggleSaleStatus, useDeleteSale } from '@/hooks/mutations/useSalesMutations';
import { routes } from '@/config/routes';
import { SalesDataType } from './table';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Modal } from 'rizzui';

const columnHelper = createColumnHelper<SalesDataType>();

// Helper to get sale type badge color
const getSaleTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'Flash':
      return 'danger';
    case 'Limited':
      return 'warning';
    case 'Normal':
      return 'secondary';
    default:
      return 'secondary';
  }
};

// Toggle Status Component
function ToggleStatusButton({ sale }: { sale: SalesDataType }) {
  const toggleStatus = useToggleSaleStatus();

  const handleToggle = () => {
    toggleStatus.mutate({
      id: sale._id,
      isActive: !sale.isActive,
    });
  };

  return (
    <Tooltip content={sale.isActive ? 'Deactivate Sale' : 'Activate Sale'}>
      <ActionIcon
        size="sm"
        variant="outline"
        onClick={handleToggle}
        disabled={toggleStatus.isPending}
        className={sale.isActive ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}
      >
        {sale.isActive ? (
          <PiToggleRightFill className="size-5" />
        ) : (
          <PiToggleLeftFill className="size-5" />
        )}
      </ActionIcon>
    </Tooltip>
  );
}

// Delete Confirmation Modal
function DeleteSaleAction({ saleId, saleTitle }: { saleId: string; saleTitle?: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const deleteSale = useDeleteSale();

  const handleDelete = () => {
    deleteSale.mutate(saleId, {
      onSuccess: () => {
        setShowConfirm(false);
      },
    });
  };

  return (
    <>
      <ActionIcon
        size="sm"
        variant="outline"
        onClick={() => setShowConfirm(true)}
        className="text-red-600 hover:text-red-700"
      >
        <PiTrash className="size-4" />
      </ActionIcon>

      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
        <div className="p-6">
          <Text className="mb-4 text-lg font-semibold">Delete Sale</Text>
          <Text className="mb-6 text-gray-600">
            Are you sure you want to delete {saleTitle ? `"${saleTitle}"` : 'this sale'}? This action cannot be undone.
          </Text>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              color="danger"
              onClick={handleDelete}
              isLoading={deleteSale.isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export const salesColumns = [
  columnHelper.display({
    id: 'title',
    size: 200,
    header: 'Title',
    cell: ({ row }) => (
      <Text className="font-medium text-sm">{row.original.title || 'Untitled Sale'}</Text>
    ),
  }),
  columnHelper.display({
    id: 'productImage',
    size: 80,
    header: 'Image',
    cell: ({ row }) => (
      <img
        src={row.original.product?.coverImage || row.original.product?.image || '/placeholder.png'}
        alt={row.original.product?.name || 'Product'}
        className="h-12 w-12 rounded-md object-cover"
      />
    ),
  }),
  columnHelper.display({
    id: 'productName',
    size: 200,
    header: 'Product',
    cell: ({ row }) => (
      <div>
        <Text className="text-sm font-medium">{row.original.product?.name || 'N/A'}</Text>
        {row.original.product?.slug && (
          <Text className="text-xs text-gray-500">{row.original.product.slug}</Text>
        )}
      </div>
    ),
  }),
  columnHelper.accessor('type', {
    id: 'type',
    size: 100,
    header: 'Type',
    cell: ({ row }) => (
      <Badge
        variant="flat"
        color={getSaleTypeBadgeColor(row.original.type) as any}
        className="font-medium"
      >
        {row.original.type}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: 'status',
    size: 100,
    header: 'Status',
    cell: ({ row }) => (
      <Badge
        variant="flat"
        color={row.original.isActive ? 'success' : 'secondary'}
        className="font-medium"
      >
        {row.original.isActive ? 'Active' : 'Inactive'}
      </Badge>
    ),
  }),
  columnHelper.display({
    id: 'category',
    size: 150,
    header: 'Category',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-600">
        {row.original.product?.category?.name || 'N/A'}
      </Text>
    ),
  }),
  columnHelper.accessor('variants', {
    id: 'variants',
    size: 100,
    header: 'Variants',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-600">
        {row.original.variants?.length || 0} variant(s)
      </Text>
    ),
  }),
  columnHelper.display({
    id: 'discounts',
    size: 150,
    header: 'Discounts',
    cell: ({ row }) => {
      const variants = row.original.variants || [];
      const discounts = variants
        .map((v) => {
          if (v.discount > 0) return `${v.discount}%`;
          if (v.amountOff > 0) return `$${v.amountOff}`;
          return null;
        })
        .filter(Boolean);
      return (
        <Text className="text-sm text-gray-600">
          {discounts.length > 0 ? discounts.join(', ') : 'No discount'}
        </Text>
      );
    },
  }),
  columnHelper.display({
    id: 'usage',
    size: 120,
    header: 'Usage',
    cell: ({ row }) => {
      const variants = row.original.variants || [];
      const totalMaxBuys = variants.reduce((sum, v) => sum + (v.maxBuys || 0), 0);
      const totalBought = variants.reduce((sum, v) => sum + (v.boughtCount || 0), 0);
      return (
        <Text className="text-sm text-gray-600">
          {totalBought} / {totalMaxBuys > 0 ? totalMaxBuys : '∞'}
        </Text>
      );
    },
  }),
  columnHelper.accessor('startDate', {
    id: 'startDate',
    size: 150,
    header: 'Start Date',
    cell: ({ row }) => {
      if (!row.original.startDate) return <Text className="text-sm text-gray-400">-</Text>;
      return <DateCell date={new Date(row.original.startDate)} />;
    },
  }),
  columnHelper.accessor('endDate', {
    id: 'endDate',
    size: 150,
    header: 'End Date',
    cell: ({ row }) => {
      if (!row.original.endDate) return <Text className="text-sm text-gray-400">-</Text>;
      return <DateCell date={new Date(row.original.endDate)} />;
    },
  }),
  columnHelper.display({
    id: 'createdBy',
    size: 150,
    header: 'Created By',
    cell: ({ row }) => (
      <Text className="text-sm text-gray-600">
        {row.original.createdBy?.name || 'Unknown'}
      </Text>
    ),
  }),
  columnHelper.display({
    id: 'toggle',
    size: 80,
    header: 'Toggle',
    cell: ({ row }) => <ToggleStatusButton sale={row.original} />,
  }),
  columnHelper.display({
    id: 'actions',
    size: 120,
    header: 'Actions',
    cell: ({ row }) => {
      const router = useRouter();
      
      return (
        <div className="flex items-center gap-2">
          <Tooltip content="View Details">
            <ActionIcon
              size="sm"
              variant="outline"
              onClick={() => router.push(routes.eCommerce.flashSaleDetails(row.original._id))}
            >
              <PiEye className="size-4" />
            </ActionIcon>
          </Tooltip>
          <Tooltip content="Edit Sale">
            <ActionIcon
              size="sm"
              variant="outline"
              onClick={() => router.push(routes.eCommerce.editFlashSale(row.original._id))}
            >
              <PiPencil className="size-4" />
            </ActionIcon>
          </Tooltip>
          <DeleteSaleAction saleId={row.original._id} saleTitle={row.original.title} />
        </div>
      );
    },
  }),
];
