'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Input, Modal, Text, Title } from 'rizzui';
import { PiBarcodeDuotone, PiMagnifyingGlass } from 'react-icons/pi';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';

/**
 * Asks which product, when the page was opened without one.
 *
 * Keyed on SKU rather than name because SKU is what an operator has in hand off
 * a shelf label or a picking list, and it is unique — a name search would need a
 * results list and a second decision.
 *
 * Not dismissible: with no product there is nothing behind it to look at, so a
 * close button would only produce an empty page. The way out is the back button
 * or a valid SKU.
 */
export default function SkuPrompt({
  open,
  onResolved,
}: {
  open: boolean;
  onResolved: (product: { id: string; name: string }) => void;
}) {
  const [sku, setSku] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = async () => {
    const trimmed = sku.trim();

    // SKUs are numeric on the product model, so a non-numeric entry can be
    // rejected here rather than spending a round trip to be told the same.
    if (!trimmed) {
      setError('Enter a SKU to continue.');
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      setError('A SKU is a number — letters and symbols will not match a product.');
      return;
    }

    setChecking(true);
    setError(null);

    try {
      const response = await apiClient.get<{
        exists: boolean;
        productId?: string;
        productName?: string;
      }>(api.products.checkSku(trimmed));

      const result = response.data;

      if (!result?.exists || !result.productId) {
        setError(`No product has SKU ${trimmed}.`);
        return;
      }

      onResolved({ id: result.productId, name: result.productName ?? 'Product' });
    } catch {
      setError('Could not look that SKU up. Check the connection and try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={() => undefined} size="sm">
      <div className="p-6">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary-lighter">
            <PiBarcodeDuotone className="h-6 w-6 text-primary" />
          </span>
          <Title as="h3" className="text-lg font-semibold">
            Which product?
          </Title>
          <Text className="mt-1 text-sm text-gray-500">
            Enter the SKU to see its full performance.
          </Text>
        </div>

        <Input
          type="text"
          inputMode="numeric"
          autoFocus
          label="SKU"
          placeholder="e.g. 10432"
          value={sku}
          onChange={(event) => {
            setSku(event.target.value);
            if (error) setError(null);
          }}
          // Enter is the natural submit for a single-field form; without this the
          // key does nothing and the field feels broken.
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit();
          }}
          error={error ?? undefined}
          prefix={<PiMagnifyingGlass className="h-4 w-4 text-gray-500" />}
          className="w-full"
        />

        <Button
          className="mt-5 w-full"
          onClick={submit}
          isLoading={checking}
          disabled={checking}
        >
          View performance
        </Button>

        {/* The page behind this is empty, so without a way out the only exit is
            the browser's back button. */}
        <Link
          href="/analytics/products"
          className="mt-3 block text-center text-sm text-gray-500 hover:text-gray-900"
        >
          Back to products analytics
        </Link>
      </div>
    </Modal>
  );
}
