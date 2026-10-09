'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Text } from 'rizzui';
import { PiImagesDuotone, PiPlayCircleFill } from 'react-icons/pi';
import { routes } from '@/config/routes';
import { handleApiError } from '@/libs/axios';
import { useVyluxProducts, VyluxProduct, vyluxCover, vyluxPriceLabel } from '@/hooks/queries/useVylux';
import VyluxProductModal from './product-modal';

/**
 * Accepted scraper products as cards. Clicking one opens its pictures, caption and Vylux prices;
 * "Add product" there opens the normal product form with the pictures and name filled in.
 */
export default function VyluxImport() {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useVyluxProducts();
  const [open, setOpen] = useState<VyluxProduct | null>(null);

  const products = useMemo(() => (data?.pages.flatMap((p) => p.items) ?? []).filter((p) => !p.importedProductId), [data]);

  if (isError) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not load Vylux products</Text>
        <Text className="text-sm">{handleApiError(error)}</Text>
      </Alert>
    );
  }

  return (
    <div className="@container space-y-5">
      <div className="rounded-md border border-muted p-4">
        <Text className="font-semibold">
          {isLoading ? 'Loading…' : `${products.length} product${products.length === 1 ? '' : 's'} from Vylux`}
        </Text>
        <Text className="text-sm text-gray-500">
          Open a product to see its pictures, caption and Vylux price, then <b>Add product</b> to create it in{' '}
          <Link href={routes.eCommerce.products} className="text-primary underline">
            Products
          </Link>{' '}
          with the pictures and name already filled in.
        </Text>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 @2xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="aspect-[4/5] animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-md border border-dashed border-muted p-10 text-center text-gray-500">
          Nothing to add. Accept products in the Vylux scraper&rsquo;s Review page and they will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 @2xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.vyluxId} product={product} onOpen={() => setOpen(product)} />
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} isLoading={isFetchingNextPage}>
            Load more
          </Button>
        </div>
      )}

      <VyluxProductModal product={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function ProductCard({ product, onOpen }: { product: VyluxProduct; onOpen: () => void }) {
  const cover = vyluxCover(product);
  const videos = product.media.filter((m) => m.type === 'video').length;
  const price = product.prices[0];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-lg border border-muted bg-white text-left transition hover:border-gray-900 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {/* Plain <img>: the scraper's media isn't served through next/image */}
        {cover && (
          <img src={cover} alt={product.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        )}
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {videos > 0 ? <PiPlayCircleFill className="h-3.5 w-3.5" /> : <PiImagesDuotone className="h-3.5 w-3.5" />}
          {product.media.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <Text className="line-clamp-2 text-sm font-semibold text-gray-900">{product.title}</Text>
        <Text className="line-clamp-1 text-xs text-gray-500">{price ? vyluxPriceLabel(price) : 'No price on the post'}</Text>
      </div>
    </button>
  );
}
