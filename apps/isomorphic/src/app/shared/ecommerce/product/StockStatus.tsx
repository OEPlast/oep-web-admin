'use client';

import { Badge } from 'rizzui';
import cn from '@core/utils/class-names';

interface StockStatusProps {
  stock: number;
  lowStockThreshold: number;
  className?: string;
}

export default function StockStatus({ stock, lowStockThreshold, className }: StockStatusProps) {
  if (stock === 0) {
    return (
      <Badge variant="flat" color="danger" className={cn('font-medium', className)}>
        Out of Stock
      </Badge>
    );
  }

  if (stock <= lowStockThreshold) {
    return (
      <Badge variant="flat" color="warning" className={cn('font-medium', className)}>
        Low Stock ({stock})
      </Badge>
    );
  }

  return (
    <Badge variant="flat" color="success" className={cn('font-medium', className)}>
      In Stock ({stock})
    </Badge>
  );
}
