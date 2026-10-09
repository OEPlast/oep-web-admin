'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActionIcon, Button, Modal, Text, Title } from 'rizzui';
import { PiArrowSquareOutDuotone, PiPlayCircleFill, PiPlusBold, PiXBold } from 'react-icons/pi';
import cn from '@core/utils/class-names';
import { routes } from '@/config/routes';
import { VyluxProduct, vyluxPriceLabel } from '@/hooks/queries/useVylux';

/** Big picture/video with a thumbnail strip, for one scraper product. */
export function VyluxMediaViewer({ product, compact }: { product: VyluxProduct; compact?: boolean }) {
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [product.vyluxId]);
  const current = product.media[index];
  return (
    <div className="space-y-2">
      <div className={cn('relative w-full overflow-hidden rounded-lg bg-gray-100', compact ? 'aspect-[4/3]' : 'aspect-square')}>
        {current?.type === 'video' ? (
          <video
            key={current.url}
            src={current.url}
            poster={current.posterUrl ?? undefined}
            controls
            playsInline
            className="h-full w-full object-contain bg-black"
          />
        ) : current ? (
          <img src={current.url} alt={product.title} className="h-full w-full object-contain" />
        ) : null}
      </div>
      {product.media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {product.media.map((m, i) => (
            <button
              key={m.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${m.type} ${i + 1}`}
              className={cn(
                'relative h-14 w-14 flex-shrink-0 overflow-hidden rounded border-2',
                i === index ? 'border-gray-900' : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <img src={m.type === 'video' ? (m.posterUrl ?? '') : m.url} alt="" className="h-full w-full bg-gray-200 object-cover" />
              {m.type === 'video' && <PiPlayCircleFill className="absolute inset-0 m-auto h-6 w-6 text-white drop-shadow" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Title, Vylux price lines and the caption, as posted on Telegram. */
export function VyluxDetails({ product, tone = 'light' }: { product: VyluxProduct; tone?: 'light' | 'dark' }) {
  const muted = tone === 'dark' ? 'text-gray-400' : 'text-gray-500';
  return (
    <div className="space-y-4">
      <div>
        <Text className={cn('text-xs uppercase tracking-wide', muted)}>Name</Text>
        <Text className="text-base font-semibold">{product.title}</Text>
      </div>
      <div>
        <Text className={cn('text-xs uppercase tracking-wide', muted)}>Vylux price (reference)</Text>
        {product.prices.length ? (
          product.prices.map((p, i) => (
            <Text key={i} className="text-sm font-medium">
              {vyluxPriceLabel(p)}
            </Text>
          ))
        ) : (
          <Text className="text-sm">No price on the post</Text>
        )}
      </div>
      <div>
        <Text className={cn('text-xs uppercase tracking-wide', muted)}>Caption</Text>
        <Text className="whitespace-pre-line text-sm">{product.description || '—'}</Text>
      </div>
      <Text className={cn('flex flex-wrap items-center gap-3 text-xs', muted)}>
        <span>
          {product.media.length} {product.media.length === 1 ? 'picture' : 'pictures and videos'}
        </span>
        {product.postedAt && <span>Posted {new Date(product.postedAt).toLocaleDateString()}</span>}
        {product.telegramUrl && (
          <a href={product.telegramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
            View on Telegram <PiArrowSquareOutDuotone />
          </a>
        )}
      </Text>
    </div>
  );
}

export default function VyluxProductModal({ product, onClose }: { product: VyluxProduct | null; onClose: () => void }) {
  const router = useRouter();
  return (
    <Modal isOpen={!!product} onClose={onClose} size="xl" customSize="960px">
      {product && (
        <div className="relative grid gap-6 p-5 md:grid-cols-[1.1fr_1fr] md:p-7">
          <ActionIcon variant="text" onClick={onClose} aria-label="Close" className="absolute end-3 top-3">
            <PiXBold className="h-5 w-5" />
          </ActionIcon>
          <VyluxMediaViewer product={product} />
          <div className="flex flex-col gap-6">
            <Title as="h3" className="pe-8 text-lg">
              From Vylux
            </Title>
            <div className="flex-1">
              <VyluxDetails product={product} />
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push(`${routes.eCommerce.createProduct}?vylux=${product.vyluxId}`)}
            >
              <PiPlusBold className="me-2 h-4 w-4" />
              Add product
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
