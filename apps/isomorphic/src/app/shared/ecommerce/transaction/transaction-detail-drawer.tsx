/**
 * Transaction Detail Drawer
 * Comprehensive transaction details with actions
 */

'use client';

import { useState } from 'react';
import { Text, Button, Loader, Badge, Avatar, ActionIcon, Tooltip } from 'rizzui';
import {
  PiXBold,
  PiCopyBold,
  PiCheckCircleBold,
  PiWarningCircleBold,
  PiClockBold,
  PiArrowCounterClockwiseBold,
  PiReceiptBold,
  PiUserBold,
  PiPackageBold,
} from 'react-icons/pi';
import { useTransaction } from '@/hooks/queries/useTransactions';
import RefundModal from './refund-modal';
import type { Transaction, TransactionStatus } from '@/types/transaction.types';
import cn from '@core/utils/class-names';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { routes } from '@/config/routes';

dayjs.extend(relativeTime);

interface TransactionDetailDrawerProps {
  transactionId: string;
  onClose?: () => void;
}

const StatusBadge = ({ status }: { status: TransactionStatus }) => {
  const statusConfig = {
    pending: { color: 'warning' as const, icon: PiClockBold, label: 'Pending' },
    completed: {
      color: 'success' as const,
      icon: PiCheckCircleBold,
      label: 'Completed',
    },
    failed: { color: 'danger' as const, icon: PiWarningCircleBold, label: 'Failed' },
    cancelled: { color: 'secondary' as const, icon: PiXBold, label: 'Cancelled' },
    refunded: {
      color: 'info' as const,
      icon: PiArrowCounterClockwiseBold,
      label: 'Refunded',
    },
    partially_refunded: {
      color: 'info' as const,
      icon: PiArrowCounterClockwiseBold,
      label: 'Partially Refunded',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge color={config.color} variant="flat" className="gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default function TransactionDetailDrawer({
  transactionId,
  onClose,
}: TransactionDetailDrawerProps) {
  const [showRefundModal, setShowRefundModal] = useState(false);
  const { data: transaction, isLoading, error } = useTransaction(transactionId);

  const handleCopyReference = () => {
    if (transaction?.reference) {
      navigator.clipboard.writeText(transaction.reference);
      // Toast notification would be triggered by copy action
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return dayjs(date).format('MMM DD, YYYY HH:mm');
  };

  const getRelativeTime = (date: string) => {
    return dayjs(date).fromNow();
  };

  // Type guard to check if populated
  const isPopulatedUser = (
    user: any
  ): user is { _id: string; firstName: string; lastName: string; email: string } => {
    return user && typeof user === 'object' && 'firstName' in user;
  };

  const isPopulatedOrder = (
    order: any
  ): order is { _id: string; total: number; status: string } => {
    return order && typeof order === 'object' && 'total' in order;
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <Text className="text-red-600">
            Failed to load transaction details. Please try again.
          </Text>
          {onClose && (
            <Button onClick={onClose} className="mt-4">
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  const user = isPopulatedUser(transaction.user || transaction.userId)
    ? (transaction.user as any)
    : null;
  const order = isPopulatedOrder(transaction.order || transaction.orderId)
    ? (transaction.order as any)
    : null;

  const totalRefunded = transaction.refunds.reduce((sum, refund) => {
    if (refund.status === 'completed') {
      return sum + refund.amount;
    }
    return sum;
  }, 0);

  const canRefund =
    transaction.status === 'completed' && totalRefunded < transaction.amount;

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-muted p-6">
          <div className="flex-1">
            <Text className="mb-1 text-xl font-semibold text-gray-900">
              Transaction Details
            </Text>
            <div className="flex items-center gap-2">
              <Text className="text-sm text-gray-500">{transaction.reference}</Text>
              <Tooltip content="Copy Reference">
                <ActionIcon
                  size="sm"
                  variant="text"
                  onClick={handleCopyReference}
                  className="hover:text-primary"
                >
                  <PiCopyBold className="h-4 w-4" />
                </ActionIcon>
              </Tooltip>
            </div>
          </div>
          {onClose && (
            <ActionIcon size="sm" variant="text" onClick={onClose}>
              <PiXBold className="h-5 w-5" />
            </ActionIcon>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Transaction Summary */}
            <div className="rounded-lg border border-muted bg-gradient-to-br from-primary-lighter/10 to-transparent p-5">
              <div className="mb-4 flex items-center justify-between">
                <Text className="text-sm font-medium text-gray-600">
                  Transaction Amount
                </Text>
                <StatusBadge status={transaction.status} />
              </div>
              <Text className="text-3xl font-bold text-gray-900">
                {formatCurrency(transaction.amount)}
              </Text>
              <Text className="mt-1 text-sm text-gray-500">
                {transaction.currency} • {transaction.paymentGateway.toUpperCase()}
              </Text>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              {canRefund && (
                <Button
                  variant="outline"
                  onClick={() => setShowRefundModal(true)}
                  className="flex-1"
                >
                  <PiArrowCounterClockwiseBold className="mr-2 h-4 w-4" />
                  Process Refund
                </Button>
              )}
              {order && (
                <Link href={routes.eCommerce.editOrder(order._id)} className="flex-1">
                  <Button variant="outline" className="w-full">
                    <PiPackageBold className="mr-2 h-4 w-4" />
                    View Order
                  </Button>
                </Link>
              )}
            </div>

            {/* Customer Information */}
            {user && (
              <div>
                <Text className="mb-3 font-semibold text-gray-900">
                  Customer Information
                </Text>
                <div className="rounded-lg border border-muted p-4">
                  <div className="flex items-start gap-3">
                    <Avatar
                      name={`${user.firstName} ${user.lastName}`}
                      size="lg"
                    />
                    <div className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </Text>
                      <Text className="text-sm text-gray-500">{user.email}</Text>
                      {user.phoneNumber && (
                        <Text className="text-sm text-gray-500">
                          {user.phoneNumber}
                        </Text>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Information */}
            {order && (
              <div>
                <Text className="mb-3 font-semibold text-gray-900">
                  Order Information
                </Text>
                <div className="rounded-lg border border-muted p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Text className="text-sm text-gray-600">Order ID</Text>
                      <Text className="font-medium text-gray-900">{order._id}</Text>
                    </div>
                    <div className="flex items-center justify-between">
                      <Text className="text-sm text-gray-600">Order Total</Text>
                      <Text className="font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </Text>
                    </div>
                    <div className="flex items-center justify-between">
                      <Text className="text-sm text-gray-600">Order Status</Text>
                      <Badge variant="flat">{order.status}</Badge>
                    </div>
                    {order.deliveryStatus && (
                      <div className="flex items-center justify-between">
                        <Text className="text-sm text-gray-600">
                          Delivery Status
                        </Text>
                        <Badge variant="flat">{order.deliveryStatus}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div>
              <Text className="mb-3 font-semibold text-gray-900">
                Payment Details
              </Text>
              <div className="space-y-3 rounded-lg border border-muted p-4">
                <div className="flex items-center justify-between">
                  <Text className="text-sm text-gray-600">Payment Method</Text>
                  <Badge variant="flat">{transaction.paymentMethod}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <Text className="text-sm text-gray-600">Payment Gateway</Text>
                  <Badge variant="flat">{transaction.paymentGateway}</Badge>
                </div>
                {transaction.channel && (
                  <div className="flex items-center justify-between">
                    <Text className="text-sm text-gray-600">Channel</Text>
                    <Text className="font-medium text-gray-900">
                      {transaction.channel}
                    </Text>
                  </div>
                )}
                {transaction.gatewayResponse?.gatewayTransactionId && (
                  <div className="flex items-center justify-between">
                    <Text className="text-sm text-gray-600">Gateway Txn ID</Text>
                    <Text className="text-sm font-mono text-gray-900">
                      {transaction.gatewayResponse.gatewayTransactionId}
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* Fees Breakdown */}
            {(transaction.fees.gatewayFee > 0 ||
              transaction.fees.processingFee > 0) && (
              <div>
                <Text className="mb-3 font-semibold text-gray-900">
                  Fees Breakdown
                </Text>
                <div className="space-y-2 rounded-lg border border-muted p-4">
                  <div className="flex items-center justify-between">
                    <Text className="text-sm text-gray-600">Gateway Fee</Text>
                    <Text className="font-medium text-gray-900">
                      {formatCurrency(transaction.fees.gatewayFee)}
                    </Text>
                  </div>
                  <div className="flex items-center justify-between">
                    <Text className="text-sm text-gray-600">Processing Fee</Text>
                    <Text className="font-medium text-gray-900">
                      {formatCurrency(transaction.fees.processingFee)}
                    </Text>
                  </div>
                  <div className="flex items-center justify-between border-t border-muted pt-2">
                    <Text className="text-sm font-semibold text-gray-900">
                      Total Fees
                    </Text>
                    <Text className="font-semibold text-gray-900">
                      {formatCurrency(transaction.fees.totalFees)}
                    </Text>
                  </div>
                </div>
              </div>
            )}

            {/* Refund History */}
            {transaction.refunds.length > 0 && (
              <div>
                <Text className="mb-3 font-semibold text-gray-900">
                  Refund History
                </Text>
                <div className="space-y-3">
                  {transaction.refunds.map((refund, index) => (
                    <div
                      key={refund.refundId || index}
                      className="rounded-lg border border-muted p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <Text className="font-semibold text-gray-900">
                          {formatCurrency(refund.amount)}
                        </Text>
                        <Badge
                          color={
                            refund.status === 'completed'
                              ? 'success'
                              : refund.status === 'pending'
                                ? 'warning'
                                : 'danger'
                          }
                          variant="flat"
                        >
                          {refund.status}
                        </Badge>
                      </div>
                      <Text className="mb-2 text-sm text-gray-600">
                        {refund.reason}
                      </Text>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(refund.refundDate)}</span>
                        <span>{getRelativeTime(refund.refundDate)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-lg bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <Text className="text-sm font-semibold text-gray-700">
                        Total Refunded
                      </Text>
                      <Text className="font-semibold text-red-600">
                        {formatCurrency(totalRefunded)}
                      </Text>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div>
              <Text className="mb-3 font-semibold text-gray-900">Timeline</Text>
              <div className="space-y-3 rounded-lg border border-muted p-4">
                <div className="flex items-center justify-between">
                  <Text className="text-sm text-gray-600">Created</Text>
                  <div className="text-right">
                    <Text className="text-sm font-medium text-gray-900">
                      {formatDate(transaction.createdAt)}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {getRelativeTime(transaction.createdAt)}
                    </Text>
                  </div>
                </div>
                {transaction.paidAt && (
                  <div className="flex items-center justify-between">
                    <Text className="text-sm text-gray-600">Paid</Text>
                    <div className="text-right">
                      <Text className="text-sm font-medium text-gray-900">
                        {formatDate(transaction.paidAt)}
                      </Text>
                      <Text className="text-xs text-gray-500">
                        {getRelativeTime(transaction.paidAt)}
                      </Text>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Text className="text-sm text-gray-600">Last Updated</Text>
                  <div className="text-right">
                    <Text className="text-sm font-medium text-gray-900">
                      {formatDate(transaction.updatedAt)}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      {getRelativeTime(transaction.updatedAt)}
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      <RefundModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        transaction={transaction}
      />
    </>
  );
}
