'use client';

import WidgetCard from '@core/components/cards/widget-card';
import { DatePicker } from '@core/ui/datepicker';
import cn from '@core/utils/class-names';
import { useState } from 'react';
import { Avatar, Box, Flex, Loader, Text } from 'rizzui';
import { useCategoriesPerformance } from '@/hooks/queries/analytics/useAnalyticsCharts';
import { formatCurrency } from '@/utils/format-currency';
import { PiImageSquare } from 'react-icons/pi';

const currentDate = new Date();
const previousMonthDate = new Date(
  currentDate.getFullYear(),
  currentDate.getMonth() - 1,
  currentDate.getDate()
);

export default function TopSellingProducts({
  className,
}: {
  className?: string;
}) {
  const [rangeDate, setRangeDate] = useState<[Date | null, Date | null]>([
    previousMonthDate,
    currentDate,
  ]);

  // Fetch categories performance
  const { data: categories, isLoading, error } = useCategoriesPerformance({
    from: rangeDate[0]?.toISOString().split('T')[0] || previousMonthDate.toISOString().split('T')[0],
    to: rangeDate[1]?.toISOString().split('T')[0] || currentDate.toISOString().split('T')[0],
  });

  return (
    <WidgetCard
      title="Top Selling Categories"
      headerClassName="items-center"
      className={cn('@container dark:bg-gray-100/50', className)}
      description={
        <>
          Overview:
          <DatePicker
            selected={rangeDate?.[0]}
            onChange={(dates) => setRangeDate(dates)}
            startDate={rangeDate?.[0] as Date}
            endDate={rangeDate?.[1] as Date}
            monthsShown={1}
            placeholderText="Select Date in a Range"
            selectsRange
            inputProps={{
              variant: 'text',
              inputClassName: 'p-0 pe-1 h-auto ms-2 [&_input]:text-ellipsis',
              prefixClassName: 'hidden',
            }}
          />
        </>
      }
      descriptionClassName="mt-1 flex items-center [&_.react-datepicker-wrapper]:w-full [&_.react-datepicker-wrapper]:max-w-[228px] text-gray-500"
    >
      <div className="custom-scrollbar mt-6 overflow-y-auto pe-2 @lg:mt-8 @3xl/sa:max-h-[330px] @7xl/sa:max-h-[405px]">
        {isLoading ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Loader variant="spinner" size="lg" />
          </div>
        ) : error ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Text className="text-red-500">Error loading categories</Text>
          </div>
        ) : !categories || categories.length === 0 ? (
          <div className="flex min-h-[200px] items-center justify-center">
            <Text className="text-gray-500">No categories found for this period</Text>
          </div>
        ) : (
          <Box className="w-full space-y-3.5 divide-y divide-gray-200/70">
            {categories.map((category) => (
              <SingleCategory
                key={category.categoryId}
                id={category.categoryId}
                title={category.name}
                revenue={category.revenue}
                orders={category.orders}
                image={category.image}
              />
            ))}
          </Box>
        )}
      </div>
    </WidgetCard>
  );
}

function SingleCategory({
  id,
  title,
  revenue,
  orders,
  image,
}: {
  id: string;
  title: string;
  revenue: number;
  orders: number;
  image: string;
  className?: string;
}) {
  return (
    <Flex align="end" className="pt-3.5 first:pt-0">
      <Flex justify="start" align="center" gap="3">
        {image ? (
          <Avatar
            src={image}
            name={title}
            className="rounded-md border border-gray-200/50 bg-gray-100"
          />
        ) : (
          <Box className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200/50 bg-gray-100 p-2">
            <PiImageSquare className="h-full w-full text-gray-400" />
          </Box>
        )}
        <Box className="space-y-1">
          <Text className="font-semibold text-gray-900">{title}</Text>
          <Text className="text-xs text-gray-500">{orders} orders</Text>
        </Box>
      </Flex>
      <Text as="span" className="font-semibold text-gray-500">
        {formatCurrency(revenue)}
      </Text>
    </Flex>
  );
}
