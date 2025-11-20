'use client';

import { useMyDeliveryStats } from '@/hooks/queries/useDeliveries';
import { Loader, Text } from 'rizzui';
import { PiReceiptDuotone, PiCheckCircleDuotone, PiXCircleDuotone, PiClockDuotone, PiArrowCounterClockwiseDuotone } from 'react-icons/pi';
import { BiBus } from 'react-icons/bi';

type Variant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';

const StatCard = ({ title, value, icon, variant = 'secondary', description }: { title: string; value: string | number; icon?: React.ReactNode; variant?: Variant; description?: string }) => {
  const variantClasses: Record<Variant, string> = {
    primary: 'bg-primary-lighter/20 text-primary',
    success: 'bg-green-lighter/20 text-green-dark',
    warning: 'bg-orange-lighter/20 text-orange-dark',
    danger: 'bg-red-lighter/20 text-red-dark',
    info: 'bg-blue-lighter/20 text-blue-dark',
    secondary: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="rounded-lg border border-muted bg-white p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Text className="mb-1 text-xs font-medium text-gray-600">{title}</Text>
          <Text className="text-xl font-bold text-gray-900">{value}</Text>
          {description && <Text className="mt-1 text-[11px] text-gray-500">{description}</Text>}
        </div>
        {icon && <div className={`rounded-lg p-2 ${variantClasses[variant]}`}>{icon}</div>}
      </div>
    </div>
  );
};

export default function DeliveryStatsRow() {
  const { data: stats, isLoading, error } = useMyDeliveryStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 @sm:grid-cols-3 @xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex h-20 items-center justify-center rounded-lg border border-muted bg-white">
            <Loader variant="spinner" size="sm" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
        <Text className="text-red-600">Failed to load delivery statistics. Please try again.</Text>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 @xl:grid-cols-3 @4xl:grid-cols-6">
      {/* <StatCard title="In Warehouse" value={stats['In-Warehouse'] ?? 0} icon={<PiReceiptDuotone className="h-5 w-5" />} variant="secondary" /> */}
      <StatCard title="Shipped" value={stats.Shipped ?? 0} icon={<PiClockDuotone className="h-5 w-5" />} variant="info" />
      <StatCard title="Dispatched" value={stats.Dispatched ?? 0} icon={<PiClockDuotone className="h-5 w-5" />} variant="warning" />
      <StatCard title="In-Transit" value={stats['In-Transit'] ?? 0} icon={<BiBus className="h-5 w-5" />} variant="warning" />
      <StatCard title="Delivered" value={stats.Delivered ?? 0} icon={<PiCheckCircleDuotone className="h-5 w-5" />} variant="success" />
      <StatCard title="Returned" value={stats.Returned ?? 0} icon={<PiArrowCounterClockwiseDuotone className="h-5 w-5" />} variant="info" />
      <StatCard title="Failed" value={stats.Failed ?? 0} icon={<PiXCircleDuotone className="h-5 w-5" />} variant="danger" />
    </div>
  );
}
