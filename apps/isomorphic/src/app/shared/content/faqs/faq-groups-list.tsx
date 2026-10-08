'use client';

import Link from 'next/link';
import { ActionIcon, Alert, Button, Loader, Text, Title, Tooltip } from 'rizzui';
import { PiPencilBold, PiPlusBold } from 'react-icons/pi';
import DeletePopover from '@core/components/delete-popover';
import { routes } from '@/config/routes';
import { handleApiError } from '@/libs/axios';
import { useFaqGroups } from '@/hooks/queries/useContent';
import { useDeleteFaqGroup } from '@/hooks/mutations/useContentMutations';

export default function FaqGroupsList() {
  const { data: groups = [], isLoading, error } = useFaqGroups();
  const { mutate: deleteGroup } = useDeleteFaqGroup();

  if (error) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not load FAQs</Text>
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
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-muted py-16">
        <Title as="h5">No FAQ groups yet</Title>
        <Text className="max-w-md text-center text-gray-500">
          The storefront FAQ page shows one section per group (e.g. Orders, Shipping, Returns), in order.
        </Text>
        <Link href={routes.content.createFaqGroup}>
          <Button>
            <PiPlusBold className="me-1.5 h-4 w-4" />
            Add a group
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
            <th className="w-20 px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Group</th>
            <th className="px-4 py-3 font-medium">Questions</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group._id} className="border-t border-muted align-top">
              <td className="px-4 py-3 text-gray-600">{group.order}</td>
              <td className="px-4 py-3">
                <Link href={routes.content.editFaqGroup(group._id)} className="font-medium text-gray-900 hover:underline">
                  {group.label}
                </Link>
                <Text className="text-xs text-gray-500">{group.key}</Text>
              </td>
              <td className="px-4 py-3">
                <Text>{group.items.length}</Text>
                {group.items[0] && <Text className="line-clamp-1 text-gray-500">{group.items[0].question}</Text>}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Tooltip content="Edit" placement="top">
                    <Link href={routes.content.editFaqGroup(group._id)}>
                      <ActionIcon size="sm" variant="outline" aria-label="Edit group">
                        <PiPencilBold className="h-4 w-4" />
                      </ActionIcon>
                    </Link>
                  </Tooltip>
                  <DeletePopover
                    title="Delete FAQ group"
                    description={`Delete "${group.label}" and its ${group.items.length} question(s)?`}
                    onDelete={() => deleteGroup(group._id)}
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
