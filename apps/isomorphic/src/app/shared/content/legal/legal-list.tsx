'use client';

import Link from 'next/link';
import { ActionIcon, Alert, Badge, Button, Loader, Text, Title, Tooltip } from 'rizzui';
import { PiPencilBold, PiPlusBold } from 'react-icons/pi';
import DeletePopover from '@core/components/delete-popover';
import { routes } from '@/config/routes';
import { handleApiError } from '@/libs/axios';
import { useLegalDocuments } from '@/hooks/queries/useContent';
import { useDeleteLegalDocument } from '@/hooks/mutations/useContentMutations';
import { SUGGESTED_LEGAL_SLUGS } from '@/types/content.types';

export default function LegalList() {
  const { data: docs = [], isLoading, error } = useLegalDocuments();
  const { mutate: deleteDoc } = useDeleteLegalDocument();

  if (error) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not load legal pages</Text>
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

  const missing = SUGGESTED_LEGAL_SLUGS.filter((slug) => !docs.some((d) => d.slug === slug));

  return (
    <div className="flex flex-col gap-5">
      {missing.length > 0 && (
        <Alert color="info" variant="flat">
          <Text>
            The storefront links to {missing.map((s) => `/${s}`).join(', ')}, which{' '}
            {missing.length === 1 ? "doesn't exist" : "don't exist"} yet.
          </Text>
        </Alert>
      )}

      {docs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-muted py-16">
          <Title as="h5">No legal pages yet</Title>
          <Link href={routes.content.createLegal}>
            <Button>
              <PiPlusBold className="me-1.5 h-4 w-4" />
              Add a legal page
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-muted">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-gray-50 text-left dark:bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Effective</th>
                <th className="px-4 py-3 font-medium">Last edited</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc._id} className="border-t border-muted align-top">
                  <td className="px-4 py-3">
                    <Link href={routes.content.editLegal(doc._id)} className="font-medium text-gray-900 hover:underline">
                      {doc.title}
                    </Link>
                    <div className="flex items-center gap-2">
                      <Text className="text-xs text-gray-500">/{doc.slug}</Text>
                      {!SUGGESTED_LEGAL_SLUGS.includes(doc.slug) && (
                        <Badge size="sm" variant="flat" color="secondary">
                          custom
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(doc.effectiveDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(doc.updatedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Tooltip content="Edit" placement="top">
                        <Link href={routes.content.editLegal(doc._id)}>
                          <ActionIcon size="sm" variant="outline" aria-label="Edit legal page">
                            <PiPencilBold className="h-4 w-4" />
                          </ActionIcon>
                        </Link>
                      </Tooltip>
                      <DeletePopover
                        title="Delete legal page"
                        description={`Delete "${doc.title}"? /${doc.slug} will stop working.`}
                        onDelete={() => deleteDoc(doc._id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
