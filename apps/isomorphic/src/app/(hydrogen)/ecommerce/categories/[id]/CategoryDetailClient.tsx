'use client';

import { useCategory } from '@/hooks/queries/useCategories';
import { Text, Badge, Button, Loader } from 'rizzui';
import Image from 'next/image';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { getCdnUrl } from '@core/utils/cdn-url';
import PageHeader from '@/app/shared/page-header';
import { PiPencilSimpleBold } from 'react-icons/pi';

function CategoryDetail({ categoryId }: { categoryId: string }) {
  const { data: category, isLoading, error } = useCategory(categoryId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader variant="spinner" size="xl" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex items-center justify-center p-8">
        <Text className="text-red-600">
          Error loading category: {error?.message || 'Category not found'}
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Info Card */}
      <div className="rounded-lg border border-muted bg-white p-6">
                  {/* Banner */}
          {category.banner && (
            <div>
                                          <Text className="mb-3 font-semibold">Banner</Text>

              <div className="relative aspect-[3/1] w-full h-auto overflow-hidden rounded-lg border border-muted bg-gray-100">
                <img
                  alt={`${category.name} banner`}
                  src={getCdnUrl(category.banner)}

                  className="object-cover h-full object-center"
                />
              </div>
            </div>
          )}
          <br />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Image */}
          <div>
                          <Text className="mb-3 font-semibold">Main Image</Text>

            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-muted bg-gray-100">
              <img
                alt={category.name}
                src={getCdnUrl(category.image)}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

        </div>

        <div className="mt-6 space-y-4">
          <div>
            <Text className="text-sm text-gray-900">Name</Text>
            <Text className="text-2xl font-semibold">{category.name}</Text>
          </div>

          <div>
            <Text className="text-sm text-gray-600">Slug</Text>
            <Text className="font-mono text-sm">{category.slug}</Text>
          </div>

          {category.description && (
            <div>
              <Text className="text-sm text-gray-600">Description</Text>
              <Text className="text-gray-700">{category.description}</Text>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Text className="text-sm text-gray-600">Created</Text>
              <Text>{new Date(category.createdAt).toLocaleDateString()}</Text>
            </div>
            <div>
              <Text className="text-sm text-gray-600">Updated</Text>
              <Text>{new Date(category.updatedAt).toLocaleDateString()}</Text>
            </div>
          </div>

          {category.parent_categories && category.parent_categories.length > 0 && (
            <div>
              <Text className="mb-2 text-sm text-gray-600">Parent Categories</Text>
              <div className="flex flex-wrap gap-2">
                {category.parent_categories.map((parent) => (
                  <Link
                    key={parent._id}
                    href={routes.eCommerce.categoryDetails(parent._id)}
                    className='group'
                  >
                  <Badge key={parent._id} variant="flat" color="secondary" className='group-hover:underline'>
                    {parent.name}
                  </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subcategories Section */}
      <div className="rounded-lg border border-muted bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <Text className="text-lg font-semibold">
            Subcategories ({category.sub_categories?.length || 0})
          </Text>
        </div>

        {category.sub_categories && category.sub_categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.sub_categories.map((subcat) => (
              <Link
                key={subcat._id}
                href={routes.eCommerce.categoryDetails(subcat._id)}
                className="group rounded-lg border border-muted p-4 transition-all hover:border-primary hover:shadow-md"
              >
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100 mb-3">
                  <Image
                    alt={subcat.name}
                    src={getCdnUrl(subcat.image)}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <Text className="font-medium group-hover:text-primary mb-1">
                  {subcat.name}
                </Text>
                <Text className="text-xs font-mono text-gray-600">{subcat.slug}</Text>
                {subcat.description && (
                  <Text className="mt-2 text-xs text-gray-500 line-clamp-2">
                    {subcat.description}
                  </Text>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Text className="text-gray-500">No subcategories found</Text>
            <Text className="text-sm text-gray-400 mt-2">
              Categories with this category as parent will appear here
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}


export default function CategoryDetailClient({title, breadcrumb, categoryId}: {title: string; breadcrumb: {href?: string; name: string}[]; categoryId: string}) {
    return (

        <>
              <PageHeader title={title} breadcrumb={breadcrumb}>
        <div className="mt-4 flex items-center gap-3 @lg:mt-0">
          <Link
            href={routes.eCommerce.editCategory(categoryId)}
            className="w-full @lg:w-auto"
          >
            <Button as="span" className="w-full @lg:w-auto">
              <PiPencilSimpleBold className="me-1.5 h-[17px] w-[17px]" />
              Edit Category
            </Button>
          </Link>
        </div>
      </PageHeader>
<br />

<CategoryDetail categoryId={categoryId} />
        </>
    )
}