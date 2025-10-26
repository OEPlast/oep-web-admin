'use client';

import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';

interface ProductIdentifiersProps {
  className?: string;
}

export default function ProductIdentifiers({
  className,
}: ProductIdentifiersProps) {
  return (
    <FormGroup
      title="Product Identifiers"
      description="SKU and other identifiers are managed in the Summary tab"
      className={cn(className)}
    >
      <div className="col-span-full text-center py-8 text-gray-500">
        <p>This section is reserved for future identifier fields.</p>
        <p className="text-sm mt-2">Please use the Summary tab to manage SKU.</p>
      </div>
    </FormGroup>
  );
}
