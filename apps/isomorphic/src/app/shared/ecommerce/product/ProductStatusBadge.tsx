'use client';

import { Badge } from 'rizzui';
import cn from '@core/utils/class-names';

interface ProductStatusBadgeProps {
  status: 'active' | 'inactive' | 'archived';
  className?: string;
}

export default function ProductStatusBadge({ status, className }: ProductStatusBadgeProps) {
  const statusConfig = {
    active: { color: 'success' as const, label: 'Active' },
    inactive: { color: 'secondary' as const, label: 'Inactive' },
    archived: { color: 'danger' as const, label: 'Archived' },
  };

  const config = statusConfig[status];

  return (
    <Badge
      variant="flat"
      color={config.color}
      className={cn('font-medium', className)}
    >
      {config.label}
    </Badge>
  );
}
