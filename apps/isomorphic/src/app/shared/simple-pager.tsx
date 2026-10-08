'use client';

import { Button, Text } from 'rizzui';

interface SimplePagerProps {
  page: number;
  pages: number;
  total?: number;
  onChange: (page: number) => void;
  isLoading?: boolean;
}

/** Previous / next with "Page x of y" for list pages that get `{ page, pages, total }` meta. */
export default function SimplePager({ page, pages, total, onChange, isLoading }: SimplePagerProps) {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <Text className="text-sm text-gray-500">
        Page {page} of {pages}
        {total != null && ` · ${total} total`}
      </Text>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1 || isLoading} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <Button size="sm" variant="outline" disabled={page >= pages || isLoading} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
