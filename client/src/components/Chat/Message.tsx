import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Smile, Reply, MoreHorizontal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ProfileCard from '../ProfileCard';

interface MessageProps {
  message: {
    id: number;
    content: string;
    type: string;
    createdAt: string;
    user: {
      id: string;
      username?: string;
      firstName?: string;
      profileImageUrl?: string;
      level?: number;
    };
    metadata?: {
      reactions?: Record<string, number>;
      replyTo?: {
        id: number;
        content: string;
        user: {
          firstName?: string;
          username?: string;
        };
      };
      mentions?: string[];
    };
  };
  onAcceptChallenge?: (challengeId: number) => void;
  onDeclineChallenge?: (challengeId: number) => void;
  onReply?: (messageId: number, content: string) => void;
  onReact?: (messageId: number, emoji: string) => void;
}

export function Message({ message, onAcceptChallenge, onDeclineChallenge, onReply, onReact }: MessageProps) {
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const reactionPickerRef = useRef<HTMLDivElement>(null);

  // Close reaction picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (reactionPickerRef.current && !reactionPickerRef.current.contains(event.target as Node)) {
        setShowReactions(false);
      }
    };

    if (showReactions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showReactions]);

  const getUserLevel = (level?: number) => {
    if (!level || level < 5) return { badge: 'Novice', color: 'bg-gray-500' };
    if (level < 10) return { badge: 'Pro', color: 'bg-yellow-500' };
    if (level < 20) return { badge: 'Elite', color: 'bg-green-500' };
    return { badge: 'Master', color: 'bg-purple-500' };
  };

  const userLevel = getUserLevel(message.user.level);

  const handleReaction = (emoji: string) => {
    if (onReact) {
      onReact(message.id, emoji);
    }
    setShowReactions(false);
  };

  const handleReply = () => {
    if (onReply) {
      const content = `@${message.user.firstName || message.user.username} `;
      onReply(message.id, content);
    }
  };

  // Parse message content for mentions
  const parseContent = (content: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // This is a mention
        return (
          <span key={index} className="text-blue-500 font-medium bg-blue-50 px-1 rounded">
            @{part}
          </span>
        );
      }
      return part;
    });
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
          <i className="fas fa-info-circle mr-1" />
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {showProfileCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <ProfileCard
            profile={{
              id: message.user.id,
              firstName: message.user.firstName,
              username: message.user.username,
              profileImageUrl: message.user.profileImageUrl,
              level: message.user.level,
            }}
            onClose={() => setShowProfileCard(false)}
          />
        </div>
      )}

      <div className="flex items-start gap-3 hover:bg-muted/30 p-2 rounded-lg transition-colors group">
        <button
          onClick={() => setShowProfileCard(true)}
          className="flex-shrink-0"
        >
          <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary/20 transition-all">
            <AvatarImage src={message.user.profileImageUrl} />
            <AvatarFallback>
              {message.user.firstName?.[0] || message.user.username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => setShowProfileCard(true)}
              className="font-medium hover:underline"
            >
              {message.user.firstName || message.user.username || 'Unknown User'}
            </button>
            <Badge className={`${userLevel.color} text-white text-xs px-2 py-1`}>
              {userLevel.badge}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Reply indicator */}
          {message.metadata?.replyTo && (
            <div className="mb-2 p-2 bg-muted/50 rounded border-l-2 border-primary/30">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <Reply className="w-3 h-3" />
                Replying to {message.metadata.replyTo.user.firstName || message.metadata.replyTo.user.username}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {message.metadata.replyTo.content}
              </p>
            </div>
          )}

          <p className="text-sm break-words">{parseContent(message.content)}</p>

          {/* Message reactions */}
          {message.metadata?.reactions && Object.keys(message.metadata.reactions).length > 0 && (
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {Object.entries(message.metadata.reactions).map(([emoji, count]: [string, any]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted/50 hover:bg-muted rounded-full transition-colors border border-transparent hover:border-primary/20"
                >
                  <span className="text-sm">{emoji}</span>
                  <span className="text-xs font-medium text-muted-foreground">{count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Message actions (shown on hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => onReply && onReply(message.id, message.content)}
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => setShowReactions(!showReactions)}
            >
              <Smile className="w-3 h-3 mr-1" />
              React
            </Button>
          </div>

          {/* Reaction picker */}
          {showReactions && (
            <div 
              ref={reactionPickerRef}
              className="absolute z-20 mt-1 p-1 bg-background border rounded-lg shadow-lg flex gap-0.5"
            >
              {['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '👏'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="p-1.5 hover:bg-muted rounded text-sm transition-colors"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}