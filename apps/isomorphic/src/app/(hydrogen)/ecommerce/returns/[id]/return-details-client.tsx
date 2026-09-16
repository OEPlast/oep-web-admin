'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader, Badge, Text, Button, Alert } from 'rizzui';
import cn from '@core/utils/class-names';
import { getCdnUrl } from '@core/utils/cdn-url';
import { PiArrowLeftBold, PiPackageBold, PiUserBold, PiCalendarBold, PiNoteBold } from 'react-icons/pi';
import { type ReturnItem, type ReturnStatus, useReturnById } from '@/hooks/queries/useReturns';
import { routes } from '@/config/routes';
import ReturnStatusUpdateForm from '@/app/shared/returns/return-status-update-form';
import RefundProcessForm from '@/app/shared/returns/refund-process-form';
import { handleApiError } from '@/libs/axios';

interface ReturnDetailsClientProps {
  returnId: string;
}

const STATUS_COLOR: Record<string, 'warning' | 'success' | 'danger' | 'info' | 'secondary'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  items_received: 'info',
  inspecting: 'info',
  inspection_passed: 'success',
  inspection_failed: 'danger',
  completed: 'success',
  cancelled: 'secondary',
};
const getStatusColor = (status: string) => STATUS_COLOR[status] || 'secondary';

/** Statuses from which a refund can be paid: after inspection, or earlier with an override. */
const REFUNDABLE_STATUSES: ReturnStatus[] = ['inspection_passed', 'approved', 'items_received', 'inspecting', 'inspection_failed'];
/** Statuses that still have a move available on the status form. */
const CHANGEABLE_STATUSES: ReturnStatus[] = ['pending', 'approved', 'items_received', 'inspecting', 'inspection_failed'];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 2 }).format(amount);

const humaniseReason = (reason: string) => reason.replace(/_/g, ' ');

const lineValue = (item: ReturnItem) => (item.refundAmount ?? (item.product?.price ?? 0) * item.qty);

