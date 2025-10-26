import cn from '@core/utils/class-names';
import React from 'react';
import { Text, Title } from 'rizzui';

const VerticalFormBlockWrapper = ({
  title,
  description,
  children,
  className,
  subClassName,
}: React.PropsWithChildren<{
  title: string;
  description?: string;
  className?: string;
  subClassName?: string;
}>) => {
  return (
    <div className={cn('flex flex-col gap-4 max-w-3xl', className)}>
      <div>
        <Title as="h6" className="font-semibold">
          {title}
        </Title>
        {description && (
          <Text className="mt-1 text-sm text-gray-500">{description}</Text>
        )}
      </div>

      <div className={cn('flex flex-col gap-3 @lg:gap-4 @2xl:gap-5', subClassName)}>
        {children}
      </div>
    </div>
  );
};

export default VerticalFormBlockWrapper;
