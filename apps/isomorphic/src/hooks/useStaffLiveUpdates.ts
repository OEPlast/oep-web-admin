'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { hasFeature } from '@/config/features';

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3003';

type TicketCreated = { ticketId: string; ticketNumber: string; topic?: string; name?: string };

/**
 * Signed-in staff join the gateway's admin room, so the notification bell refreshes the moment
 * something needs attention (a new contact ticket) instead of on its next one-minute poll.
 * Mount once (the header's bell).
 */
export function useStaffLiveUpdates() {
  const { data: session } = useSession();
  const token = (session?.user as { token?: string } | undefined)?.token;
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;
    const socket = io(WEBSOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socket.on('support:ticket_created', (ticket: TicketCreated) => {
      queryClient.invalidateQueries({ queryKey: ['staff-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['support'] });
      if (hasFeature('support')) {
        toast(`New ${ticket.topic ?? 'contact'} message${ticket.name ? ` from ${ticket.name}` : ''} (${ticket.ticketNumber})`, {
          icon: '📩',
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [token, queryClient]);
}
