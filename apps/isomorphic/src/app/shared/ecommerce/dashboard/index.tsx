'use client'
import Link from 'next/link';
import Image from 'next/image';
import { routes } from '@/config/routes';
import { Button } from 'rizzui/button';
import WelcomeBanner from '@core/components/banners/welcome';
import StatCards from '@/app/shared/ecommerce/dashboard/stats-cards';
import ProfitWidget from '@/app/shared/ecommerce/dashboard/profit-widget';
import SalesReport from '@/app/shared/ecommerce/dashboard/sales-report';
import BestSellers from '@/app/shared/ecommerce/dashboard/best-sellers';
import CustomerRetentionRate from '@/app/shared/ecommerce/dashboard/repeat-customer-rate';
import UserLocation from '@/app/shared/ecommerce/dashboard/user-location';
import PromotionalSales from '@/app/shared/ecommerce/dashboard/promotional-sales';
import RecentOrder from '@/app/shared/ecommerce/dashboard/recent-order';
import StockReport from '@/app/shared/ecommerce/dashboard/stock-report';
import { PiPlusBold } from 'react-icons/pi';
import welcomeImg from '@public/shop-illustration.png';
import HandWaveIcon from '@core/components/icons/hand-wave';
import TotalProfitLoss from './total-profit-loss';
import RevenueExpenseChart from './revenue-expense';
import TopSellingProducts from './top-selling-products';
import { PermissionAction, PermissionResource, usePermissions } from '@/hooks/queries/usePermissions';
import { useUserProfile } from '@/hooks/queries/useUserProfile';

export default function EcommerceDashboard() {
  const {permissions,hasPermission} = usePermissions();
  const {data} = useUserProfile()
  return (
    <div className="@container">
      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-2 @7xl:grid-cols-12 3xl:gap-8">
        <WelcomeBanner
          title={
            <>
              Good Day, {data?.firstName}{' '}
              <HandWaveIcon className="inline-flex h-8 w-8" />
            </>
          }
          description={
            'Here’s What happening on your store today. Lets get going!!!'
          }
          media={
            <div className="absolute -bottom-6 end-4 hidden w-[250px] @2xl:block lg:w-[270px] 2xl:-bottom-7 2xl:w-[300px]">
              <div className="relative">
                <Image
                  src={welcomeImg}
                  alt="Welcome shop image form freepik"
                  className="dark:brightness-95 dark:drop-shadow-md"
                />
              </div>
            </div>
          }
          contentClassName="@2xl:max-w-[calc(100%-340px)]"
          className="border border-muted bg-gray-0 pb-8 @4xl:col-span-2 @7xl:col-span-8 dark:bg-gray-100/30 lg:pb-9"
        >
          
        </WelcomeBanner>

{hasPermission([PermissionResource.ANALYTICS], PermissionAction.READ) ?
<>
        <StatCards
        className="@2xl:grid-cols-3 @3xl:gap-6 @4xl:col-span-2 @7xl:col-span-8"
        />
        <RevenueExpenseChart className="relative @4xl:col-span-2 @7xl:col-span-12" />
        </>
        
        : null
      }

       {hasPermission([PermissionResource.SALES], PermissionAction.READ) ?
      
      <>
      <ProfitWidget className="relative @4xl:col-span-2 @7xl:col-span-12" />
      <TotalProfitLoss className="relative @4xl:col-span-2 @7xl:col-span-12" />
      <BestSellers className="@7xl:col-span-6 @[90rem]:col-span-4" />
      <TopSellingProducts className="@7xl:col-span-6 @[90rem]:col-span-5 @[112rem]:col-span-4" />
      </>
        : null
      }

        {hasPermission([PermissionResource.ORDERS], PermissionAction.READ) ?
        <RecentOrder className="relative @4xl:col-span-2 @7xl:col-span-12" />
        : null}
      </div>
    </div>
  );
}
