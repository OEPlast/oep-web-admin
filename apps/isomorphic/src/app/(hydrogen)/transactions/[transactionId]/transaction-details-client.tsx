/**
 * Transaction Details Client Component
 * Full transaction details page with actions
 */

'use client';

import { useState } from 'react';
import { Text, Button, Loader, Badge, Avatar, ActionIcon, Tooltip, Alert } from 'rizzui';
import {
  PiCopyBold,
  PiCheckCircleBold,
  PiWarningCircleBold,
  PiClockBold,
  PiArrowCounterClockwiseBold,
  PiXBold,
  PiPackageBold,
  PiUserBold,
  PiReceiptBold,
  PiCreditCardBold,
  PiMoneyBold,
  PiCalendarBold,
} from 'react-icons/pi';
import { useTransaction } from '@/hooks/queries/useTransactions';
import RefundModal from '@/app/shared/ecommerce/transaction/refund-modal';
import type { Transaction, TransactionStatus, TransactionReturn } from '@/types/transaction.types';
import cn from '@core/utils/class-names';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { handleApiError } from '@/libs/axios';
import toast from 'react-hot-toast';

dayjs.extend(relativeTime);

interface TransactionDetailsClientProps {
  transactionId: string;
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
    <Badge color={config.color} variant="flat" className="gap-1.5 px-3 py-1.5">
      <Icon className="h-4 w-4" />
      <span className="text-sm font-medium">{config.label}</span>
    </Badge>
  );
};

