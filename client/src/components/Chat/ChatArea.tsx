import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/useWebSocket';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChatAreaProps {
  eventId?: number;
  onCreateChallenge: () => void;
}

export function ChatArea({ eventId, onCreateChallenge }: ChatAreaProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);

  // Fetch initial messages
  const { data: initialMessages = [] } = useQuery({
    queryKey: ['/api/events', eventId, 'messages'],
    enabled: !!eventId,
  });

  // WebSocket connection
  const { sendChatMessage, startTyping, stopTyping, typingUsers, isConnected } = useWebSocket({
    eventId,
    onMessage: (wsMessage) => {
      if (wsMessage.type === 'new_message') {
        setMessages(prev => [...prev, wsMessage.message]);
        scrollToBottom();
      }
    },
  });

  // Update messages when initial data loads
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Accept challenge mutation
  const acceptChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await apiRequest('PATCH', `/api/challenges/${challengeId}`, { status: 'accepted' });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Challenge Accepted!",
        description: "Good luck in your match!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
    onError: (error: any) => {
      console.error('Failed to accept challenge:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to accept challenge",
        variant: "destructive",
      });
    },
  });

  // Decline challenge mutation
  const declineChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const response = await apiRequest('PATCH', `/api/challenges/${challengeId}`, { status: 'rejected' });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Challenge Declined",
        description: "Challenge has been declined",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
    onError: (error: any) => {
      console.error('Failed to decline challenge:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to decline challenge",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (content: string) => {
    if (!eventId || !isConnected) return;
    sendChatMessage(content);
  };

  const handleAcceptChallenge = (challengeId: number) => {
    acceptChallengeMutation.mutate(challengeId);
  };

  const handleDeclineChallenge = (challengeId: number) => {
    declineChallengeMutation.mutate(challengeId);
  };

  if (!eventId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Welcome to EventChat</h3>
          <p>Select an event to start chatting or create a new one!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Connection Status */}
      {!isConnected && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/20 p-2 text-center">
          <span className="text-sm text-yellow-600 dark:text-yellow-400">
            Connecting to chat...
          </span>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onAcceptChallenge={handleAcceptChallenge}
            onDeclineChallenge={handleDeclineChallenge}
          />
        ))}

        {/* Typing Indicators */}
        {typingUsers.length > 0 && (
          <div className="flex items-start gap-3 opacity-70">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={handleSendMessage}
        onStartTyping={startTyping}
        onStopTyping={stopTyping}
        onCreateChallenge={onCreateChallenge}
        disabled={!isConnected}
      />
    </div>
  );
}
