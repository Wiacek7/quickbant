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
  const maxReconnectAttempts = 3;
  const isConnectingRef = useRef(false);
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!eventId || !user || isConnectingRef.current || !mountedRef.current) return;

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close(1000, 'Reconnecting');
      wsRef.current = null;
    }

    isConnectingRef.current = true;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        if (!mountedRef.current) return;
        
        console.log('WebSocket connected');
        setIsConnected(true);
        isConnectingRef.current = false;
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
        if (!mountedRef.current) return;
        
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
        if (!mountedRef.current) return;
        
        console.log('WebSocket disconnected', event.code, event.reason);
        setIsConnected(false);
        setTypingUsers([]);
        isConnectingRef.current = false;

        // Only attempt to reconnect if it wasn't a manual close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts && mountedRef.current) {
          const timeout = Math.min(Math.pow(2, reconnectAttempts.current) * 1000, 10000); // Cap at 10 seconds
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              reconnectAttempts.current++;
              connect();
            }
          }, timeout);
        }
      };

      wsRef.current.onerror = (error) => {
        if (!mountedRef.current) return;
        
        console.error('WebSocket error:', error);
        setIsConnected(false);
        isConnectingRef.current = false;
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setIsConnected(false);
      isConnectingRef.current = false;
    }
  }, [eventId, user, onMessage]);

  const disconnect = useCallback(() => {
    mountedRef.current = false;
    isConnectingRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.close(1000, 'Manual disconnect');
      }
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
    mountedRef.current = true;
    
    // Only connect if we have the required data
    if (eventId && user) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [eventId, user?.id]); // Only depend on eventId and user.id

  // Rejoin event when connection is established
  useEffect(() => {
    if (isConnected && eventId && user && wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'join_event',
          userId: (user as any).id,
          eventId,
        }));
      } catch (error) {
        console.error('Failed to rejoin event:', error);
      }
    }
  }, [isConnected, eventId, user?.id]);

  return {
    isConnected,
    sendMessage,
    sendChatMessage,
    startTyping,
    stopTyping,
    typingUsers,
  };
}