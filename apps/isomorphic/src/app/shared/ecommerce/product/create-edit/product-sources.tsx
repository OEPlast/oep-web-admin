'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActionIcon, Button, Input } from 'rizzui';
import { PiArrowSquareOutBold, PiPlusBold } from 'react-icons/pi';
import cn from '@core/utils/class-names';
import FormGroup from '@/app/shared/form-group';
import TrashIcon from '@core/components/icons/trash';
import { apiClient } from '@/libs/axios';
import api from '@/libs/endpoints';

type SourceLink = { label: string; url: string };
const MAX_LINKS = 20;

/**
 * Where the product came from: its scraper page, the Telegram messages it was made from, or any
 * other link, so it can be checked and corrected. Optional, admin-only (never on the storefront),
 * and saved on its own with "Save sources", separately from the product form.
 */
export default function ProductSources({ className, productId }: { className?: string; productId?: string }) {
  const queryClient = useQueryClient();
  const { data: saved, isLoading } = useQuery<SourceLink[]>({
    queryKey: ['product-sources', productId],
    queryFn: async () => (await apiClient.get<SourceLink[]>(api.products.sources(productId!))).data ?? [],
    enabled: !!productId,
  });
  const [links, setLinks] = useState<SourceLink[]>([]);
  useEffect(() => setLinks(saved ?? []), [saved]);

  const save = useMutation({
    mutationFn: async (next: SourceLink[]) => (await apiClient.put<SourceLink[]>(api.products.sources(productId!), { links: next })).data ?? [],
    onSuccess: (data) => {
      queryClient.setQueryData(['product-sources', productId], data);
      toast.success('Sources saved');
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) =>
      toast.error(error.response?.data?.message ?? error.message ?? 'Could not save the sources'),
  });

  const update = (index: number, field: keyof SourceLink, value: string) =>
    setLinks((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  const changed = JSON.stringify(links) !== JSON.stringify(saved ?? []);

  return (
    <FormGroup
      title="Source"
      description="Optional. Where this product came from (its Vylux page, the Telegram messages, a supplier link…), so you can check the original and correct the product. Only admins see these."
      className={cn(className)}
    >
      {!productId ? (
        <p className="col-span-full text-sm text-gray-500">
          Save the product first, then add its sources here. Products added from Vylux get their links automatically.
        </p>
      ) : (
        <>
          {isLoading && <p className="col-span-full text-sm text-gray-500">Loading sources…</p>}
          {!isLoading && links.length === 0 && <p className="col-span-full text-sm text-gray-500">No sources recorded.</p>}

          {links.map((link, index) => (
            <div key={index} className="col-span-full grid grid-cols-1 items-start gap-3 md:grid-cols-[220px_1fr_auto_auto]">
              <Input label="Label" placeholder="e.g. Telegram message 144594" value={link.label} onChange={(e) => update(index, 'label', e.target.value)} />
              <Input label="Link" placeholder="https://t.me/…/144594" value={link.url} onChange={(e) => update(index, 'url', e.target.value)} />
              <ActionIcon
                as="span"
                variant="flat"
                className="mt-7 shrink-0"
                aria-label={`Open ${link.label || 'link'}`}
                onClick={() => /^https?:\/\//i.test(link.url) && window.open(link.url, '_blank', 'noopener,noreferrer')}
              >
                <PiArrowSquareOutBold className="h-4 w-4" />
              </ActionIcon>
              <ActionIcon
                variant="flat"
                color="danger"
                className="mt-7 shrink-0"
                aria-label="Remove source"
                onClick={() => setLinks((prev) => prev.filter((_, i) => i !== index))}
              >
                <TrashIcon className="h-4 w-4" />
              </ActionIcon>
            </div>
          ))}

          <div className="col-span-full flex flex-wrap gap-3">
            {links.length < MAX_LINKS && (
              <Button type="button" variant="outline" size="sm" onClick={() => setLinks((prev) => [...prev, { label: '', url: '' }])}>
                <PiPlusBold className="me-2 h-4 w-4" /> Add source
              </Button>
            )}
            <Button type="button" size="sm" disabled={!changed} isLoading={save.isPending} onClick={() => save.mutate(links)}>
              Save sources
            </Button>
          </div>
        </>
      )}
    </FormGroup>
  );
}
