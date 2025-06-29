import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './useAuth';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketProps {
  eventId?: number;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket({ eventId, onMessage }: UseWebSocketProps = {}) {
  const { user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const connect = useCallback(() => {
    if (!user || ws.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
      
      // Join event if eventId is provided
      if (eventId && user) {
        sendMessage({
          type: 'join_event',
          userId: user.id,
          eventId,
        });
      }
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Handle typing indicators
        if (message.type === 'user_typing_start') {
          setTypingUsers(prev => [...prev.filter(id => id !== message.userId), message.username]);
        } else if (message.type === 'user_typing_stop') {
          setTypingUsers(prev => prev.filter(name => name !== message.username));
        }
        
        onMessage?.(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      setTypingUsers([]);
      console.log('WebSocket disconnected');
      
      // Attempt to reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, [user, eventId, onMessage]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
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
        userId: user.id,
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
