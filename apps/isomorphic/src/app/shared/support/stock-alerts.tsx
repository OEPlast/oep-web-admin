'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ActionIcon, Alert, Badge, Button, Drawer, Loader, Text, Title } from 'rizzui';
import { PiXBold } from 'react-icons/pi';
import { routes } from '@/config/routes';
import { handleApiError } from '@/libs/axios';
import { useStockAlertsForProduct, useStockAlertSummary } from '@/hooks/queries/useSupport';
import SimplePager from '@/app/shared/simple-pager';
import { StockAlertSummaryRow } from '@/types/support.types';

const PAGE_SIZE = 20;

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString() : '—');

export default function StockAlerts() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<StockAlertSummaryRow | null>(null);
  const { data, isLoading, isFetching, error } = useStockAlertSummary(page, PAGE_SIZE);
  const rows = data?.items ?? [];
  const meta = data?.meta;

  if (error) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not load stock alerts</Text>
        <Text className="text-sm">{handleApiError(error)}</Text>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Text className="text-gray-500">
        Shoppers ask to be emailed when an out-of-stock product (or one option of it) is back. The email goes out
        automatically when stock is added, so restocking the most-requested products first wins the most sales.
      </Text>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader size="lg" />
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-muted py-16">
          <Title as="h5">No stock alerts yet</Title>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-muted">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-gray-50 text-left dark:bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Waiting</th>
                <th className="px-4 py-3 font-medium">Notified</th>
                <th className="px-4 py-3 font-medium">Last request</th>
                <th className="px-4 py-3 font-medium">Last email</th>
                <th className="px-4 py-3 text-right font-medium" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.productId} className="border-t border-muted align-top">
                  <td className="px-4 py-3">
                    {row.product?.name ? (
                      <Link
                        href={routes.eCommerce.ediProduct(row.productId)}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {row.product.name}
                      </Link>
                    ) : (
                      <Text className="text-gray-500">Deleted product</Text>
                    )}
                    {row.product?.sku != null && <Text className="text-xs text-gray-500">SKU {row.product.sku}</Text>}
                  </td>
                  <td className="px-4 py-3">
                    {row.product?.stock == null ? (
                      '—'
                    ) : (
                      <Badge variant="flat" color={row.product.stock > 0 ? 'success' : 'danger'}>
                        {row.product.stock}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold">{row.waiting}</td>
                  <td className="px-4 py-3 text-gray-600">{row.notified}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(row.lastRequestedAt)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(row.lastNotifiedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => setSelected(row)}>
                      View emails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && <SimplePager page={meta.page} pages={meta.pages} total={meta.total} onChange={setPage} isLoading={isFetching} />}

      <Drawer isOpen={!!selected} onClose={() => setSelected(null)} size="md">
        {selected && <AlertsDrawer row={selected} onClose={() => setSelected(null)} />}
      </Drawer>
    </div>
  );
}

function AlertsDrawer({ row, onClose }: { row: StockAlertSummaryRow; onClose: () => void }) {
  const { data: alerts = [], isLoading, error } = useStockAlertsForProduct(row.productId);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-muted p-5">
        <div>
          <Title as="h4" className="font-semibold">
            {row.product?.name ?? 'Deleted product'}
          </Title>
          <Text className="text-sm text-gray-500">
            {row.waiting} waiting · {row.notified} notified
          </Text>
        </div>
        <ActionIcon size="sm" variant="text" onClick={onClose} aria-label="Close">
          <PiXBold className="h-4 w-4" />
        </ActionIcon>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader />
          </div>
        ) : error ? (
          <Text className="text-sm text-red-600">{handleApiError(error)}</Text>
        ) : alerts.length === 0 ? (
          <Text className="text-sm text-gray-500">No alerts.</Text>
        ) : (
          <ul className="divide-y divide-muted">
            {alerts.map((alert) => (
              <li key={alert._id} className="flex items-start justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <a href={`mailto:${alert.email}`} className="break-all font-medium hover:underline">
                    {alert.email}
                  </a>
                  <Text className="text-xs text-gray-500">
                    {alert.attribute ? `${alert.attribute.name}: ${alert.attribute.value} · ` : ''}
                    asked {new Date(alert.createdAt).toLocaleDateString()}
                  </Text>
                </div>
                {alert.pending ? (
                  <Badge size="sm" variant="flat" color="warning">
                    waiting
                  </Badge>
                ) : (
                  <Badge size="sm" variant="flat" color="success">
                    emailed {alert.notifiedAt ? new Date(alert.notifiedAt).toLocaleDateString() : ''}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
        {alerts.length >= 500 && <Text className="mt-3 text-xs text-gray-500">Showing the latest 500.</Text>}
      </div>
    </div>
  );
}
