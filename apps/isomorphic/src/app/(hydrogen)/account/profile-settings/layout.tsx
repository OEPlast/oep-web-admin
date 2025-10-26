import { routes } from '@/config/routes';
import PageHeader from '@/app/shared/page-header';
import ProfileSettingsNav from '@/app/shared/account-settings/navigation';

const pageHeader = {
  title: 'Account Settings',
  breadcrumb: [
    {
      href: '/',
      name: 'Home',
    },
    {
      name: 'Account Settings',
    },
  ],
};
const menuItemsForMiniNav = [
  {
    label: 'My Details',
    value: '/account/profile-settings',
  },
  {
    label: 'Notifications',
    value: '/account/profile-settings/notification',
  }
];

export default function ProfileSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />
      <ProfileSettingsNav menuItems={menuItemsForMiniNav} />
      {children}
    </>
  );
}
