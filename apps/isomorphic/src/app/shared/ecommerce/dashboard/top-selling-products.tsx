'use client';

import WidgetCard from '@core/components/cards/widget-card';
import DribbleIcon from '@core/components/icons/dribble';
import FigmaIcon from '@core/components/icons/figma';
import PlayStoreIcon from '@core/components/icons/play-store';
import RippleIcon from '@core/components/icons/ripple';
import Snapchat from '@core/components/icons/snapchat';
import TelegramIcon from '@core/components/icons/telegram';
import { DatePicker } from '@core/ui/datepicker';
import cn from '@core/utils/class-names';
import { ReactElement, useState } from 'react';
import { Box, Flex, Text } from 'rizzui';

type Product = {
  icon: ReactElement;
  title: string;
  date: string;
  price: number;
};
const products: Product[] = [
  {
    icon: <DribbleIcon className="h-auto w-7" />,
    title: 'Dribbble App',
    date: '18 Jul . 12:30PM',
    price: 72.59,
  },
  {
    icon: <Snapchat className="h-auto w-7" />,
    title: 'Snapchat',
    date: '18 Jul . 12:30PM',
    price: 72.59,
  },
  {
    icon: <FigmaIcon className="h-auto w-7 scale-[.8]" />,
    title: 'Figma App',
    date: '18 Jul . 12:30PM',
    price: 72.59,
  },
  {
    icon: <PlayStoreIcon className="h-auto w-7 scale-90" />,
    title: 'Google Play Store',
    date: '18 Jul . 12:30PM',
    price: 72.59,
  },
  {
    icon: <RippleIcon className="h-auto w-7 scale-90" />,
    title: 'Ripple',
    date: '18 Jul . 12:30PM',
    price: 72.59,
  },
  {
    icon: <TelegramIcon className="h-auto w-7 scale-90" />,
    title: 'Telegram',
    date: '18 Jul . 12:30PM',
    price: 72.59,
  },
];
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
        <Box className="w-full space-y-3.5 divide-y divide-gray-200/70">
          {products.map((item, index) => (
            <SingleProduct {...item} key={index} />
          ))}
        </Box>
      </div>
    </WidgetCard>
  );
}

function SingleProduct({
  icon,
  title,
  date,
  price,
}: Product & { className?: string }) {
  return (
    <Flex align="end" className="pt-3.5 first:pt-0">
      <Flex justify="start" align="center" gap="3">
        <Box className="rounded-md border border-gray-200/50 bg-gray-100 p-2">
          {icon}
        </Box>
        <Box className="space-y-1">
          <Text className="font-semibold text-gray-900">{title}</Text>
          <Text className="text-xs text-gray-500">200 units sold</Text>
        </Box>
      </Flex>
      <Text as="span" className="font-semibold text-gray-500">
        &#8358;{price}
      </Text>
    </Flex>
  );
}
