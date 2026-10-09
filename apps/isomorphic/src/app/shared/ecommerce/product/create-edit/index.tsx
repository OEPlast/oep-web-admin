'use client';

import { ReactNode, useEffect, useState } from 'react';
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
import ProductPerformance from '@/app/shared/ecommerce/product/create-edit/product-performance';
import ProductMerchandising from '@/app/shared/ecommerce/product/create-edit/product-merchandising';

const MAP_STEP_TO_COMPONENT = {
  [formParts.summary]: ProductSummary,
  [formParts.media]: ProductMedia,
  [formParts.pricingInventory]: PricingInventory,
  [formParts.productIdentifiers]: ProductIdentifiers,
  [formParts.shipping]: ShippingInfo,
  [formParts.variantOptions]: ProductVariants,
  [formParts.tagsAndCategory]: ProductTaxonomies,
  [formParts.merchandising]: ProductMerchandising,
  [formParts.seo]: ProductSeo,
  [formParts.customFields]: CustomFields,
  [formParts.performance]: ProductPerformance,
};

interface IndexProps {
  mode?: 'create' | 'edit';
  className?: string;
  product?: Product;
  onSubmit: (data: CreateProductInput) => void;
  isLoading?: boolean;
  /** Create mode: values to start from (e.g. a Vylux product's pictures and name). */
  initialValues?: Partial<CreateProductInput>;
  /** Shown above the form, inside its context (can read and set fields). */
  intro?: ReactNode;
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
      weight: 1,
      height: 10,
      width: 10,
      length: 10,
      isVolumetric: false,

      attributes: [],
      pricingTiers: [],
      addOns: [],
      sizeChart: '',
      stock: 0,
      lowStockThreshold: 5,
      status: 'inactive',
      slug: '',
      brand: '',
      gtin: '',
      mpn: '',
      condition: 'new',
    };
  }

  return {
    sku: product.sku,
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category?._id || (product.category as any),
    tags: product.tags || [],
    // Legacy products can be missing mediaType (see Product type), so default it
    // here rather than letting an undefined leak into the form state.
    description_images: (product.description_images || []).map((img) => ({
      url: img.url,
      cover_image: img.cover_image,
      mediaType: img.mediaType ?? 'image',
      ...(img.miniUrl ? { miniUrl: img.miniUrl } : {}),
    })),
    specifications: product.specifications || [],
    dimension: product.dimension || [],
    shipping: product.shipping || {
      addedCost: 0,
      increaseCostBy: 0,
      addedDays: 0,
    },
    weight: product.weight ?? 1,
    height: product.height ?? 10,
    width: product.width ?? 10,
    length: product.length ?? 10,
    isVolumetric: product.isVolumetric ?? false,
    attributes: (product.attributes || []).map((attr) => ({
      ...attr,
      children: (attr.children || []).map((child) => ({ ...child, images: child.images ?? [] })),
    })),
    pricingTiers: product.pricingTiers || [],
    addOns: (product.addOns || []).map(String),
    sizeChart: product.sizeChart ?? '',
    stock: product.stock,
    lowStockThreshold: product.lowStockThreshold,
    status: product.status,
    slug: product.slug,
    brand: product.brand ?? '',
    gtin: product.gtin ?? '',
    mpn: product.mpn ?? '',
    condition: product.condition ?? 'new',
  };
}

/**
 * Add-ons, the size chart and per-value images are optional extras: leave them out of the
 * payload while they are empty and were empty before, so saving a product that doesn't use them
 * sends exactly what it used to. Clearing a value that was set still sends the empty value.
 */
function withoutUnusedExtras(data: CreateProductInput, product?: Product): CreateProductInput {
  const next: CreateProductInput = { ...data };
  if (!next.addOns?.length && !product?.addOns?.length) delete next.addOns;
  if (!next.sizeChart && !product?.sizeChart) delete next.sizeChart;
  if (next.attributes) {
    next.attributes = next.attributes.map((attr, a) => ({
      ...attr,
      children: attr.children.map((child) => {
        const before = product?.attributes?.[a]?.children?.find((c) => c.name === child.name);
        if (child.images?.length || before?.images?.length) return child;
        const { images: _unused, ...rest } = child;
        return rest;
      }),
    }));
  }
  return next;
}

export default function CreateEditProduct({
  mode = 'create',
  product,
  className,
  onSubmit,
  isLoading = false,
  initialValues,
  intro,
}: IndexProps) {
  const { layout } = useLayout();
  const methods = useForm<CreateProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...defaultValues(product), ...initialValues },
  });

  useEffect(() => {
    if (product) {
      methods.reset(defaultValues(product));
    }
  }, [product, methods]);

  const handleSubmit: SubmitHandler<CreateProductInput> = (data) => {
    onSubmit(withoutUnusedExtras(data, product));
  };

  return (
    <div className="@container">
      <FormNav
        className={cn(
          layout === LAYOUT_OPTIONS.BERYLLIUM && 'z-[999] 2xl:top-[72px]'
        )}
      />
      <FormProvider {...methods}>
        {intro}
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

              // Performance links out to the product's analytics, so it needs
              // the id. On create there is none, and the section says so. The add-ons
              // picker needs it too, to leave the product itself out.
              if (componentKey === formParts.performance || componentKey === formParts.merchandising) {
                return (
                  <Element key={key} name={componentKey}>
                    <Component
                      className="pt-7 @2xl:pt-9 @3xl:pt-11"
                      productId={product?._id}
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
