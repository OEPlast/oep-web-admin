'use client';

import { useMedia } from '@core/hooks/use-media';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import { ReactElement, RefObject, useCallback, useEffect, useMemo, useState } from 'react';
import { PiArrowCounterClockwiseBold, PiMoneyBold, PiPackageBold, PiWarningBold } from 'react-icons/pi';
import { Badge, Button, Popover, Text, Title } from 'rizzui';
import { routes } from '@/config/routes';
import { useStaffNotifications, type StaffNotification } from '@/hooks/queries/useStaffNotifications';

dayjs.extend(relativeTime);

const SEEN_KEY = 'staff-notifications-seen-at';

const KIND_ICON: Record<StaffNotification['kind'], ReactElement> = {
  order: <PiPackageBold />,
  return: <PiArrowCounterClockwiseBold />,
  transaction: <PiMoneyBold />,
  inventory: <PiWarningBold />,
};

/** When the bell was last opened, kept per browser. Items newer than this count as unread. */
function useSeenAt() {
  const [seenAt, setSeenAt] = useState<number>(0);
  useEffect(() => {
    try {
      setSeenAt(Number(window.localStorage.getItem(SEEN_KEY) || 0));
    } catch {
      /* storage unavailable */
    }
  }, []);
  const markSeen = useCallback(() => {
    const now = Date.now();
    setSeenAt(now);
    try {
      window.localStorage.setItem(SEEN_KEY, String(now));
    } catch {
      /* storage unavailable */
    }
  }, []);
  return { seenAt, markSeen };
}

/** Unread count for the bell badge. Exported so the header can render it without the popover open. */
export function useUnreadNotificationCount(): number {
  const { data } = useStaffNotifications();
  const { seenAt } = useSeenAt();
  return useMemo(
    () => (data?.items ?? []).filter((item) => new Date(item.at).getTime() > seenAt).length,
    [data, seenAt]
  );
}

function NotificationsList({ setIsOpen }: { setIsOpen: React.Dispatch<React.SetStateAction<boolean>> }) {
  const { data, isLoading } = useStaffNotifications();
  const { seenAt, markSeen } = useSeenAt();

  const counts = data?.counts;
  const items = data?.items ?? [];

  return (
    <div className="w-[320px] text-left sm:w-[360px] 2xl:w-[420px] rtl:text-right">
      <div className="mb-3 flex items-center justify-between ps-6">
        <Title as="h5" fontWeight="semibold">
          Needs attention
        </Title>
        <Button size="sm" variant="text" onClick={markSeen}>
          Mark all as read
        </Button>
      </div>

      {counts && (
        <div className="mb-3 grid grid-cols-2 gap-2 ps-6">
          <CountTile label="Orders to fulfil" value={counts.ordersToFulfil} href={`${routes.eCommerce.orders}?status=Processing`} onClick={() => setIsOpen(false)} />
          <CountTile label="Returns pending" value={counts.pendingReturns} href={`${routes.eCommerce.returns}?status=pending`} onClick={() => setIsOpen(false)} />
          <CountTile label="Payments to review" value={counts.transactionsForReview} href={`${routes.transactions.list}?needsReview=true`} onClick={() => setIsOpen(false)} />
          <CountTile label="Low stock" value={counts.lowStock} href={`${routes.inventory}?low=1`} onClick={() => setIsOpen(false)} />
        </div>
      )}

      <div className="custom-scrollbar max-h-[380px] overflow-y-auto scroll-smooth">
        <div className="grid grid-cols-1 gap-1 ps-4">
          {isLoading && <Text className="px-2 py-4 text-sm text-gray-500">Loading…</Text>}
          {!isLoading && items.length === 0 && (
            <Text className="px-2 py-4 text-sm text-gray-500">Nothing new in the last 48 hours.</Text>
          )}
          {items.map((item) => {
            const unread = new Date(item.at).getTime() > seenAt;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="group grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-md px-2 py-2 pe-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded bg-gray-100/70 p-1 dark:bg-gray-50/50 [&>svg]:h-auto [&>svg]:w-5">
                  {KIND_ICON[item.kind]}
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center">
                  <div className="w-full">
                    <Text className="mb-0.5 w-11/12 truncate text-sm font-semibold text-gray-900 dark:text-gray-700">
                      {item.title}
                    </Text>
                    <Text className="truncate text-xs text-gray-500">
                      {item.detail ? `${item.detail} · ` : ''}
                      {dayjs(item.at).fromNow()}
                    </Text>
                  </div>
                  <div className="ms-auto flex-shrink-0">
                    {unread && <Badge renderAsDot size="lg" color="primary" className="scale-90" />}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CountTile({ label, value, href, onClick }: { label: string; value: number; href: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="rounded-md border border-muted px-3 py-2 hover:bg-gray-50">
      <Text className="text-lg font-semibold leading-tight">{value}</Text>
      <Text className="text-xs text-gray-500">{label}</Text>
    </Link>
  );
}

export default function NotificationDropdown({
  children,
}: {
  children: ReactElement & { ref?: RefObject<any> };
}) {
  const isMobile = useMedia('(max-width: 480px)', false);
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popover isOpen={isOpen} setIsOpen={setIsOpen} shadow="sm" placement={isMobile ? 'bottom' : 'bottom-end'}>
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content className="z-[9999] px-0 pb-4 pe-6 pt-5 dark:bg-gray-100 [&>svg]:hidden [&>svg]:dark:fill-gray-100 sm:[&>svg]:inline-flex">
        <NotificationsList setIsOpen={setIsOpen} />
      </Popover.Content>
    </Popover>
  );
}
