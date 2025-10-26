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
      href: routes.forms.profileSettings,
      name: 'Form',
    },
    {
      name: 'Account Settings',
    },
  ],
};
const menuItemsForMiniNav = [
  {
    label: 'My Details',
    value: '/forms/profile-settings',
  },
  {
    label: 'Profile',
    value: '/forms/profile-settings/profile',
  },
  {
    label: 'Password',
    value: '/forms/profile-settings/password',
  },
  {
    label: 'Notifications',
    value: '/forms/profile-settings/notification',
  },
  {
    label: 'Integrations',
    value: '/forms/profile-settings/integration',
  },
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
