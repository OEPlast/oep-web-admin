import TransactionsAnalyticsClient from './transactions-client';
import { metaObject } from '@/config/site.config';

export const metadata = {
  ...metaObject('Transactions Analytics', undefined, 'Comprehensive transactions analytics and insights'),
};

export default function TransactionsAnalyticsPage() {
  return <TransactionsAnalyticsClient />;
}
