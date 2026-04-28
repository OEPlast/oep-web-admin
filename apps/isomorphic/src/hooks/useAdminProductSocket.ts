'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

interface BatchedProductUpdate {
  productId: string;
  events: unknown[];
  timestamp: string;
  count: number;
}

interface ServerToClientEvents {
  batched_product_update: (update: BatchedProductUpdate) => void;
  pong: () => void;
  error: (error: { message: string; code?: string }) => void;
  connected: (data: { socketId: string; authenticated: boolean }) => void;
}

interface ClientToServerEvents {
  join_product: (productId: string) => void;
  leave_product: (productId: string) => void;
  ping: () => void;
}

const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3003';

export function useAdminProductSocket(options: { productIds?: string[]; enabled?: boolean } = {}) {
  const { productIds = [], enabled = true } = options;

  const queryClient = useQueryClient();
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscribedRef = useRef<Set<string>>(new Set());

  const subscribe = useCallback((productId: string) => {
    if (!socketRef.current || !isConnected) return;
    if (!subscribedRef.current.has(productId)) {
      socketRef.current.emit('join_product', productId);
      subscribedRef.current.add(productId);
    }
  }, [isConnected]);

  const unsubscribe = useCallback((productId: string) => {
    if (!socketRef.current || !isConnected) return;
    if (subscribedRef.current.has(productId)) {
      socketRef.current.emit('leave_product', productId);
      subscribedRef.current.delete(productId);
    }
  }, [isConnected]);

  // Initialize socket
  useEffect(() => {
    if (!enabled) return;

    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(WEBSOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;
    const subscribed = subscribedRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      subscribed.forEach((id) => socket.emit('join_product', id));
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('batched_product_update', (update: BatchedProductUpdate) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'byId', update.productId] });
    });

    return () => {
      subscribed.forEach((id) => socket.emit('leave_product', id));
      subscribed.clear();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [enabled, queryClient]);

  // Subscribe/unsubscribe as productIds change
  useEffect(() => {
    if (!enabled || !isConnected) return;

    const current = new Set(productIds);

    productIds.forEach((id) => subscribe(id));

    subscribedRef.current.forEach((id) => {
      if (!current.has(id)) unsubscribe(id);
    });
  }, [productIds, enabled, isConnected, subscribe, unsubscribe]);

  return { isConnected };
}
