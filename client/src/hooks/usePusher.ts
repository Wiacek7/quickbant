import { useState, useCallback, useRef, useEffect } from 'react';
import Pusher from 'pusher-js';
import { useAuth } from './useAuth';

interface PusherMessage {
  type: string;
  [key: string]: any;
}

interface UsePusherProps {
  eventId?: number;
  onMessage?: (message: PusherMessage) => void;
}

export function usePusher({ eventId, onMessage }: UsePusherProps) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    if (!eventId || !user) return;

    // Clean up existing connection
    if (pusherRef.current) {
      pusherRef.current.disconnect();
      pusherRef.current = null;
      channelRef.current = null;
    }

    try {
      pusherRef.current = new Pusher('1815375eec67f627d132', {
        cluster: 'mt1',
        encrypted: true,
        auth: {
          headers: {
            'X-User-ID': (user as any).id
          }
        }
      });

      pusherRef.current.connection.bind('connected', () => {
        console.log('Pusher connected');
        setIsConnected(true);
      });

      pusherRef.current.connection.bind('disconnected', () => {
        console.log('Pusher disconnected');
        setIsConnected(false);
        setTypingUsers([]);
      });

      pusherRef.current.connection.bind('error', (error: any) => {
        console.error('Pusher error:', error);
        setIsConnected(false);
      });

      // Subscribe to the event channel
      const channelName = `event-${eventId}`;
      channelRef.current = pusherRef.current.subscribe(channelName);

      // Bind to channel events
      channelRef.current.bind('new_message', (data: any) => {
        onMessage?.({ type: 'new_message', ...data });
      });

      channelRef.current.bind('user_typing_start', (data: any) => {
        setTypingUsers(prev => {
          if (!prev.includes(data.username)) {
            return [...prev, data.username];
          }
          return prev;
        });
      });

      channelRef.current.bind('user_typing_stop', (data: any) => {
        setTypingUsers(prev => prev.filter(username => username !== data.username));
      });

      channelRef.current.bind('pusher:subscription_succeeded', () => {
        console.log('Successfully subscribed to', channelName);
      });

    } catch (error) {
      console.error('Failed to connect Pusher:', error);
      setIsConnected(false);
    }
  }, [eventId, user, onMessage]);

  const disconnect = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (pusherRef.current) {
      pusherRef.current.disconnect();
      pusherRef.current = null;
    }

    channelRef.current = null;
    setIsConnected(false);
    setTypingUsers([]);
  }, []);

  const sendMessage = useCallback(async (message: any) => {
    if (!eventId || !user) return;

    try {
      const response = await fetch('/api/pusher/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: `event-${eventId}`,
          event: message.type,
          data: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message via Pusher');
      }
    } catch (error) {
      console.error('Failed to send Pusher message:', error);
    }
  }, [eventId, user]);

  const sendChatMessage = useCallback((content: string, messageType = 'message', metadata?: any) => {
    // Messages are sent via API and broadcasted by server
    // This function is kept for compatibility but doesn't need to do anything
    console.log('Message will be sent via API and broadcasted by server');
  }, []);

  const startTyping = useCallback(() => {
    if (!user) return;

    sendMessage({
      type: 'user_typing_start',
      username: (user as any).firstName || 'Anonymous',
      userId: (user as any).id,
    });
  }, [sendMessage, user]);

  const stopTyping = useCallback(() => {
    if (!user) return;

    sendMessage({
      type: 'user_typing_stop',
      username: (user as any).firstName || 'Anonymous',
      userId: (user as any).id,
    });
  }, [sendMessage, user]);

  useEffect(() => {
    if (eventId && user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [eventId, user?.id]);

  return {
    isConnected,
    sendMessage,
    sendChatMessage,
    startTyping,
    stopTyping,
    typingUsers,
  };
}