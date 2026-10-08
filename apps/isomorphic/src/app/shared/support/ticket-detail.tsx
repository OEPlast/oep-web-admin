'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Alert, Badge, Button, Checkbox, Loader, Select, Text, Textarea } from 'rizzui';
import { PiArrowLeftBold, PiEnvelopeSimpleBold, PiNoteBold, PiPackageBold, PiUserBold } from 'react-icons/pi';
import { routes } from '@/config/routes';
import { handleApiError } from '@/libs/axios';
import { formatToNaira } from '@/libs/currencyFormatter';
import { useTicket } from '@/hooks/queries/useSupport';
import { useAddTicketNote, useUpdateTicketStatus } from '@/hooks/mutations/useSupportMutations';
import {
  TICKET_STATUS_COLOR,
  TICKET_STATUS_OPTIONS,
  TICKET_TOPIC_LABEL,
  TicketNote,
  TicketStatus,
} from '@/types/support.types';

const authorName = (note: TicketNote) =>
  [note.by?.firstName, note.by?.lastName].filter(Boolean).join(' ') || 'Staff';

export default function TicketDetail({ id }: { id: string }) {
  const [reply, setReply] = useState('');
  const [emailReply, setEmailReply] = useState(true);
  const { data: ticket, isLoading, error } = useTicket(id);
  const updateStatus = useUpdateTicketStatus();
  // On failure (e.g. 502 when the email couldn't be sent) the draft stays so it can be retried.
  const addNote = useAddTicketNote({ onSuccess: () => setReply('') });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader size="lg" />
      </div>
    );
  }
  if (error || !ticket) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not load this ticket</Text>
        {error && <Text className="text-sm">{handleApiError(error)}</Text>}
      </Alert>
    );
  }

  const submitNote = () => {
    const text = reply.trim();
    if (!text) return;
    addNote.mutate({ id: ticket._id, text, email: emailReply });
  };

  return (
    <div className="@container">
      <div className="mb-6">
        <Link href={routes.support.tickets} className="inline-flex items-center text-sm hover:underline">
          <PiArrowLeftBold className="me-1 h-4 w-4" />
          Back to inbox
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-3">
        <div className="space-y-6 @4xl:col-span-2">
          {/* Message */}
          <div className="rounded-lg border border-muted bg-white p-6 dark:bg-gray-50">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-mono text-xl font-semibold">{ticket.ticketNumber}</h2>
                <Text className="text-sm text-gray-500">
                  {TICKET_TOPIC_LABEL[ticket.topic] ?? ticket.topic} · {new Date(ticket.createdAt).toLocaleString()}
                </Text>
              </div>
              <Badge variant="flat" color={TICKET_STATUS_COLOR[ticket.status]} className="capitalize">
                {ticket.status}
              </Badge>
            </div>
            <Text className="whitespace-pre-line text-gray-800">{ticket.message}</Text>
          </div>

          {/* Notes thread */}
          <div className="rounded-lg border border-muted bg-white p-6 dark:bg-gray-50">
            <div className="mb-4 flex items-center gap-2">
              <PiNoteBold className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold">Replies & notes</h3>
            </div>
            {ticket.notes.length === 0 ? (
              <Text className="text-sm text-gray-500">No replies yet.</Text>
            ) : (
              <ol className="space-y-4">
                {ticket.notes.map((note) => (
                  <li
                    key={note._id}
                    className={
                      note.emailed
                        ? 'rounded-md border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-300/40 dark:bg-blue-50/10'
                        : 'rounded-md border border-muted bg-gray-50 p-4'
                    }
                  >
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                      <span className="font-medium text-gray-700">{authorName(note)}</span>
                      <span className="flex items-center gap-2">
                        {note.emailed ? (
                          <Badge size="sm" variant="flat" color="info">
                            <PiEnvelopeSimpleBold className="me-1 h-3 w-3" />
                            Emailed to customer
                          </Badge>
                        ) : (
                          <Badge size="sm" variant="flat" color="secondary">
                            Internal note
                          </Badge>
                        )}
                        {new Date(note.at).toLocaleString()}
                      </span>
                    </div>
                    <Text className="whitespace-pre-line text-sm text-gray-800">{note.text}</Text>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-6 flex flex-col gap-3 border-t border-muted pt-5">
              <Textarea
                label={emailReply ? 'Reply' : 'Internal note'}
                rows={5}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={emailReply ? `Hi ${ticket.name.split(' ')[0]},` : 'Only staff see this.'}
                maxLength={5000}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Checkbox
                  label="Email this reply to the customer"
                  checked={emailReply}
                  onChange={(e) => setEmailReply(e.target.checked)}
                />
                <Button onClick={submitNote} disabled={!reply.trim()} isLoading={addNote.isPending}>
                  {emailReply ? 'Send reply' : 'Add note'}
                </Button>
              </div>
              {emailReply && ticket.status === 'open' && (
                <Text className="text-xs text-gray-500">Sending a reply moves the ticket to pending.</Text>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-lg border border-muted bg-white p-6 dark:bg-gray-50">
            <h3 className="mb-3 text-lg font-semibold">Status</h3>
            <Select
              options={TICKET_STATUS_OPTIONS}
              value={TICKET_STATUS_OPTIONS.find((o) => o.value === ticket.status) ?? null}
              onChange={(v: TicketStatus) => {
                if (v !== ticket.status) updateStatus.mutate({ id: ticket._id, status: v });
              }}
              getOptionValue={(o) => o.value}
              getOptionDisplayValue={(o) => o.label}
              disabled={updateStatus.isPending}
            />
          </div>

          <div className="rounded-lg border border-muted bg-white p-6 dark:bg-gray-50">
            <div className="mb-3 flex items-center gap-2">
              <PiUserBold className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-semibold">Customer</h3>
            </div>
            <div className="space-y-2 text-sm">
              <Text className="font-semibold">{ticket.name}</Text>
              <a href={`mailto:${ticket.email}`} className="block text-primary hover:underline">
                {ticket.email}
              </a>
              {ticket.phone && (
                <a href={`tel:${ticket.phone}`} className="block hover:underline">
                  {ticket.phone}
                </a>
              )}
            </div>
          </div>

          {(ticket.order || ticket.orderNumber) && (
            <div className="rounded-lg border border-muted bg-white p-6 dark:bg-gray-50">
              <div className="mb-3 flex items-center gap-2">
                <PiPackageBold className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold">Order</h3>
              </div>
              {ticket.order ? (
                <div className="space-y-2 text-sm">
                  <Link
                    href={routes.eCommerce.orderDetails(ticket.order._id)}
                    className="font-semibold text-primary hover:underline"
                  >
                    {ticket.order.orderNumber ?? ticket.orderNumber ?? ticket.order._id}
                  </Link>
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Status</Text>
                    <Text>{ticket.order.status}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Total</Text>
                    <Text>{formatToNaira(ticket.order.total)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text className="text-gray-500">Placed</Text>
                    <Text>{new Date(ticket.order.createdAt).toLocaleDateString()}</Text>
                  </div>
                </div>
              ) : (
                <Text className="text-sm text-gray-600">
                  The customer quoted <span className="font-mono">{ticket.orderNumber}</span>, which doesn&apos;t match an
                  order.
                </Text>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