export default function ReturnDetailsClient({ returnId }: ReturnDetailsClientProps) {
  const router = useRouter();
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [showRefundForm, setShowRefundForm] = useState(false);

  const { data: returnData, isLoading, error, refetch } = useReturnById(returnId);

  const handleStatusUpdateSuccess = () => {
    setShowStatusForm(false);
    refetch();
  };

  const handleRefundSuccess = () => {
    setShowRefundForm(false);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="danger" className="mb-4">
        <strong>Error loading return details:</strong> {handleApiError(error)}
      </Alert>
    );
  }

  if (!returnData) {
    return (
      <Alert color="danger" className="mb-4">
        <strong>Return not found</strong>
      </Alert>
    );
  }

  const refund =
    returnData.refundTransaction && typeof returnData.refundTransaction === 'object' ? returnData.refundTransaction : null;
  const itemsValue = returnData.items.reduce((sum, item) => sum + lineValue(item), 0);
  const canProcessRefund = REFUNDABLE_STATUSES.includes(returnData.status) && !returnData.refundTransaction;
  const canChangeStatus = CHANGEABLE_STATUSES.includes(returnData.status);

  return (
    <div className="@container">
      <div className="mb-6">
        <Button variant="text" onClick={() => router.push(routes.eCommerce.returns)} className="!h-auto !p-0 hover:underline">
          <PiArrowLeftBold className="mr-1 h-4 w-4" />
          Back to Returns
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-3">
        <div className="space-y-6 @4xl:col-span-2">
          {/* Return information */}
          <div className="rounded-lg border border-muted bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Return {returnData.returnNumber}</h2>
              <Badge color={getStatusColor(returnData.status)} className="capitalize">
                {returnData.status.replace(/_/g, ' ')}
              </Badge>
            </div>

            {returnData.status === 'inspection_passed' && !returnData.refundTransaction && (
              <Alert color="info" className="mb-4">
                The items passed inspection. Pay the refund from the panel on the right to complete this return.
              </Alert>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Text className="mb-1 text-sm font-medium text-gray-500">Order</Text>
                <Link href={routes.eCommerce.orderDetails(returnData.order._id)} className="font-semibold hover:underline">
                  {returnData.order.orderNumber ?? returnData.order._id}
                </Link>
              </div>
              <div>
                <Text className="mb-1 text-sm font-medium text-gray-500">Order total</Text>
                <Text className="font-semibold">{formatCurrency(returnData.order.total)}</Text>
              </div>
              <div>
                <Text className="mb-1 text-sm font-medium text-gray-500">Type</Text>
                <Badge variant="flat" className="capitalize">
                  {returnData.type}
                </Badge>
              </div>
              <div>
                <Text className="mb-1 text-sm font-medium text-gray-500">Requested</Text>
                <div className="flex items-center gap-2">
                  <PiCalendarBold className="h-4 w-4 text-gray-400" />
                  <Text>{new Date(returnData.requestedAt).toLocaleString()}</Text>
                </div>
              </div>
              {returnData.order.deliveredAt && (
                <div>
                  <Text className="mb-1 text-sm font-medium text-gray-500">Order delivered</Text>
                  <Text>{new Date(returnData.order.deliveredAt).toLocaleString()}</Text>
                </div>
              )}
            </div>

            {returnData.customerNotes && (
              <div className="mt-6 border-t border-muted pt-6">
                <Text className="mb-2 text-sm font-medium text-gray-500">Customer notes</Text>
                <div className="flex items-start gap-2">
                  <PiNoteBold className="mt-1 h-4 w-4 flex-shrink-0 text-gray-400" />
                  <Text className="text-gray-700">{returnData.customerNotes}</Text>
                </div>
              </div>
            )}

            {returnData.adminNotes && (
              <div className="mt-4">
                <Text className="mb-2 text-sm font-medium text-gray-500">Admin notes</Text>
                <div className="rounded bg-gray-50 p-4">
                  <Text className="whitespace-pre-line text-gray-700">{returnData.adminNotes}</Text>
                </div>
              </div>
            )}
          </div>

          {/* Customer */}
          <div className="rounded-lg border border-muted bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <PiUserBold className="h-5 w-5 text-gray-400" />
              <h2 className="text-xl font-semibold">Customer</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Text className="mb-1 text-sm font-medium text-gray-500">Name</Text>
                <Text className="font-semibold">
                  {[returnData.user?.firstName, returnData.user?.lastName].filter(Boolean).join(' ') || '—'}
                </Text>
              </div>
              <div>
                <Text className="mb-1 text-sm font-medium text-gray-500">Email</Text>
                <Text>{returnData.user?.email}</Text>
              </div>
              {returnData.user?.phoneNumber && (
                <div>
                  <Text className="mb-1 text-sm font-medium text-gray-500">Phone</Text>
                  <Text>{returnData.user.phoneNumber}</Text>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div className="rounded-lg border border-muted bg-white p-6">
            <div className="mb-4 flex items-center gap-2">
              <PiPackageBold className="h-5 w-5 text-gray-400" />
              <h2 className="text-xl font-semibold">Items being returned</h2>
            </div>

            <div className="space-y-4">
              {returnData.items.map((item, index) => {
                const image = item.product?.description_images?.find((i) => i.cover_image)?.url ?? item.product?.description_images?.[0]?.url;
                return (
                  <div
                    key={index}
                    className={cn('flex items-start gap-4 pb-4', index !== returnData.items.length - 1 && 'border-b border-muted')}
                  >
                    {image ? (
                      <img src={getCdnUrl(image)} alt="" className="h-14 w-14 rounded object-cover" />
                    ) : (
                      <div className="h-14 w-14 rounded bg-gray-100" />
                    )}
                    <div className="flex-1">
                      <Text className="font-semibold">{item.product?.name ?? 'Product no longer available'}</Text>
                      <div className="mt-1 flex flex-wrap items-center gap-x-4 text-sm text-gray-500">
                        <span>Qty: {item.qty}</span>
                        <span className="capitalize">Reason: {humaniseReason(item.reason)}</span>
                      </div>
                      {item.reasonDetails && <Text className="mt-1 text-sm text-gray-600">{item.reasonDetails}</Text>}
                      {item.images && item.images.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.images.map((img) => (
                            <a key={img} href={getCdnUrl(img)} target="_blank" rel="noreferrer">
                              <img src={getCdnUrl(img)} alt="Customer photo" className="h-16 w-16 rounded border border-muted object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <Text className="font-semibold">{formatCurrency(lineValue(item))}</Text>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 border-t border-muted pt-4">
              <div className="flex justify-between">
                <Text className="font-semibold">Return value</Text>
                <Text className="text-lg font-bold">{formatCurrency(returnData.totalRefundAmount ?? itemsValue)}</Text>
              </div>
            </div>
          </div>

          {/* Refund */}
          {refund && (
            <div className="rounded-lg border border-muted bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold">Refund</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Text className="mb-1 text-sm font-medium text-gray-500">Status</Text>
                  <Badge color={refund.status === 'completed' ? 'success' : refund.status === 'failed' ? 'danger' : 'warning'} className="capitalize">
                    {refund.status}
                  </Badge>
                  {refund.status === 'pending' && (
                    <Text className="mt-1 text-xs text-gray-500">Waiting for Paystack to confirm.</Text>
                  )}
                </div>
                <div>
                  <Text className="mb-1 text-sm font-medium text-gray-500">Amount</Text>
                  <Text className="text-lg font-semibold">{formatCurrency(refund.amount)}</Text>
                </div>
                <div>
                  <Text className="mb-1 text-sm font-medium text-gray-500">Method</Text>
                  <Text className="capitalize">{refund.paymentMethod.replace(/_/g, ' ')}</Text>
                </div>
                <div>
                  <Text className="mb-1 text-sm font-medium text-gray-500">Reference</Text>
                  <Link href={routes.transactions.details(refund._id)} className="font-mono text-sm hover:underline">
                    {refund.reference}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* History */}
          {returnData.statusHistory && returnData.statusHistory.length > 0 && (
            <div className="rounded-lg border border-muted bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold">History</h2>
              <ol className="space-y-3">
                {[...returnData.statusHistory].reverse().map((entry, index) => (
                  <li key={index} className="flex items-start justify-between gap-4 text-sm">
                    <div>
                      <Badge color={getStatusColor(entry.status)} size="sm" className="capitalize">
                        {entry.status.replace(/_/g, ' ')}
                      </Badge>
                      {entry.note && <Text className="mt-1 text-gray-600">{entry.note}</Text>}
                      <Text className="mt-0.5 text-xs text-gray-400">by {entry.by}</Text>
                    </div>
                    <Text className="whitespace-nowrap text-gray-500">{new Date(entry.at).toLocaleString()}</Text>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {canChangeStatus && (
            <div className="rounded-lg border border-muted bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold">Update status</h3>
              {!showStatusForm ? (
                <Button onClick={() => setShowStatusForm(true)} className="w-full" variant="solid">
                  Change status
                </Button>
              ) : (
                <ReturnStatusUpdateForm
                  returnId={returnId}
                  currentStatus={returnData.status}
                  onSuccess={handleStatusUpdateSuccess}
                  onCancel={() => setShowStatusForm(false)}
                />
              )}
            </div>
          )}

          {canProcessRefund && (
            <div className="rounded-lg border border-muted bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold">Refund</h3>
              {!showRefundForm ? (
                <Button onClick={() => setShowRefundForm(true)} className="w-full" variant={returnData.status === 'inspection_passed' ? 'solid' : 'outline'}>
                  {returnData.status === 'inspection_passed' ? 'Pay refund' : 'Refund without inspection…'}
                </Button>
              ) : (
                <RefundProcessForm
                  returnId={returnId}
                  totalRefundAmount={returnData.totalRefundAmount ?? itemsValue}
                  orderTotal={returnData.order.total}
                  currentStatus={returnData.status}
                  onSuccess={handleRefundSuccess}
                  onCancel={() => setShowRefundForm(false)}
                />
              )}
            </div>
          )}

          <div className="rounded-lg border border-muted bg-gray-50 p-6">
            <h3 className="mb-4 text-lg font-semibold">Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <Text className="text-gray-500">Items</Text>
                <Text className="font-semibold">{returnData.items.reduce((sum, item) => sum + item.qty, 0)}</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-500">Status</Text>
                <Badge color={getStatusColor(returnData.status)} size="sm" className="capitalize">
                  {returnData.status.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div className="flex justify-between">
                <Text className="text-gray-500">Refund</Text>
                <Text className="font-semibold">{refund ? formatCurrency(refund.amount) : 'Not paid'}</Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
