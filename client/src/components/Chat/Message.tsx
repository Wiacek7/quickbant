import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

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
    metadata?: any;
  };
  onAcceptChallenge?: (challengeId: number) => void;
  onDeclineChallenge?: (challengeId: number) => void;
}

export function Message({ message, onAcceptChallenge, onDeclineChallenge }: MessageProps) {
  const getUserLevel = (level?: number) => {
    if (!level || level < 5) return { badge: 'Novice', color: 'bg-gray-500' };
    if (level < 10) return { badge: 'Pro', color: 'bg-yellow-500' };
    if (level < 20) return { badge: 'Elite', color: 'bg-green-500' };
    return { badge: 'Master', color: 'bg-purple-500' };
  };

  const userLevel = getUserLevel(message.user.level);

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

  if (message.type === 'challenge') {
    const challengeData = message.metadata;
    return (
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 my-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.user.profileImageUrl} />
              <AvatarFallback>
                {message.user.firstName?.[0] || message.user.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-purple-600 dark:text-purple-400">
                {message.user.firstName || message.user.username} challenged you!
              </p>
              <p className="text-sm text-muted-foreground">
                {challengeData?.type || 'Custom'} Match - {challengeData?.entryFee || 0} coins entry
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-green-500 hover:bg-green-600"
              onClick={() => onAcceptChallenge?.(challengeData?.challengeId)}
            >
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onDeclineChallenge?.(challengeData?.challengeId)}
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 hover:bg-muted/30 p-2 rounded-lg transition-colors">
      <Avatar className="h-8 w-8">
        <AvatarImage src={message.user.profileImageUrl} />
        <AvatarFallback>
          {message.user.firstName?.[0] || message.user.username?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium">
            {message.user.firstName || message.user.username || 'Unknown User'}
          </span>
          <Badge className={`${userLevel.color} text-white text-xs px-2 py-1`}>
            {userLevel.badge}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm">{message.content}</p>
        
        {/* Message reactions placeholder */}
        {message.metadata?.reactions && (
          <div className="flex items-center gap-1 mt-1">
            {Object.entries(message.metadata.reactions).map(([emoji, count]: [string, any]) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs hover:bg-muted"
              >
                {emoji} {count}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
