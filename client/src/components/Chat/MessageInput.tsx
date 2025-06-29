import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Plus, X } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, metadata?: any) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onCreateChallenge: () => void;
  disabled?: boolean;
  isConnected?: boolean;
  replyTo?: {
    id: number;
    content: string;
    user: {
      firstName?: string;
      username?: string;
    };
  } | null;
  onCancelReply?: () => void;
}

export function MessageInput({
  onSendMessage,
  onStartTyping,
  onStopTyping,
  onCreateChallenge,
  disabled = false,
  isConnected = true,
  replyTo,
  onCancelReply,
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showActions, setShowActions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled || !isConnected) return;

    const metadata: any = {};

    if (replyTo) {
      metadata.replyTo = replyTo;
    }

    // Extract mentions
    const mentions = message.match(/@(\w+)/g)?.map(mention => mention.substring(1)) || [];
    if (mentions.length > 0) {
      metadata.mentions = mentions;
    }

    onSendMessage(message.trim(), Object.keys(metadata).length > 0 ? metadata : undefined);
    setMessage('');
    onStopTyping();

    if (onCancelReply) {
      onCancelReply();
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);

    // Handle typing indicators
    if (value.length > 0) {
      onStartTyping();

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        onStopTyping();
      }, 3000);
    } else {
      onStopTyping();
    }
  };

  return (
    <div className="border-t bg-background">
      {replyTo && (
        <div className="px-4 py-2 bg-muted/50 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Replying to</span>
            <span className="font-medium">{replyTo.user?.firstName || 'Unknown User'}</span>
            <span className="text-muted-foreground truncate max-w-xs">
              {replyTo.content}
            </span>
          </div>
          {onCancelReply && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelReply}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowActions(!showActions)}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>

            {showActions && (
              <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 z-10">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onCreateChallenge();
                    setShowActions(false);
                  }}
                  className="w-full justify-start"
                >
                  Create Challenge
                </Button>
              </div>
            )}
          </div>

          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={replyTo ? "Type your reply..." : "Type a message... (@username to mention)"}
            disabled={disabled || !isConnected}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Escape' && onCancelReply) {
                onCancelReply();
              }
            }}
          />

          <Button
            type="submit"
            disabled={!message.trim() || disabled || !isConnected}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {!isConnected && (
          <div className="text-xs text-destructive mt-1 text-center">
            Disconnected from chat server
          </div>
        )}
      </div>
    </div>
  );
}