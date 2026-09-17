'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export interface RealtimeCommentChange {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: any;
  old: any;
}

export function useSupabaseRealtime(
  table: string,
  onChange: (change: RealtimeCommentChange) => void,
  filter?: string
) {
  const channelRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase env not configured for realtime');
      return;
    }

    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const channelName = `realtime-${table}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          onChange({
            eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
            new: payload.new,
            old: payload.old,
          });
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
        console.log(`[Realtime] ${table}: ${status}`);
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onChange]);

  return { connected };
}

export function useRealtimeComments() {
  const [comments, setComments] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);

  const handleChange = useCallback((change: RealtimeCommentChange) => {
    setComments((prev) => {
      switch (change.eventType) {
        case 'INSERT': {
          if (prev.some((c) => c.comment_id === change.new.comment_id)) return prev;
          return [change.new, ...prev];
        }
        case 'UPDATE': {
          return prev.map((c) => (c.comment_id === change.new.comment_id ? change.new : c));
        }
        case 'DELETE': {
          return prev.filter((c) => c.comment_id !== change.old.comment_id);
        }
        default:
          return prev;
      }
    });
  }, []);

  const realtime = useSupabaseRealtime('instagram_agent_comments', handleChange);
  setConnected(realtime.connected);

  return { comments, connected, setComments };
}