'use client';
import { Title } from 'rizzui/typography';
import cn from '@core/utils/class-names';
import Breadcrumb from '@core/ui/breadcrumb';
import Link from 'next/link';
import { Button } from 'rizzui';
import { PiPlusBold } from 'react-icons/pi';

export type PageHeaderTypes = {
  title: string;
  breadcrumb: { name: string; href?: string }[];
  className?: string;
  href: string;
};

export default function PageHeaderWithNavigation({
  title,
  breadcrumb,
  href,
  className,
}: React.PropsWithChildren<PageHeaderTypes>) {
  return (
    <header className={cn('mb-6 @container xs:-mt-2 lg:mb-7', className)}>
      <div className="flex flex-col @lg:flex-row @lg:items-center @lg:justify-between">
        <div>
          <Title
            as="h2"
            className="mb-2 text-[22px] lg:text-2xl 4xl:text-[26px]"
          >
            {title}
          </Title>

          <Breadcrumb
            separator=""
            separatorVariant="circle"
            className="flex-wrap"
          >
            {breadcrumb.map((item) => (
              <Breadcrumb.Item
                key={item.name}
                {...(item?.href && { href: item?.href })}
              >
                {item.name}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </div>
        <Link href={href}>
          <Button className="w-full @lg:w-auto">
            <PiPlusBold className="me-1.5 h-[17px] w-[17px]" />
            Create Campaign
          </Button>
        </Link>
      </div>
    </header>
  );
}
