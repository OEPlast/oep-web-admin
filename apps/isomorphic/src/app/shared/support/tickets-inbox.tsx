'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Alert, Badge, Button, Input, Loader, Text, Title } from 'rizzui';
import { PiMagnifyingGlassBold } from 'react-icons/pi';
import { routes } from '@/config/routes';
import { handleApiError } from '@/libs/axios';
import { useTickets } from '@/hooks/queries/useSupport';
import SimplePager from '@/app/shared/simple-pager';
import { TICKET_STATUS_COLOR, TICKET_TOPIC_LABEL, TicketStatus } from '@/types/support.types';

dayjs.extend(relativeTime);

type Filter = 'all' | TicketStatus;

const FILTERS: Array<{ label: string; value: Filter }> = [
  { label: 'Open', value: 'open' },
  { label: 'Pending', value: 'pending' },
  { label: 'Closed', value: 'closed' },
  { label: 'All', value: 'all' },
];

const PAGE_SIZE = 20;

export default function TicketsInbox() {
  const [filter, setFilter] = useState<Filter>('open');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchText.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchText]);

  const { data, isLoading, isFetching, error } = useTickets({
    status: filter === 'all' ? undefined : filter,
    search,
    page,
    limit: PAGE_SIZE,
  });
  const tickets = data?.items ?? [];
  const meta = data?.meta;

  if (error) {
    return (
      <Alert color="danger" variant="flat">
        <Text className="font-semibold">Could not load the inbox</Text>
        <Text className="text-sm">{handleApiError(error)}</Text>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? 'solid' : 'outline'}
              onClick={() => {
                setFilter(f.value);
                setPage(1);
              }}
            >
              {f.label}
              {f.value === 'open' && meta && meta.open > 0 && (
                <Badge size="sm" color="warning" className="ms-2">
                  {meta.open}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        <Input
          className="w-full sm:w-80"
          placeholder="Ticket number, email, name or order…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<PiMagnifyingGlassBold className="h-4 w-4" />}
          clearable
          onClear={() => setSearchText('')}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader size="lg" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-muted py-16">
          <Title as="h5">{search ? 'No matching messages' : filter === 'open' ? 'Inbox zero' : 'No messages'}</Title>
          <Text className="max-w-md text-center text-gray-500">
            Messages sent from the storefront contact form land here.
          </Text>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-muted">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-gray-50 text-left dark:bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket._id} className="border-t border-muted align-top hover:bg-gray-50/60">
                  <td className="px-4 py-3">
                    <Link
                      href={routes.support.ticketDetails(ticket._id)}
                      className="font-mono font-medium text-gray-900 hover:underline"
                    >
                      {ticket.ticketNumber}
                    </Link>
                    <Text className="text-xs text-gray-500">{TICKET_TOPIC_LABEL[ticket.topic] ?? ticket.topic}</Text>
                  </td>
                  <td className="px-4 py-3">
                    <Text className="font-medium">{ticket.name}</Text>
                    <Text className="text-xs text-gray-500">{ticket.email}</Text>
                  </td>
                  <td className="max-w-[360px] px-4 py-3">
                    <Link href={routes.support.ticketDetails(ticket._id)} className="line-clamp-2 text-gray-700">
                      {ticket.message}
                    </Link>
                    {ticket.orderNumber && <Text className="text-xs text-gray-500">Order {ticket.orderNumber}</Text>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="flat" color={TICKET_STATUS_COLOR[ticket.status]} className="capitalize">
                      {ticket.status}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-600" title={new Date(ticket.createdAt).toLocaleString()}>
                    {dayjs(ticket.createdAt).fromNow()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && <SimplePager page={meta.page} pages={meta.pages} total={meta.total} onChange={setPage} isLoading={isFetching} />}
    </div>
  );
}
