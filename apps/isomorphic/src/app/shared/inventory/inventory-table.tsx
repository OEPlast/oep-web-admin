'use client';

import { useMemo, useState } from 'react';
import { Badge, Button, Input, Modal, Text, Loader, Switch } from 'rizzui';
import { PiPencilSimpleBold } from 'react-icons/pi';
import { getCdnUrl } from '@core/utils/cdn-url';
import { routes } from '@/config/routes';
import IdLink from '@/app/shared/id-link';
import type { InventoryItem, InventoryList } from '@/hooks/queries/useInventory';
import { useSetLowStockThreshold, useSetStock } from '@/hooks/mutations/useInventoryMutations';

interface InventoryTableProps {
  data?: InventoryList;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

function stockBadge(item: InventoryItem) {
  if (item.stock <= 0) return <Badge variant="flat" color="danger">Out of stock</Badge>;
  if (item.stock <= item.lowStockThreshold) return <Badge variant="flat" color="warning">Low</Badge>;
  return <Badge variant="flat" color="success">In stock</Badge>;
}

/**
 * Stock levels with inline editing of the count and the low-stock threshold.
 *
 * Products with variants carry their stock per variant; the product total must equal the sum, so
 * for those the editor takes the per-variant numbers and the total is derived.
 */
export default function InventoryTable({ data, isLoading, page, onPageChange }: InventoryTableProps) {
  const [editing, setEditing] = useState<InventoryItem | null>(null);

  const pages = useMemo(() => (data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1), [data]);

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  const items = data?.products ?? [];

  return (
    <div className="rounded-lg border border-muted bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">SKU</th>
            <th className="px-4 py-3 text-right">Stock</th>
            <th className="px-4 py-3 text-right">Low at</th>
            <th className="px-4 py-3">Level</th>
            <th className="px-4 py-3">Listing</th>
            <th className="px-4 py-3 text-right">Edit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-muted">
          {items.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                No products match these filters.
              </td>
            </tr>
          )}
          {items.map((item) => (
            <tr key={item._id} className="hover:bg-gray-50/60">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  {item.image ? (
                    <img src={getCdnUrl(item.image)} alt="" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-100" />
                  )}
                  <div className="min-w-0">
                    <IdLink href={routes.eCommerce.ediProduct(item._id)} title={item.name}>
                      {item.name}
                    </IdLink>
                    {item.attributes && item.attributes.length > 0 && (
                      <Text className="truncate text-xs text-gray-500">
                        {item.attributes
                          .flatMap((a) => a.children.map((c) => `${c.name}: ${c.stock}`))
                          .join(' · ')}
                      </Text>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-gray-600">
                {item.sku ? (
                  <IdLink
                    href={routes.eCommerce.ediProduct(item._id)}
                    title={item.name}
                    className="font-mono text-xs"
                  >
                    {item.sku}
                  </IdLink>
                ) : (
                  '—'
                )}
              </td>
              <td className="px-4 py-3 text-right font-semibold">{item.stock}</td>
              <td className="px-4 py-3 text-right text-gray-600">{item.lowStockThreshold}</td>
              <td className="px-4 py-3">{stockBadge(item)}</td>
              <td className="px-4 py-3">
                <Badge variant="outline" className="capitalize">
                  {item.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <Button size="sm" variant="outline" onClick={() => setEditing(item)}>
                  <PiPencilSimpleBold className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {data && pages > 1 && (
        <div className="flex items-center justify-between border-t border-muted px-4 py-3 text-sm">
          <Text className="text-gray-600">
            Page {page} of {pages} · {data.total} products
          </Text>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      {editing && <EditStockModal item={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function EditStockModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const hasVariants = !!item.attributes?.some((a) => a.children.length > 0);
  const [threshold, setThreshold] = useState(String(item.lowStockThreshold));
  const [stock, setStock] = useState(String(item.stock));
  const [variantStock, setVariantStock] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    item.attributes?.forEach((a) => a.children.forEach((c) => (initial[`${a.name}::${c.name}`] = String(c.stock))));
    return initial;
  });
  const [alsoThreshold, setAlsoThreshold] = useState(true);

  const setThresholdMutation = useSetLowStockThreshold();
  const setStockMutation = useSetStock();
  const busy = setThresholdMutation.isPending || setStockMutation.isPending;

  const variantTotal = Object.values(variantStock).reduce((sum, v) => sum + (Number(v) || 0), 0);

  const save = async () => {
    const thresholdValue = Number(threshold);
    if (alsoThreshold && (!Number.isInteger(thresholdValue) || thresholdValue < 0)) return;

    if (hasVariants) {
      const variants = (item.attributes ?? []).flatMap((a) =>
        a.children.map((c) => ({
          attributeName: a.name,
          childName: c.name,
          stock: Math.max(0, Number(variantStock[`${a.name}::${c.name}`]) || 0),
        }))
      );
      await setStockMutation.mutateAsync({ productId: item._id, stock: variantTotal, variants });
    } else {
      const stockValue = Number(stock);
      if (!Number.isInteger(stockValue) || stockValue < 0) return;
      await setStockMutation.mutateAsync({ productId: item._id, stock: stockValue });
    }
    if (alsoThreshold && thresholdValue !== item.lowStockThreshold) {
      await setThresholdMutation.mutateAsync({ productId: item._id, threshold: thresholdValue });
    }
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} size="md">
      <div className="p-6">
        <Text className="text-lg font-semibold">{item.name}</Text>
        <Text className="mt-1 text-sm text-gray-600">Set the stock on hand. Sold stock is deducted automatically at checkout.</Text>

        {hasVariants ? (
          <div className="mt-4 space-y-3">
            {item.attributes?.map((a) =>
              a.children.map((c) => {
                const key = `${a.name}::${c.name}`;
                return (
                  <Input
                    key={key}
                    type="number"
                    min={0}
                    label={`${a.name}: ${c.name}`}
                    value={variantStock[key] ?? ''}
                    onChange={(e) => setVariantStock((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                );
              })
            )}
            <Text className="text-sm text-gray-600">
              Total: <strong>{variantTotal}</strong>
            </Text>
          </div>
        ) : (
          <Input type="number" min={0} label="Stock" value={stock} onChange={(e) => setStock(e.target.value)} className="mt-4" />
        )}

        <div className="mt-4 flex items-center gap-3">
          <Switch checked={alsoThreshold} onChange={(e) => setAlsoThreshold(e.target.checked)} label="Update low-stock threshold" />
        </div>
        {alsoThreshold && (
          <Input
            type="number"
            min={0}
            label="Warn when stock is at or below"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="mt-3"
          />
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={save} isLoading={busy}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
