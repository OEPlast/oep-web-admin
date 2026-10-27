'use client';

import { useState } from 'react';
import { ActionIcon, Input, Loader, Text } from 'rizzui';
import { PiMagnifyingGlassBold, PiPlusBold, PiXBold } from 'react-icons/pi';
import { getCdnUrl } from '@core/utils/cdn-url';
import { useProductSearch } from '@/hooks/queries/useProducts';
import { useDebounce } from '@/hooks/use-debounce';
import { FeatureProduct, featureProductFrom } from '@/types/content.types';

/** Picks up to `max` products for a home feature block: search by name, click to add, × to remove. */
export default function FeatureProductsPicker({
  value,
  onChange,
  max = 3,
  error,
}: {
  value: FeatureProduct[];
  onChange: (products: FeatureProduct[]) => void;
  max?: number;
  error?: string;
}) {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 400);
  const searching = debounced.trim().length >= 2;
  const { data: results = [], isFetching } = useProductSearch(debounced, searching);
  const chosen = new Set(value.map((p) => p._id));
  const full = value.length >= max;

  return (
    <div className="flex flex-col gap-2">
      <Text className="text-sm font-medium">
        Products ({value.length}/{max})
      </Text>
      {value.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {value.map((p) => (
            <li key={p._id} className="relative flex flex-col gap-1 rounded-md border border-muted p-1.5">
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getCdnUrl(p.image)} alt="" className="aspect-square w-full rounded object-cover" />
              ) : (
                <span className="aspect-square w-full rounded bg-gray-100" />
              )}
              <span className="line-clamp-2 text-xs">{p.name}</span>
              <ActionIcon
                size="sm"
                rounded="full"
                variant="solid"
                className="absolute right-1 top-1"
                onClick={() => onChange(value.filter((x) => x._id !== p._id))}
                aria-label={`Remove ${p.name}`}
              >
                <PiXBold className="h-3 w-3" />
              </ActionIcon>
            </li>
          ))}
        </ul>
      )}
      {!full && (
        <>
          <Input
            placeholder="Search products by name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
            suffix={isFetching ? <Loader size="sm" /> : undefined}
          />
          {searching && (
            <ul className="max-h-60 overflow-y-auto rounded-md border border-muted">
              {results.length === 0 && !isFetching && <li className="p-2 text-sm text-gray-500">No products found</li>}
              {results
                .filter((r: any) => !chosen.has(r._id))
                .map((r: any) => {
                  const p = featureProductFrom(r);
                  return (
                    <li key={p._id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 p-2 text-left text-sm hover:bg-gray-50"
                        onClick={() => {
                          onChange([...value, p]);
                          if (value.length + 1 >= max) setQuery('');
                        }}
                      >
                        {p.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={getCdnUrl(p.image)} alt="" className="h-9 w-9 shrink-0 rounded object-cover" />
                        ) : (
                          <span className="h-9 w-9 shrink-0 rounded bg-gray-100" />
                        )}
                        <span className="flex-1 truncate">{p.name}</span>
                        {r.status && r.status !== 'active' && <span className="text-xs text-gray-500">draft</span>}
                        <PiPlusBold className="h-4 w-4 shrink-0" />
                      </button>
                    </li>
                  );
                })}
            </ul>
          )}
        </>
      )}
      {error && <Text className="text-sm text-red-600">{error}</Text>}
    </div>
  );
}
