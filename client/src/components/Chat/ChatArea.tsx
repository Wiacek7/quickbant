
import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { Badge } from '@/components/ui/badge';
import { usePusher } from '@/hooks/usePusher';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';

interface ChatAreaProps {
  eventId?: number;
  onCreateChallenge: () => void;
}

export function ChatArea({ eventId, onCreateChallenge }: ChatAreaProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState<number>(0);

  // Fetch initial messages
  const { data: initialMessages = [] } = useQuery({
    queryKey: ['/api/events', eventId, 'messages'],
    enabled: !!eventId,
  });

  // Fetch event details for participant count
  const { data: eventData } = useQuery({
    queryKey: ['/api/events', eventId],
    enabled: !!eventId,
  });

  // WebSocket connection
  const { isConnected, sendChatMessage, startTyping, stopTyping, typingUsers } = usePusher({
    eventId,
    onMessage: (pusherMessage) => {
      if (pusherMessage.type === 'new_message') {
        setMessages(prev => {
          const messageExists = prev.some(msg => msg.id === pusherMessage.message.id);
          if (!messageExists) {
            // Create notification for new message
            if (pusherMessage.message.eventId === eventId) {
              // Don't create notification for own messages
              const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
              if (pusherMessage.message.userId !== currentUser.id) {
                createMessageNotification(pusherMessage.message);
              }
            }
            return [...prev, pusherMessage.message];
          }
          return prev;
        });
        queryClient.invalidateQueries({ queryKey: ['messages', eventId] });
      } else if (pusherMessage.type === 'reaction_update') {
        setMessages(prev => prev.map(msg => {
          if (msg.id === pusherMessage.messageId) {
            return {
              ...msg,
              metadata: {
                ...msg.metadata,
                reactions: pusherMessage.reactions,
              },
            };
          }
          return msg;
        }));
      } else if (pusherMessage.type === 'user_joined') {
        setActiveUsers(prev => prev + 1);
      } else if (pusherMessage.type === 'user_left') {
        setActiveUsers(prev => Math.max(0, prev - 1));
      } else if (pusherMessage.type === 'active_users_count') {
        setActiveUsers(pusherMessage.count);
      }
    },
  });

  // Update messages when initial data loads
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Update active users from event data
  useEffect(() => {
    if (eventData?.participants) {
      setActiveUsers(eventData.participants.length);
    }
  }, [eventData]);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create notification for new messages
  const createMessageNotification = async (message: any) => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'message',
          title: 'New Message',
          content: `${message.user?.firstName || 'Someone'} sent a message in ${eventData?.name || 'an event'}`,
          relatedId: eventId,
        }),
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

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

  const handleSendMessage = async (content: string, metadata?: any) => {
    if (!eventId || !content.trim()) return;

    try {
      const response = await fetch(`/api/events/${eventId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          type: 'message',
          metadata,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReply = (messageId: number, content: string) => {
    const originalMessage = messages.find(msg => msg.id === messageId);
    if (originalMessage) {
      setReplyTo({
        id: messageId,
        content: originalMessage.content,
        user: originalMessage.user,
      });
    }
  };

  const handleReact = async (messageId: number, emoji: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}/messages/${messageId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ emoji }),
      });

      if (!response.ok) {
        throw new Error('Failed to add reaction');
      }

      // The Pusher event will update the UI, so we don't need to update local state here
    } catch (error) {
      console.error('Failed to add reaction:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction. Please try again.",
        variant: "destructive",
      });
    }
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
      {/* Connection Status and Active Users */}
      <div className="border-b bg-background p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isConnected && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full">
                <span className="text-sm text-yellow-600 dark:text-yellow-400">
                  Connecting...
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{activeUsers} active user{activeUsers !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            onAcceptChallenge={handleAcceptChallenge}
            onDeclineChallenge={handleDeclineChallenge}
            onReply={handleReply}
            onReact={handleReact}
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
        disabled={false}
        isConnected={isConnected}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}
