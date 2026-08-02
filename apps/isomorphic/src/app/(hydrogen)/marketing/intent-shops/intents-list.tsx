'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge, Button, Loader, Text, Title, Alert, ActionIcon, Tooltip } from 'rizzui';
import {
  PiPencilBold,
  PiTrashBold,
  PiArrowSquareOutBold,
  PiPlusBold,
  PiEyeBold,
  PiEyeSlashBold,
} from 'react-icons/pi';
import cn from '@core/utils/class-names';
import { routes } from '@/config/routes';
import { useIntents } from '@/hooks/queries/useIntents';
import { useDeleteIntent, useToggleIntentStatus } from '@/hooks/mutations/useIntentMutations';
import { Intent, IntentStatus, MIN_PUBLISHED_PRODUCTS } from '@/data/intents-data';

type FilterType = 'all' | IntentStatus;

const FILTERS: Array<{ label: string; value: FilterType }> = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Draft', value: 'draft' },
  { label: 'Inactive', value: 'inactive' },
];

const STATUS_COLOR: Record<IntentStatus, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  draft: 'warning',
  inactive: 'secondary',
};

const STOREFRONT_URL =
  process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://www.rawura.com';

/** First few product names, so the row shows what is actually on the page. */
function describeProducts(intent: Intent): string {
  const products = intent.products || [];
  if (products.length === 0) return 'No products';

  const names = products.slice(0, 3).map((p) => p.name);
  const rest = products.length - names.length;
  return rest > 0 ? `${names.join(', ')} +${rest} more` : names.join(', ');
}

export default function IntentsList() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const { data, isLoading, error } = useIntents(
    filter === 'all' ? undefined : { status: filter }
  );

  const { mutate: deleteIntent } = useDeleteIntent({
    onSuccess: () => setConfirmingId(null),
  });
  const { mutate: toggleStatus } = useToggleIntentStatus();

  const intents = data?.intents || [];

  if (error) {
    return (
      <Alert color="danger" variant="flat">
        <Text>Failed to load intent shops. Please try again.</Text>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? 'solid' : 'outline'}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader size="lg" />
        </div>
      ) : intents.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-muted py-16">
          <Title as="h5">No intent shops yet</Title>
          <Text className="max-w-md text-center text-gray-500">
            Intent shops are curated landing pages targeting a specific search intent. Build
            them from real Search Console queries — a handful that rank beats hundreds that
            do not.
          </Text>
          <Link href={routes.eCommerce.createIntent}>
            <Button>
              <PiPlusBold className="me-1.5 h-4 w-4" />
              Create your first intent shop
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-muted">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-gray-50 text-left dark:bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-medium">Heading</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Products</th>
                <th className="px-4 py-3 font-medium">FAQs</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {intents.map((intent) => (
                <tr key={intent._id} className="border-t border-muted align-top">
                  <td className="px-4 py-3">
                    <Text className="font-medium">{intent.heading}</Text>
                    <Text className="line-clamp-1 text-gray-500">{intent.title}</Text>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs">/shop/{intent.slug}</code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Text className="font-medium">{intent.products?.length || 0}</Text>
                      {(intent.products?.length || 0) < MIN_PUBLISHED_PRODUCTS && (
                        <Badge color="warning" variant="flat" size="sm">
                          too thin
                        </Badge>
                      )}
                    </div>
                    <Text className="line-clamp-1 text-gray-500">{describeProducts(intent)}</Text>
                  </td>
                  <td className="px-4 py-3">{intent.faqs?.length || 0}</td>
                  <td className="px-4 py-3">
                    <Badge color={STATUS_COLOR[intent.status]} variant="flat">
                      {intent.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip
                        content={intent.status === 'active' ? 'Unpublish' : 'Publish'}
                        placement="top"
                      >
                        <ActionIcon
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            toggleStatus({
                              id: intent._id,
                              status: intent.status === 'active' ? 'inactive' : 'active',
                            })
                          }
                        >
                          {intent.status === 'active' ? (
                            <PiEyeSlashBold className="h-4 w-4" />
                          ) : (
                            <PiEyeBold className="h-4 w-4" />
                          )}
                        </ActionIcon>
                      </Tooltip>

                      <Tooltip content="View on storefront" placement="top">
                        <a
                          href={`${STOREFRONT_URL}/shop/${intent.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ActionIcon size="sm" variant="outline">
                            <PiArrowSquareOutBold className="h-4 w-4" />
                          </ActionIcon>
                        </a>
                      </Tooltip>

                      <Tooltip content="Edit" placement="top">
                        <Link href={routes.eCommerce.editIntent(intent._id)}>
                          <ActionIcon size="sm" variant="outline">
                            <PiPencilBold className="h-4 w-4" />
                          </ActionIcon>
                        </Link>
                      </Tooltip>

                      {confirmingId === intent._id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            color="danger"
                            onClick={() => deleteIntent(intent._id)}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Tooltip content="Delete" placement="top">
                          <ActionIcon
                            size="sm"
                            variant="outline"
                            color="danger"
                            onClick={() => setConfirmingId(intent._id)}
                          >
                            <PiTrashBold className="h-4 w-4" />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Text className={cn('text-gray-500')}>
        Only <strong>Active</strong> intent shops are rendered by the storefront and included
        in <code>sitemap.xml</code>. A page also needs at least 3 matching products or the
        storefront returns 404 rather than publishing a thin page.
      </Text>
    </div>
  );
}
