'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Alert, Button, Checkbox, Input, Select, Text } from 'rizzui';
import { PiArrowSquareOutDuotone, PiPlayCircleDuotone } from 'react-icons/pi';
import { routes } from '@/config/routes';
import { handleApiError } from '@/libs/axios';
import { formatToNaira } from '@/libs/currencyFormatter';
import { useParentCategoryOptions } from '@/hooks/queries/useParentCategoryOptions';
import { useImportVylux, useVyluxProducts, VyluxProduct } from '@/hooks/queries/useVylux';

type RowDraft = { selected: boolean; categoryId?: string; price?: string; name?: string };

const priceLabel = (p: VyluxProduct['prices'][number]) => {
  if (p.min == null) return p.raw;
  const range = p.max != null && p.max !== p.min ? `${formatToNaira(p.min)} – ${formatToNaira(p.max)}` : formatToNaira(p.min);
  return p.label ? `${p.label}: ${range}` : range;
};

export default function VyluxImport() {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useVyluxProducts();
  const { data: categoryOptions, isLoading: categoriesLoading } = useParentCategoryOptions();
  const importMutation = useImportVylux();
  const [drafts, setDrafts] = useState<Record<number, RowDraft>>({});
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [bulkCategory, setBulkCategory] = useState<string>();

  const all = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);
  const rows = all.filter((p) => !p.importedProductId);
  const alreadyImported = all.length - rows.length;

  const draft = (id: number): RowDraft => drafts[id] ?? { selected: false };
  const update = (id: number, patch: Partial<RowDraft>) =>
    setDrafts((prev) => ({ ...prev, [id]: { ...draft(id), ...patch } }));

  const selected = rows.filter((r) => draft(r.vyluxId).selected);
  const isReady = (r: VyluxProduct) => {
    const d = draft(r.vyluxId);
    return !!d.categoryId && Number(d.price) > 0;
  };
  const canImport = selected.length > 0 && selected.every(isReady) && !importMutation.isPending;
  const allSelected = rows.length > 0 && selected.length === rows.length;

  const toggleAll = () => {
    const next = !allSelected;
    setDrafts((prev) => {
      const copy = { ...prev };
      rows.forEach((r) => (copy[r.vyluxId] = { ...(copy[r.vyluxId] ?? { selected: false }), selected: next }));
      return copy;
    });
  };

  const applyBulkCategory = () => {
    if (!bulkCategory) return;
    setDrafts((prev) => {
      const copy = { ...prev };
      selected.forEach((r) => (copy[r.vyluxId] = { ...draft(r.vyluxId), categoryId: bulkCategory }));
      return copy;
    });
  };

  const runImport = async () => {
    const items = selected.map((r) => {
      const d = draft(r.vyluxId);
      const name = d.name?.trim();
      return {
        vyluxId: r.vyluxId,
        categoryId: d.categoryId!,
        price: Number(d.price),
        ...(name && name !== r.title ? { name } : {}),
      };
    });
    const results = await importMutation.mutateAsync(items).catch(() => null);
    if (!results) return;
    const nextErrors: Record<number, string> = {};
    results.forEach((r) => {
      if (!r.ok) nextErrors[r.vyluxId] = r.error ?? 'Import failed';
    });
    setErrors(nextErrors);
    setDrafts((prev) => {
      const copy = { ...prev };
      results.filter((r) => r.ok).forEach((r) => delete copy[r.vyluxId]);
      return copy;
    });
  };

  if (isError) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not load Vylux products</Text>
        <Text className="text-sm">{handleApiError(error)}</Text>
      </Alert>
    );
  }

  return (
    <div className="@container space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-md border border-muted p-4">
        <div>
          <Text className="font-semibold">
            {isLoading ? 'Loading…' : `${rows.length} product${rows.length === 1 ? '' : 's'} ready to import`}
          </Text>
          <Text className="text-sm text-gray-500">
            Products are created as inactive drafts with stock 100 and a generated SKU. Review and activate them in{' '}
            <Link href={routes.eCommerce.products} className="text-primary underline">
              Products
            </Link>
            .{alreadyImported > 0 && ` ${alreadyImported} already imported.`}
          </Text>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Select
            className="w-56"
            label="Category for selected"
            options={categoryOptions}
            value={categoryOptions.find((o) => o.value === bulkCategory) ?? null}
            onChange={(o: { value: string }) => setBulkCategory(o.value)}
            getOptionValue={(o) => o.value}
            getOptionDisplayValue={(o) => o.label}
            searchable
            disabled={categoriesLoading}
            placeholder="Choose…"
          />
          <Button variant="outline" onClick={applyBulkCategory} disabled={!bulkCategory || selected.length === 0}>
            Apply
          </Button>
          <Button onClick={runImport} disabled={!canImport} isLoading={importMutation.isPending}>
            Import {selected.length || ''} selected
          </Button>
        </div>
      </div>
      {selected.length > 0 && !selected.every(isReady) && (
        <Text className="text-sm text-orange-600">Every selected product needs a category and a price above 0.</Text>
      )}

      <div className="overflow-x-auto rounded-md border border-muted">
        <table className="w-full min-w-[960px] text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="w-12 p-3">
                <Checkbox aria-label="Select all" checked={allSelected} onChange={toggleAll} />
              </th>
              <th className="p-3">Product</th>
              <th className="p-3">Vylux price (reference)</th>
              <th className="w-56 p-3">Category</th>
              <th className="w-40 p-3">Your price (₦)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const d = draft(row.vyluxId);
              const cover = row.media.find((m) => m.type === 'image')?.url ?? row.media[0]?.posterUrl ?? undefined;
              const videos = row.media.filter((m) => m.type === 'video').length;
              return (
                <tr key={row.vyluxId} className="border-t border-muted align-top">
                  <td className="p-3">
                    <Checkbox
                      aria-label={`Select ${row.title}`}
                      checked={d.selected}
                      onChange={() => update(row.vyluxId, { selected: !d.selected })}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-100">
                        {/* Plain <img>: the scraper's CDN host isn't in next.config remotePatterns */}
                        {cover && <img src={cover} alt={row.title} className="h-full w-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <Input
                          size="sm"
                          value={d.name ?? row.title}
                          onChange={(e) => update(row.vyluxId, { name: e.target.value })}
                          aria-label="Product name"
                        />
                        <Text className="line-clamp-2 text-xs text-gray-500">{row.description}</Text>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                          <span>
                            {row.media.length} media{videos ? ` (${videos} video)` : ''}
                            {videos > 0 && <PiPlayCircleDuotone className="ms-1 inline" />}
                          </span>
                          {row.postedAt && <span>Posted {new Date(row.postedAt).toLocaleDateString()}</span>}
                          {row.telegramUrl && (
                            <a href={row.telegramUrl} target="_blank" rel="noreferrer" className="text-primary">
                              Telegram <PiArrowSquareOutDuotone className="inline" />
                            </a>
                          )}
                        </div>
                        {errors[row.vyluxId] && <Text className="text-xs text-red-600">{errors[row.vyluxId]}</Text>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gray-600">
                    {row.prices.length ? row.prices.map((p, i) => <div key={i}>{priceLabel(p)}</div>) : '—'}
                  </td>
                  <td className="p-3">
                    <Select
                      size="sm"
                      options={categoryOptions}
                      value={categoryOptions.find((o) => o.value === d.categoryId) ?? null}
                      onChange={(o: { value: string }) => update(row.vyluxId, { categoryId: o.value })}
                      getOptionValue={(o) => o.value}
                      getOptionDisplayValue={(o) => o.label}
                      searchable
                      disabled={categoriesLoading}
                      placeholder="Category…"
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      size="sm"
                      type="number"
                      min={0}
                      value={d.price ?? ''}
                      onChange={(e) => update(row.vyluxId, { price: e.target.value })}
                      placeholder="0"
                      aria-label="Your price"
                    />
                  </td>
                </tr>
              );
            })}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Nothing to import. Accept products in the Vylux scraper dashboard and they will appear here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} isLoading={isFetchingNextPage}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
