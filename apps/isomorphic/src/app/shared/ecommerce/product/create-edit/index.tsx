'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Element } from 'react-scroll';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { Text } from 'rizzui';
import cn from '@core/utils/class-names';
import FormNav, {
  formParts,
} from '@/app/shared/ecommerce/product/create-edit/form-nav';
import ProductSummary from '@/app/shared/ecommerce/product/create-edit/product-summary';
import ProductMedia from '@/app/shared/ecommerce/product/create-edit/product-media';
import PricingInventory from '@/app/shared/ecommerce/product/create-edit/pricing-inventory';
import ProductIdentifiers from '@/app/shared/ecommerce/product/create-edit/product-identifiers';
import ShippingInfo from '@/app/shared/ecommerce/product/create-edit/shipping-info';
import ProductSeo from '@/app/shared/ecommerce/product/create-edit/product-seo';
import ProductVariants from '@/app/shared/ecommerce/product/create-edit/product-variants';
import ProductTaxonomies from '@/app/shared/ecommerce/product/create-edit/product-tags';
import FormFooter from '@core/components/form-footer';
import { productSchema, CreateProductInput } from '@/validators/product-schema';
import { useLayout } from '@/layouts/use-layout';
import { LAYOUT_OPTIONS } from '@/config/enums';
import { Product } from '@/hooks/queries/useProducts';
import CustomFields from '@/app/shared/ecommerce/product/create-edit/custom-fields';

const MAP_STEP_TO_COMPONENT = {
  [formParts.summary]: ProductSummary,
  [formParts.media]: ProductMedia,
  [formParts.pricingInventory]: PricingInventory,
  [formParts.productIdentifiers]: ProductIdentifiers,
  [formParts.shipping]: ShippingInfo,
  [formParts.variantOptions]: ProductVariants,
  [formParts.tagsAndCategory]: ProductTaxonomies,
  [formParts.seo]: ProductSeo,
  [formParts.customFields]: CustomFields,
};

interface IndexProps {
  mode?: 'create' | 'edit';
  className?: string;
  product?: Product;
  onSubmit: (data: CreateProductInput) => void;
  isLoading?: boolean;
}

function defaultValues(product?: Product): Partial<CreateProductInput> {
  if (!product) {
    return {
      sku: 0,
      name: '',
      description: '',
      price: 0,
      category: '',
      tags: [],
      description_images: [],
      specifications: [],
      dimension: [],
      shipping: {
        addedCost: 0,
        increaseCostBy: 0,
        addedDays: 0,
      },

      attributes: [],
      pricingTiers: [],
      stock: 0,
      lowStockThreshold: 5,
      status: 'inactive',
      slug: '',
    };
  }

  return {
    sku: product.sku,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category?._id || (product.category as any),
    tags: product.tags || [],
    description_images: product.description_images || [],
    specifications: product.specifications || [],
    dimension: product.dimension || [],
    shipping: product.shipping || {
      addedCost: 0,
      increaseCostBy: 0,
      addedDays: 0,
    },
    attributes: product.attributes || [],
    pricingTiers: product.pricingTiers || [],
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    status: product.status,
    slug: product.slug,
  };
}

export default function CreateEditProduct({
  mode = 'create',
  product,
  className,
  onSubmit,
  isLoading = false,
}: IndexProps) {
  const { layout } = useLayout();
  const methods = useForm<CreateProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues(product),
  });

  useEffect(()=> {
    if (product) {
      methods.reset(defaultValues(product));
    }
  },[product, methods]);

  const handleSubmit: SubmitHandler<CreateProductInput> = (data) => {
    onSubmit(data);
  };

  return (
    <div className="@container">
      <FormNav
        className={cn(
          layout === LAYOUT_OPTIONS.BERYLLIUM && 'z-[999] 2xl:top-[72px]'
        )}
      />
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleSubmit)}
          className={cn(
            'relative z-[19] [&_label.block>span]:font-medium',
            className
          )}
        >
          <div className="mb-10 grid gap-7 divide-y divide-dashed divide-gray-200 @2xl:gap-9 @3xl:gap-11">
            {Object.entries(MAP_STEP_TO_COMPONENT).map(([key, Component]) => {
              const componentKey = formParts[key as keyof typeof formParts];

              // Pass additional props to ProductSummary
              if (componentKey === formParts.summary) {
                return (
                  <Element key={key} name={componentKey}>
                    <Component
                      className="pt-7 @2xl:pt-9 @3xl:pt-11"
                      mode={mode}
                      existingSlug={product?.slug}
                    />
                  </Element>
                );
              }

              return (
                <Element key={key} name={componentKey}>
                  <Component className="pt-7 @2xl:pt-9 @3xl:pt-11" />
                </Element>
              );
            })}
          </div>

          <FormFooter
            isLoading={isLoading}
            submitBtnText={
              mode === 'edit' ? 'Update Product' : 'Create Product'
            }
          />
        </form>
      </FormProvider>
    </div>
  );
}