const InfoCard = ({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'rounded-lg border border-muted bg-white p-6 shadow-sm transition-shadow hover:shadow-md',
      className
    )}
  >
    <div className="mb-4 flex items-center gap-2">
      <div className="rounded-lg bg-primary-lighter/20 p-2">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <Text className="font-semibold text-gray-900">{title}</Text>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const InfoRow = ({
  label,
  value,
  badge,
  mono = false,
  copyable = false,
}: {
  label: string;
  value: string | React.ReactNode;
  badge?: React.ReactNode;
  mono?: boolean;
  copyable?: boolean;
}) => {
  const handleCopy = () => {
    if (typeof value === 'string') {
      navigator.clipboard.writeText(value);
      toast.success(`${label} copied to clipboard`);
    }
  };

  return (
    <div className="flex items-center justify-between py-2">
      <Text className="text-sm text-gray-600">{label}</Text>
      <div className="flex items-center gap-2">
        {badge ? (
          badge
        ) : (
          <Text className={cn('text-sm font-medium text-gray-900', mono && 'font-mono')}>
            {value}
          </Text>
        )}
        {copyable && typeof value === 'string' && (
          <Tooltip content={`Copy ${label}`}>
            <ActionIcon size="sm" variant="text" onClick={handleCopy}>
              <PiCopyBold className="h-3.5 w-3.5" />
            </ActionIcon>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default function TransactionDetailsClient({
  transactionId,
}: TransactionDetailsClientProps) {
  const [showRefundModal, setShowRefundModal] = useState(false);
  const { data: transaction, isLoading, error } = useTransaction(transactionId);

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

  const handleCopyReference = () => {
    if (transaction?.reference) {
      navigator.clipboard.writeText(transaction.reference);
      toast.success('Reference copied to clipboard');
    }
  };

  // Type guards
  const isPopulatedUser = (
    user: any
  ): user is { _id: string; firstName: string; lastName: string; email: string; phoneNumber?: string } => {
    return user && typeof user === 'object' && 'firstName' in user;
  };

  const isPopulatedOrder = (
    order: any
  ): order is { _id: string; total: number; status: string; deliveryStatus?: string } => {
    return order && typeof order === 'object' && 'total' in order;
  };

  const isPopulatedReturn = (
    returnData: any
  ): returnData is TransactionReturn => {
    return returnData && typeof returnData === 'object' && '_id' in returnData;
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="p-6">
        <Alert color="danger" className="max-w-2xl">
          <div className="flex flex-col gap-2">
            <Text className="font-semibold">Failed to load transaction</Text>
            <Text className="text-sm">{handleApiError(error)}</Text>
          </div>
        </Alert>
      </div>
    );
  }

  const user = isPopulatedUser(transaction.user || transaction.userId)
    ? (transaction.user as any)
    : null;
  const order = isPopulatedOrder(transaction.order || transaction.orderId)
    ? (transaction.order as any)
    : null;
  const returnData = isPopulatedReturn(transaction.return || transaction.returnId)
    ? (transaction.return as TransactionReturn)
    : null;

  const totalRefunded = transaction.refunds.reduce((sum, refund) => {
    if (refund.status !== 'failed') {
      return sum + refund.amount;
    }
    return sum;
  }, 0);

  const canRefund =
    ['completed', 'partially_refunded'].includes(transaction.status) &&
    transaction.paymentGateway === 'paystack' &&
    transaction.transactionType === 'order_payment' &&
    totalRefunded < transaction.amount;

  return (
    <>
      <div className="@container">
        <div className="grid gap-6 @4xl:gap-7">
          {transaction.review?.required && (
            <Alert color="danger">
              <div className="flex flex-col gap-1">
                <Text className="font-semibold">This payment needs your attention</Text>
                <Text className="text-sm">{transaction.review.reason}</Text>
                {canRefund && (
                  <Text className="text-sm text-gray-600">
                    Processing the refund below clears this flag.
                  </Text>
                )}
              </div>
            </Alert>
          )}
          {/* Header Card with Transaction Summary */}
          <div className="rounded-xl border border-muted bg-gradient-to-br from-primary-lighter/10 via-white to-white p-6 shadow-sm @4xl:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <Text className="text-2xl font-bold text-gray-900 @4xl:text-3xl">
                    {formatCurrency(transaction.amount)}
                  </Text>
                  <StatusBadge status={transaction.status} />
                </div>
                <div className="flex items-center gap-2">
                  <Text className="text-sm text-gray-600">Reference:</Text>
                  <Text className="font-mono text-sm font-medium text-gray-900">
                    {transaction.reference}
                  </Text>
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
                <Text className="mt-1 text-sm text-gray-500">
                  {transaction.currency} • {transaction.paymentGateway.toUpperCase()} •{' '}
                  {transaction.transactionType === 'return_refund' ? 'Return Refund' : 'Order Payment'} •{' '}
                  {formatDate(transaction.createdAt)}
                </Text>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                {canRefund && (
                  <Button
                    variant="outline"
                    onClick={() => setShowRefundModal(true)}
                    className="gap-2"
                  >
                    <PiArrowCounterClockwiseBold className="h-4 w-4" />
                    Process Refund
                  </Button>
                )}
                {order && (
                  <Link href={routes.eCommerce.orderDetails(order._id)}>
                    <Button variant="outline" className="gap-2">
                      <PiPackageBold className="h-4 w-4" />
                      View Order
                    </Button>
                  </Link>
                )}
                {returnData && (
                  <Link href={routes.eCommerce.returnDetails(returnData._id)}>
                    <Button variant="outline" className="gap-2">
                      <PiArrowCounterClockwiseBold className="h-4 w-4" />
                      View Return
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Refund Alert if applicable */}
            {totalRefunded > 0 && (
              <Alert color="info" className="border-l-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Text className="font-semibold">
                      {transaction.status === 'refunded'
                        ? 'Fully Refunded'
                        : 'Partially Refunded'}
                    </Text>
                    <Text className="text-sm">
                      {formatCurrency(totalRefunded)} has been refunded to the customer
                    </Text>
                  </div>
                  <Text className="text-lg font-bold text-red-600">
                    -{formatCurrency(totalRefunded)}
                  </Text>
                </div>
              </Alert>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 @4xl:grid-cols-2 @4xl:gap-7">
            {/* Customer Information */}
            {user && (
              <InfoCard icon={PiUserBold} title="Customer Information">
                <div className="flex items-start gap-4">
                  <Avatar
                    name={`${user.firstName} ${user.lastName}`}
                    size="xl"
                    className="ring-2 ring-gray-100"
                  />
                  <div className="flex-1 space-y-1">
                    <Text className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </Text>
                    <Text className="text-sm text-gray-600">{user.email}</Text>
                    {user.phoneNumber && (
                      <Text className="text-sm text-gray-600">{user.phoneNumber}</Text>
                    )}
                    <Link href={routes.users.details(user._id)}>
                      <Button variant="text" size="sm" className="mt-2 gap-1.5 px-0">
                        View Customer Profile
                        <PiUserBold className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </InfoCard>
            )}

            {/* Order Information */}
            {order && (
              <InfoCard icon={PiPackageBold} title="Order Information">
                <InfoRow
                  label="Order ID"
                  value={order._id}
                  mono
                  copyable
                />
                <InfoRow
                  label="Order Total"
                  value={formatCurrency(order.total)}
                />
                <InfoRow
                  label="Order Status"
                  value=""
                  badge={<Badge variant="flat">{order.status}</Badge>}
                />
                {order.deliveryStatus && (
                  <InfoRow
                    label="Delivery Status"
                    value=""
                    badge={<Badge variant="flat">{order.deliveryStatus}</Badge>}
                  />
                )}
                <div className="pt-3">
                  <Link href={routes.eCommerce.orderDetails(order._id)}>
                    <Button variant="text" size="sm" className="gap-1.5 px-0">
                      View Full Order Details
                      <PiPackageBold className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </InfoCard>
            )}

            {/* Return Information */}
            {returnData && (
              <InfoCard icon={PiArrowCounterClockwiseBold} title="Return Information">
                <InfoRow
                  label="Return ID"
                  value={returnData._id}
                  mono
                  copyable
                />
                <InfoRow
                  label="Refund Amount"
                  value={formatCurrency(returnData.refundAmount)}
                />
                <InfoRow
                  label="Return Status"
                  value=""
                  badge={
                    <Badge 
                      variant="flat"
                      color={
                        returnData.status === 'approved' ? 'success' :
                        returnData.status === 'pending' ? 'warning' :
                        returnData.status === 'rejected' ? 'danger' : 'secondary'
                      }
                    >
                      {returnData.status}
                    </Badge>
                  }
                />
                <InfoRow
                  label="Reason"
                  value={returnData.reason}
                />
                <div className="pt-3">
                  <Link href={routes.eCommerce.returnDetails(returnData._id)}>
                    <Button variant="text" size="sm" className="gap-1.5 px-0">
                      View Full Return Details
                      <PiArrowCounterClockwiseBold className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </InfoCard>
            )}

            {/* Payment Details */}
            <InfoCard icon={PiCreditCardBold} title="Payment Details">
              <InfoRow
                label="Payment Method"
                value=""
                badge={
                  <Badge variant="flat" className="capitalize">
                    {transaction.paymentMethod.replace('_', ' ')}
                  </Badge>
                }
              />
              <InfoRow
                label="Payment Gateway"
                value=""
                badge={
                  <Badge variant="flat" className="capitalize">
                    {transaction.paymentGateway}
                  </Badge>
                }
              />
              {transaction.channel && (
                <InfoRow label="Channel" value={transaction.channel} />
              )}
              {transaction.gatewayResponse?.gatewayTransactionId && (
                <InfoRow
                  label="Gateway Txn ID"
                  value={transaction.gatewayResponse.gatewayTransactionId}
                  mono
                  copyable
                />
              )}
              {transaction.gatewayResponse?.responseCode && (
                <InfoRow
                  label="Response Code"
                  value={transaction.gatewayResponse.responseCode}
                />
              )}
            </InfoCard>

            {/* Fees Breakdown */}
            {(transaction.fees.gatewayFee > 0 ||
              transaction.fees.processingFee > 0) && (
              <InfoCard icon={PiMoneyBold} title="Fees Breakdown">
                <InfoRow
                  label="Gateway Fee"
                  value={formatCurrency(transaction.fees.gatewayFee)}
                />
                <InfoRow
                  label="Processing Fee"
                  value={formatCurrency(transaction.fees.processingFee)}
                />
                <div className="border-t border-muted pt-3">
                  <InfoRow
                    label="Total Fees"
                    value={
                      <Text className="text-base font-bold text-gray-900">
                        {formatCurrency(transaction.fees.totalFees)}
                      </Text>
                    }
                  />
                </div>
              </InfoCard>
            )}

            {/* Timeline */}
            <InfoCard icon={PiCalendarBold} title="Transaction Timeline" className="@4xl:col-span-2">
              <div className="grid gap-4 @2xl:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-4">
                  <Text className="mb-2 text-sm font-medium text-gray-600">
                    Created
                  </Text>
                  <Text className="font-semibold text-gray-900">
                    {formatDate(transaction.createdAt)}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {getRelativeTime(transaction.createdAt)}
                  </Text>
                </div>
                {transaction.paidAt && (
                  <div className="rounded-lg bg-green-50 p-4">
                    <Text className="mb-2 text-sm font-medium text-green-700">
                      Paid
                    </Text>
                    <Text className="font-semibold text-green-900">
                      {formatDate(transaction.paidAt)}
                    </Text>
                    <Text className="text-xs text-green-600">
                      {getRelativeTime(transaction.paidAt)}
                    </Text>
                  </div>
                )}
                <div className="rounded-lg bg-blue-50 p-4">
                  <Text className="mb-2 text-sm font-medium text-blue-700">
                    Last Updated
                  </Text>
                  <Text className="font-semibold text-blue-900">
                    {formatDate(transaction.updatedAt)}
                  </Text>
                  <Text className="text-xs text-blue-600">
                    {getRelativeTime(transaction.updatedAt)}
                  </Text>
                </div>
              </div>
            </InfoCard>

            {/* Refund History */}
            {transaction.refunds.length > 0 && (
              <InfoCard
                icon={PiArrowCounterClockwiseBold}
                title="Refund History"
                className="@4xl:col-span-2"
              >
                <div className="space-y-4">
                  {transaction.refunds.map((refund, index) => (
                    <div
                      key={refund.refundId || index}
                      className="rounded-lg border border-muted bg-gray-50 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <Text className="text-lg font-bold text-gray-900">
                            {formatCurrency(refund.amount)}
                          </Text>
                          {refund.refundId && (
                            <Text className="text-xs font-mono text-gray-500">
                              ID: {refund.refundId}
                            </Text>
                          )}
                        </div>
                        <Badge
                          color={
                            refund.status === 'completed'
                              ? 'success'
                              : refund.status === 'pending'
                                ? 'warning'
                                : 'danger'
                          }
                          variant="flat"
                          className="capitalize"
                        >
                          {refund.status}
                        </Badge>
                      </div>
                      <Text className="mb-2 text-sm text-gray-700">
                        <span className="font-medium">Reason:</span> {refund.reason}
                      </Text>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(refund.refundDate)}</span>
                        <span>{getRelativeTime(refund.refundDate)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="rounded-lg bg-red-50 p-4">
                    <div className="flex items-center justify-between">
                      <Text className="font-semibold text-red-900">
                        Total Refunded Amount
                      </Text>
                      <Text className="text-xl font-bold text-red-600">
                        {formatCurrency(totalRefunded)}
                      </Text>
                    </div>
                  </div>
                </div>
              </InfoCard>
            )}
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
