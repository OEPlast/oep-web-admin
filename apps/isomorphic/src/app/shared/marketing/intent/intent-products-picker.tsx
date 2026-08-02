'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Button, Drawer, Input, Text, Title, Loader, Checkbox, Alert, ActionIcon, cn } from 'rizzui';
import {
  PiMagnifyingGlassBold,
  PiCheckBold,
  PiPlusBold,
  PiTrashBold,
  PiDotsSixVerticalBold,
} from 'react-icons/pi';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getCdnUrl } from '@core/utils/cdn-url';
import { useProducts, useProductSearch } from '@/hooks/queries/useProducts';
import { useDebounce } from '@/hooks/use-debounce';
import {
  IntentProduct,
  MIN_PUBLISHED_PRODUCTS,
  intentProductCover,
} from '@/data/intents-data';

interface IntentProductsPickerProps {
  /** Selected products in display order. */
  value: IntentProduct[];
  onChange: (products: IntentProduct[]) => void;
  error?: string;
}

/** Normalise whatever the products API returns into the shape we store. */
function toIntentProduct(p: any): IntentProduct {
  return {
    _id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    stock: p.stock,
    status: p.status,
    description_images: p.description_images,
    images: p.images,
  };
}

export default function IntentProductsPicker({
  value,
  onChange,
  error,
}: IntentProductsPickerProps) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: productsData, isLoading: isLoadingProducts } = useProducts({
    page: 1,
    limit: 50,
  });

  const { data: searchResults, isLoading: isSearching } = useProductSearch(
    debouncedSearch,
    isDrawerOpen && debouncedSearch.trim().length >= 2
  );

  const displayedProducts =
    searchQuery.trim().length >= 2 ? searchResults || [] : productsData?.data || [];

  const isLoading = isLoadingProducts || isSearching;
  const selectedIds = new Set(value.map((p) => p._id));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = value.findIndex((p) => p._id === active.id);
      const newIndex = value.findIndex((p) => p._id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      onChange(arrayMove(value, oldIndex, newIndex));
    },
    [value, onChange]
  );

  const toggleProduct = (raw: any) => {
    const product = toIntentProduct(raw);
    if (selectedIds.has(product._id)) {
      onChange(value.filter((p) => p._id !== product._id));
    } else {
      // Append — new picks land at the end, then get dragged into place.
      onChange([...value, product]);
    }
  };

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Title as="h4">Products</Title>
          <Text className="text-gray-500">
            Hand-pick the products for this page. Drag to set the order they appear in.
          </Text>
        </div>
        <Button type="button" variant="outline" onClick={() => setDrawerOpen(true)}>
          <PiPlusBold className="me-1.5 h-4 w-4" />
          Add products
        </Button>
      </div>

      {value.length > 0 && value.length < MIN_PUBLISHED_PRODUCTS && (
        <Alert color="warning" variant="flat">
          <Text>
            {value.length} product{value.length === 1 ? '' : 's'} selected — a page needs at
            least {MIN_PUBLISHED_PRODUCTS} to be published. You can still save it as a draft.
          </Text>
        </Alert>
      )}

      {value.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-muted py-10">
          <Text className="text-gray-500">No products selected yet.</Text>
          <Button type="button" variant="outline" onClick={() => setDrawerOpen(true)}>
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Pick products
          </Button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={value.map((p) => p._id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="flex flex-col gap-2">
              {value.map((product, index) => (
                <SortableProductRow
                  key={product._id}
                  product={product}
                  index={index}
                  onRemove={() => onChange(value.filter((p) => p._id !== product._id))}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {error && <Text className="text-sm text-red-500">{error}</Text>}

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSearchQuery('');
        }}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-muted p-4">
            <Text className="mb-4 text-lg font-semibold">
              Select Products ({value.length} selected)
            </Text>
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefix={<PiMagnifyingGlassBold className="size-4" />}
              clearable
              onClear={() => setSearchQuery('')}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader variant="spinner" size="lg" />
                <Text className="ml-3 text-gray-600">
                  {searchQuery ? 'Searching...' : 'Loading products...'}
                </Text>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="py-8 text-center">
                <Text className="text-gray-500">
                  {searchQuery
                    ? 'No products found matching your search'
                    : 'No products available'}
                </Text>
              </div>
            ) : (
              <div className="space-y-2">
                {displayedProducts.map((product: any) => {
                  const isSelected = selectedIds.has(product._id);
                  const cover = intentProductCover(toIntentProduct(product));
                  return (
                    <div
                      key={product._id}
                      role="button"
                      tabIndex={0}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all',
                        isSelected
                          ? 'border-primary bg-primary-lighter'
                          : 'border-muted hover:border-gray-300 hover:bg-gray-50'
                      )}
                      onClick={() => toggleProduct(product)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleProduct(product);
                        }
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => {}}
                        className="pointer-events-none"
                      />
                      <Image
                        src={getCdnUrl(cover) || '/placeholder.png'}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 flex-shrink-0 rounded-md border border-muted object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <Text className="truncate font-medium">{product.name}</Text>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {product.category?.name && <span>{product.category.name}</span>}
                          {product.stock !== undefined && (
                            <>
                              <span>•</span>
                              <span>Stock: {product.stock}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {isSelected && <PiCheckBold className="h-5 w-5 text-primary" />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-muted p-4">
            <Button className="w-full" onClick={() => setDrawerOpen(false)}>
              Done ({value.length} selected)
            </Button>
          </div>
        </div>
      </Drawer>
    </section>
  );
}

function SortableProductRow({
  product,
  index,
  onRemove,
}: {
  product: IntentProduct;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product._id,
  });

  const cover = intentProductCover(product);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-muted bg-gray-0 p-3',
        isDragging && 'z-10 shadow-lg'
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-gray-400 hover:text-gray-700 active:cursor-grabbing"
        aria-label={`Reorder ${product.name}`}
        {...attributes}
        {...listeners}
      >
        <PiDotsSixVerticalBold className="h-5 w-5" />
      </button>

      <Text className="w-6 flex-shrink-0 text-center text-sm text-gray-500">{index + 1}</Text>

      <Image
        src={getCdnUrl(cover) || '/placeholder.png'}
        alt={product.name}
        width={40}
        height={40}
        className="h-10 w-10 flex-shrink-0 rounded-md border border-muted object-cover"
      />

      <div className="min-w-0 flex-1">
        <Text className="truncate font-medium">{product.name}</Text>
        <Text className="truncate text-xs text-gray-500">/{product.slug}</Text>
      </div>

      <ActionIcon
        type="button"
        size="sm"
        variant="flat"
        color="danger"
        onClick={onRemove}
        title={`Remove ${product.name}`}
      >
        <PiTrashBold className="h-4 w-4" />
      </ActionIcon>
    </li>
  );
}
