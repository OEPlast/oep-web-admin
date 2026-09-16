import UsersAnalyticsClient from './users-client';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Users Analytics', undefined, 'Comprehensive users and customer analytics'),
};

export default function UsersAnalyticsPage() {
  return <UsersAnalyticsClient />;
}
