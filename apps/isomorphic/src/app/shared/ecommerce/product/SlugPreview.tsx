'use client';

import { Input } from 'rizzui';
import { useMemo } from 'react';

interface SlugPreviewProps {
  productName: string;
  currentSlug?: string;
  label?: string;
}

export default function SlugPreview({ 
  productName, 
  currentSlug,
  label = 'URL Slug (Auto-generated)'
}: SlugPreviewProps) {
  const generatedSlug = useMemo(() => {
    if (!productName) return '';
    return productName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, [productName]);

  return (
    <Input
      label={label}
      value={currentSlug || generatedSlug}
      disabled
      readOnly
      prefix={<span className="text-gray-500">products/</span>}
      helperText="This will be auto-generated from the product name"
    />
  );
}
