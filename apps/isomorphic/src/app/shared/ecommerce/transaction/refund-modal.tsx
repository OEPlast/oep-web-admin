/**
 * Refund Modal Component
 * Handle full and partial refunds for completed transactions
 */

'use client';

import { useState, useEffect } from 'react';
import { Modal, Input, Textarea, Button, Text } from 'rizzui';
import { PiWarningCircle } from 'react-icons/pi';
import { useProcessRefund } from '@/hooks/mutations/useTransactionMutations';
import type { Transaction, Refund } from '@/types/transaction.types';
import cn from '@core/utils/class-names';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export default function RefundModal({
  isOpen,
  onClose,
  transaction,
}: RefundModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; reason?: string }>({});

  const processRefund = useProcessRefund({
    onSuccess: () => {
      handleClose();
    },
  });

  useEffect(() => {
    if (isOpen && transaction) {
      // Reset form when modal opens
      setAmount('');
      setReason('');
      setErrors({});
    }
  }, [isOpen, transaction]);

  if (!transaction) return null;

  const totalRefunded = transaction.refunds.reduce((sum, refund) => {
    if (refund.status === 'completed') {
      return sum + refund.amount;
    }
    return sum;
  }, 0);

  const availableForRefund = transaction.amount - totalRefunded;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; reason?: string } = {};

    const amountNum = parseFloat(amount);

    if (!amount || isNaN(amountNum)) {
      newErrors.amount = 'Amount is required';
    } else if (amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (amountNum > availableForRefund) {
      newErrors.amount = `Amount cannot exceed ${formatCurrency(availableForRefund)}`;
    }

    if (!reason.trim()) {
      newErrors.reason = 'Reason is required';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'Reason must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    processRefund.mutate({
      transactionId: transaction._id,
      refundData: {
        amount: parseFloat(amount),
        reason: reason.trim(),
      },
    });
  };

  const handleClose = () => {
    if (!processRefund.isPending) {
      setAmount('');
      setReason('');
      setErrors({});
      onClose();
    }
  };

  const handleFullRefund = () => {
    setAmount(availableForRefund.toString());
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Text className="text-xl font-semibold text-gray-900">
            Process Refund
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Refund transaction: {transaction.reference}
          </Text>
        </div>

        {/* Transaction Summary */}
        <div className="mb-6 rounded-lg border border-muted bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="text-sm text-gray-600">Transaction Amount</Text>
              <Text className="font-semibold text-gray-900">
                {formatCurrency(transaction.amount)}
              </Text>
            </div>
            <div>
              <Text className="text-sm text-gray-600">Already Refunded</Text>
              <Text className="font-semibold text-red-600">
                {formatCurrency(totalRefunded)}
              </Text>
            </div>
            <div className="col-span-2">
              <Text className="text-sm text-gray-600">Available for Refund</Text>
              <Text className="text-lg font-bold text-green-600">
                {formatCurrency(availableForRefund)}
              </Text>
            </div>
          </div>
        </div>

        {/* Existing Refunds */}
        {transaction.refunds.length > 0 && (
          <div className="mb-6">
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Previous Refunds
            </Text>
            <div className="space-y-2">
              {transaction.refunds.map((refund, index) => (
                <div
                  key={refund.refundId || index}
                  className="flex items-center justify-between rounded border border-muted p-3 text-sm"
                >
                  <div>
                    <Text className="font-medium text-gray-900">
                      {formatCurrency(refund.amount)}
                    </Text>
                    <Text className="text-xs text-gray-500">{refund.reason}</Text>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      refund.status === 'completed' &&
                        'bg-green-100 text-green-700',
                      refund.status === 'pending' && 'bg-yellow-100 text-yellow-700',
                      refund.status === 'failed' && 'bg-red-100 text-red-700'
                    )}
                  >
                    {refund.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Refund Form */}
        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Text className="text-sm font-medium text-gray-700">
                Refund Amount (₦)
              </Text>
              <Button
                size="sm"
                variant="text"
                onClick={handleFullRefund}
                className="text-primary"
              >
                Full Refund
              </Button>
            </div>
            <Input
              type="number"
              placeholder="Enter amount..."
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                if (errors.amount) {
                  setErrors({ ...errors, amount: undefined });
                }
              }}
              min={0}
              max={availableForRefund}
              step="0.01"
              error={errors.amount}
            />
          </div>

          {/* Reason Input */}
          <div>
            <Text className="mb-2 text-sm font-medium text-gray-700">
              Refund Reason
            </Text>
            <Textarea
              placeholder="Enter reason for refund (minimum 10 characters)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (errors.reason) {
                  setErrors({ ...errors, reason: undefined });
                }
              }}
              rows={4}
              error={errors.reason}
            />
          </div>
        </div>

        {/* Warning Message */}
        {availableForRefund === 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-yellow-50 p-4">
            <PiWarningCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
            <div>
              <Text className="font-medium text-yellow-800">
                Transaction Fully Refunded
              </Text>
              <Text className="text-sm text-yellow-700">
                This transaction has been fully refunded. No further refunds can be
                processed.
              </Text>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={processRefund.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={processRefund.isPending}
            disabled={processRefund.isPending || availableForRefund === 0}
          >
            {processRefund.isPending ? 'Processing...' : 'Process Refund'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
