'use client';

import { ActionIcon, Badge } from 'rizzui';
import { PiBellSimpleRingingDuotone } from 'react-icons/pi';
import ProfileMenu from '@/layouts/profile-menu';
import NotificationDropdown, { useUnreadNotificationCount } from '@/layouts/notification-dropdown';

function NotificationBell() {
  const unread = useUnreadNotificationCount();
  return (
    <NotificationDropdown>
      <ActionIcon
        aria-label="Notifications"
        variant="text"
        className="relative h-[34px] w-[34px] shadow backdrop-blur-md dark:bg-gray-100 md:h-9 md:w-9"
      >
        <PiBellSimpleRingingDuotone className="h-[18px] w-auto" />
        {unread > 0 && (
          <Badge renderAsDot color="warning" enableOutlineRing className="absolute right-1 top-2.5 -translate-x-1/2" />
        )}
      </ActionIcon>
    </NotificationDropdown>
  );
}

export default function HeaderMenuRight() {
  return (
    <div className="ms-auto grid shrink-0 grid-cols-2 items-center gap-2 text-gray-700 xs:gap-3 xl:gap-4">
      <NotificationBell />
      <ProfileMenu />
    </div>
  );
}
