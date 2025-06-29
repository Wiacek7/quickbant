import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from './useAuth';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketProps {
  eventId?: number;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket({ eventId, onMessage }: UseWebSocketProps) {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!eventId || !user) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Join the event room
        if (wsRef.current && user) {
          wsRef.current.send(JSON.stringify({
            type: 'join_event',
            userId: (user as any).id,
            eventId,
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Handle typing indicators
          if (message.type === 'user_typing_start') {
            setTypingUsers(prev => {
              if (!prev.includes(message.username)) {
                return [...prev, message.username];
              }
              return prev;
            });
          } else if (message.type === 'user_typing_stop') {
            setTypingUsers(prev => prev.filter(username => username !== message.username));
          }

          // Pass message to parent component
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason);
        setIsConnected(false);
        setTypingUsers([]);

        // Only attempt to reconnect if it wasn't a manual close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, timeout);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
    }
  }, [eventId, user, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setIsConnected(false);
    setTypingUsers([]);
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
      }
    } else {
      console.warn('WebSocket is not connected, cannot send message');
    }
  }, []);

  const sendChatMessage = useCallback((content: string, messageType = 'message', metadata?: any) => {
    sendMessage({
      type: 'chat_message',
      content,
      messageType,
      metadata,
    });
  }, [sendMessage]);

  const startTyping = useCallback(() => {
    sendMessage({ type: 'typing_start' });
  }, [sendMessage]);

  const stopTyping = useCallback(() => {
    sendMessage({ type: 'typing_stop' });
  }, [sendMessage]);

  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  // Rejoin event when eventId changes
  useEffect(() => {
    if (isConnected && eventId && user) {
      sendMessage({
        type: 'join_event',
        userId: (user as any).id,
        eventId,
      });
    }
  }, [isConnected, eventId, user, sendMessage]);

  return {
    isConnected,
    sendMessage,
    sendChatMessage,
    startTyping,
    stopTyping,
    typingUsers,
  };
}