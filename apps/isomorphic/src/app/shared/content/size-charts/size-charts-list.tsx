'use client';

import Link from 'next/link';
import { ActionIcon, Alert, Button, Loader, Text, Title, Tooltip } from 'rizzui';
import { PiPencilBold, PiPlusBold } from 'react-icons/pi';
import DeletePopover from '@core/components/delete-popover';
import { routes } from '@/config/routes';
import { handleApiError } from '@/libs/axios';
import { useSizeCharts } from '@/hooks/queries/useContent';
import { useDeleteSizeChart } from '@/hooks/mutations/useContentMutations';

export default function SizeChartsList() {
  const { data: charts = [], isLoading, error } = useSizeCharts();
  const { mutate: deleteChart } = useDeleteSizeChart();

  if (error) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not load size charts</Text>
        <Text className="text-sm">{handleApiError(error)}</Text>
      </Alert>
    );
  }
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader size="lg" />
      </div>
    );
  }
  if (charts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-muted py-16">
        <Title as="h5">No size charts yet</Title>
        <Text className="max-w-md text-center text-gray-500">
          Create a chart, then pick it on a category (for every product in it) or on a single product.
        </Text>
        <Link href={routes.content.createSizeChart}>
          <Button>
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Create a size chart
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-muted">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-gray-50 text-left dark:bg-gray-100">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Columns</th>
            <th className="px-4 py-3 font-medium">Sizes</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {charts.map((chart) => (
            <tr key={chart._id} className="border-t border-muted align-top">
              <td className="px-4 py-3">
                <Link href={routes.content.editSizeChart(chart._id)} className="font-medium text-gray-900 hover:underline">
                  {chart.title}
                </Link>
                <Text className="text-xs text-gray-500">{chart.slug}</Text>
              </td>
              <td className="px-4 py-3 text-gray-600">{chart.columns.join(' · ') || '—'}</td>
              <td className="px-4 py-3 text-gray-600">
                {chart.rows.length
                  ? `${chart.rows.length}: ${chart.rows
                      .slice(0, 6)
                      .map((r) => r[0])
                      .join(', ')}${chart.rows.length > 6 ? '…' : ''}`
                  : '—'}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Tooltip content="Edit" placement="top">
                    <Link href={routes.content.editSizeChart(chart._id)}>
                      <ActionIcon size="sm" variant="outline" aria-label="Edit size chart">
                        <PiPencilBold className="h-4 w-4" />
                      </ActionIcon>
                    </Link>
                  </Tooltip>
                  <DeletePopover
                    title="Delete size chart"
                    description={`Delete "${chart.title}"? Products and categories using it will show no chart.`}
                    onDelete={() => deleteChart(chart._id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
