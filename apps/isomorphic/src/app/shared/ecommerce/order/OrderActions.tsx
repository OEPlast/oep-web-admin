'use client';

import { useState } from 'react';
import { Button, Modal, Text, Textarea, Alert } from 'rizzui';
import {
  PiCheckBold,
  PiXBold,
  PiProhibitBold,
  PiArrowRightBold,
} from 'react-icons/pi';
import {
  useCancelOrder,
  useRejectOrder,
  useUpdateOrderStatus,
} from '@/hooks/mutations/useOrderMutations';
import type { Order } from '@/types/order.types';

interface OrderActionsProps {
  order: Pick<Order, '_id' | 'status' | 'isPaid' | 'orderNumber' | 'total'>;
}

type PendingAction = 'start' | 'complete' | 'cancel' | 'reject' | null;

/** What each confirmation says. Destructive actions take a reason the customer is shown. */
const ACTION_COPY: Record<
  Exclude<PendingAction, null>,
  {
    title: string;
    body: string;
    confirm: string;
    danger: boolean;
    withReason: boolean;
  }
> = {
  start: {
    title: 'Start processing order',
    body: 'Marks the order as being prepared. You can still cancel it after this.',
    confirm: 'Start processing',
    danger: false,
    withReason: false,
  },
  complete: {
    title: 'Mark order completed',
    body: 'Marks the order as finished. This is final: a completed order can no longer be cancelled from here, and it opens the customer\u2019s return window.',
    confirm: 'Mark completed',
    danger: false,
    withReason: false,
  },
  cancel: {
    title: 'Cancel order',
    body: 'The customer is emailed, and any stock, sale allocation and coupon usage go back.',
    confirm: 'Cancel order',
    danger: true,
    withReason: true,
  },
  reject: {
    title: 'Reject order',
    body: 'The customer is emailed, and any stock, sale allocation and coupon usage go back.',
    confirm: 'Reject order',
    danger: true,
    withReason: true,
  },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);

/**
 * The "Actions" box at the end of the order page: the state changes staff can make to an order,
 * limited to what the backend allows:
 * Pending → Processing (start fulfilment) or Cancelled/Rejected; Processing → Completed or Cancelled.
 * Cancelling a paid order refunds it through Paystack in the same action, so that is spelled out
 * before confirming.
 */
export default function OrderActions({ order }: OrderActionsProps) {
  const [pending, setPending] = useState<PendingAction>(null);
  const [reason, setReason] = useState('');

  const updateStatus = useUpdateOrderStatus();
  const cancelOrder = useCancelOrder({ onSuccess: () => close() });
  const rejectOrder = useRejectOrder({ onSuccess: () => close() });

  const busy =
    updateStatus.isPending || cancelOrder.isPending || rejectOrder.isPending;
  const status = String(order.status);
  const canStart = status === 'Pending';
  const canComplete = status === 'Processing';
  const canCancel = status === 'Pending' || status === 'Processing';

  const close = () => {
    setPending(null);
    setReason('');
  };

  const confirm = () => {
    const data = { reason: reason.trim() || undefined };
    if (pending === 'cancel') cancelOrder.mutate({ orderId: order._id, data });
    if (pending === 'reject') rejectOrder.mutate({ orderId: order._id, data });
    if (pending === 'start' || pending === 'complete') {
      const status = (
        pending === 'start' ? 'Processing' : 'Completed'
      ) as Order['status'];
      updateStatus.mutate(
        { orderId: order._id, data: { status } },
        { onSuccess: () => close() }
      );
    }
  };

  const copy = pending ? ACTION_COPY[pending] : null;

  if (!canStart && !canComplete && !canCancel) return null;

  return (
    <>
      <div className="rounded-lg border px-4 py-3">
        <Text className="mb-2 text-lg font-semibold">Actions</Text>
        <div className="flex flex-wrap justify-end gap-2">
          {canStart && (
            <Button
              size="lg"
              variant="outline"
              disabled={busy}
              onClick={() => setPending('start')}
            >
              <PiArrowRightBold className="me-1.5 h-4 w-4" /> Start processing
            </Button>
          )}
          {canComplete && (
            <Button
              size="lg"
              disabled={busy}
              onClick={() => setPending('complete')}
            >
              <PiCheckBold className="me-1.5 h-4 w-4" /> Mark completed
            </Button>
          )}
          {canCancel && (
            <>
              <Button
                size="lg"
                variant="outline"
                color="danger"
                disabled={busy}
                onClick={() => setPending('cancel')}
              >
                <PiXBold className="me-1.5 h-4 w-4" /> Cancel order
              </Button>
              {canStart && (
                <Button
                  size="lg"
                  variant="flat"
                  color="danger"
                  disabled={busy}
                  onClick={() => setPending('reject')}
                >
                  <PiProhibitBold className="me-1.5 h-4 w-4" /> Reject
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <Modal isOpen={pending !== null} onClose={close} size="md">
        {copy && (
          <div className="p-6">
            <Text className="text-lg font-semibold text-gray-900">
              {copy.title} #{order.orderNumber}
            </Text>
            <Text className="mt-1 text-sm text-gray-600">{copy.body}</Text>

            {copy.danger &&
              (order.isPaid ? (
                <Alert color="warning" className="mt-4">
                  This order is paid. Confirming refunds{' '}
                  <strong>{formatCurrency(order.total)}</strong> to the customer
                  through Paystack. The refund completes when Paystack confirms
                  it.
                </Alert>
              ) : (
                <Alert color="info" className="mt-4">
                  This order is unpaid, so nothing is refunded.
                </Alert>
              ))}

            {copy.withReason && (
              <Textarea
                label="Reason (optional; shown to the customer)"
                placeholder={
                  pending === 'reject'
                    ? 'Defaults to "We were unable to fulfil this order"'
                    : 'e.g. Item damaged in the warehouse'
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={500}
                className="mt-4"
              />
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={close} disabled={busy}>
                {copy.danger ? 'Keep order' : 'Cancel'}
              </Button>
              <Button
                color={copy.danger ? 'danger' : 'primary'}
                onClick={confirm}
                isLoading={busy}
              >
                {copy.confirm}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
