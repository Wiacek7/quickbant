import React, { useState, useEffect, useRef } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { usePusher } from '@/hooks/usePusher';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Users, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'wouter';

interface Message {
  id: number;
  content: string;
  type: string;
  createdAt: string;
  user: {
    id: string;
    firstName?: string;
    profileImageUrl?: string;
  };
  metadata?: any;
}

interface Event {
  id: number;
  name: string;
  type: string;
  status: string;
  description?: string;
  participantCount?: number;
  maxParticipants?: number;
}

const ChatRoom = () => {
  const [, params] = useRoute('/chat/:eventId');
  const eventId = params?.eventId ? parseInt(params.eventId) : null;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch event details
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: [`/api/events/${eventId}`],
    enabled: !!eventId && isAuthenticated,
  });

  // Fetch messages
  const { data: initialMessages = [], isLoading: messagesLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/messages`],
    enabled: !!eventId && isAuthenticated,
  });

  // Set up Pusher for real-time chat
  const { isConnected, sendChatMessage, startTyping, stopTyping, typingUsers } = usePusher({
    eventId: Number(eventId),
    onMessage: (pusherMessage) => {
      if (pusherMessage.type === 'new_message') {
        setMessages(prev => {
          // Avoid duplicates by checking if message already exists
          const messageExists = prev.some(msg => msg.id === pusherMessage.message.id);
          if (!messageExists) {
            const newMessages = [...prev, pusherMessage.message];
            scrollToBottom();
            return newMessages;
          }
          return prev;
        });
      }
    },
  });

  // Initialize messages
  useEffect(() => {
    if (initialMessages && Array.isArray(initialMessages) && initialMessages.length > 0) {
      setMessages(initialMessages as Message[]);
      scrollToBottom();
    }
  }, [initialMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isAuthenticated || !eventId) return;

    try {
      // Send via API first
      const response = await fetch(`/api/events/${eventId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message.trim(),
          type: 'message',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const newMessage = await response.json();

      // Message will be broadcasted via Pusher from the server

      setMessage('');
      stopTyping();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    // Start typing indicator
    startTyping();

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const joinEvent = async () => {
    if (!eventId || !isAuthenticated) return;

    try {
      const response = await fetch(`/api/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to join event');
      }

      toast({
        title: "Success",
        description: "Successfully joined the event!",
        variant: "default",
      });

      // Refresh the page to update participation status
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join event. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/70 mb-6">Please sign in to join the chat room.</p>
          <Button
            onClick={() => window.location.href = '/api/login'}
            className="bg-gradient-to-r from-purple-500 to-yellow-400 text-white font-semibold hover:from-purple-600 hover:to-yellow-500"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (eventLoading || messagesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading chat room...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Event Not Found</h2>
          <p className="text-white/70 mb-6">The chat room you're looking for doesn't exist.</p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-purple-500 to-yellow-400 text-white font-semibold hover:from-purple-600 hover:to-yellow-500">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-black/20 border-b border-white/10 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">{(event as any)?.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {(event as any)?.type}
                </Badge>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="text-white/60 text-sm">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-white/60">
              <Users className="w-4 h-4" />
              <span className="text-sm">{(event as any)?.participantCount || 0} participants</span>
            </div>
            <Button
              onClick={joinEvent}
              size="sm"
              className="bg-gradient-to-r from-purple-500 to-yellow-400 text-white font-semibold hover:from-purple-600 hover:to-yellow-500"
            >
              Join Event
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-white/50" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No messages yet</h3>
              <p className="text-white/60">Be the first to start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <img
                    src={(msg.user as any)?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.user.id}`}
                    alt="User"
                    className="w-8 h-8 rounded-full border border-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white text-sm">
                        {(msg.user as any)?.firstName || 'Anonymous'}
                      </span>
                      <span className="text-white/50 text-xs">
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                      <p className="text-white">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing indicators */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 text-white/60">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                  <span className="text-sm">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-black/20 border-t border-white/10 p-4">
        <div className="container mx-auto max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              value={message}
              onChange={(e) => handleTyping(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400"
              disabled={!isConnected}
            />
            <Button
              type="submit"
              disabled={!message.trim() || !isConnected}
              className="bg-gradient-to-r from-purple-500 to-yellow-400 text-white font-semibold hover:from-purple-600 hover:to-yellow-500 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;