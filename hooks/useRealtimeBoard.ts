'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

type BoardEvent =
  | { type: 'report:moved'; reportId: string; newStatus: string }
  | { type: 'report:created'; reportId: string }
  | { type: 'report:deleted'; reportId: string }
  | { type: 'report:updated'; reportId: string }
  | { type: 'column:created' | 'column:deleted' };

interface UseRealtimeBoardOptions {
  slug: string;
  teamId: string | undefined;
  token: string | undefined;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

/**
 * Connects to the backend Socket.io server and listens for board events
 * for the given site slug. On each event it invalidates the relevant
 * React Query cache keys so the board stays in sync across all users.
 *
 * The socket is torn down when the component unmounts or when the slug
 * changes.
 *
 * Backend must:
 *   1. Accept a Socket.io connection at NEXT_PUBLIC_BACKEND_URL
 *   2. Authenticate via the `auth: { token }` handshake
 *   3. Join clients to a room named `site:${slug}` on connection
 *   4. Emit the event types defined in BoardEvent above
 */
export function useRealtimeBoard({
  slug,
  teamId,
  token,
  onConnected,
  onDisconnected,
}: UseRealtimeBoardOptions) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);
  const onConnectedRef = useRef(onConnected);
  const onDisconnectedRef = useRef(onDisconnected);

  useEffect(() => { onConnectedRef.current = onConnected; }, [onConnected]);
  useEffect(() => { onDisconnectedRef.current = onDisconnected; }, [onDisconnected]);

  const invalidateBoard = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['reports', slug, teamId] });
  }, [queryClient, slug, teamId]);

  const invalidateColumns = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['columns', slug, teamId] });
  }, [queryClient, slug, teamId]);

  useEffect(() => {
    if (!token || !slug) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) return;

    const socket = io(backendUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      isConnectedRef.current = true;
      socket.emit('join:site', { slug });
      onConnectedRef.current?.();
    });

    socket.on('disconnect', () => {
      isConnectedRef.current = false;
      onDisconnectedRef.current?.();
    });

    socket.on('board:event', (event: BoardEvent) => {
      switch (event.type) {
        case 'report:moved':
        case 'report:created':
        case 'report:deleted':
        case 'report:updated':
          invalidateBoard();
          break;
        case 'column:created':
        case 'column:deleted':
          invalidateColumns();
          break;
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    };
  }, [slug, token, invalidateBoard, invalidateColumns]);

  return {
    isConnected: isConnectedRef.current,
  };
}
