import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Sword, Menu, Gamepad2 } from 'lucide-react';

interface TopHeaderProps {
  currentEvent?: any;
  onMenuClick: () => void;
  onCreateChallenge: () => void;
}

export function TopHeader({ currentEvent, onMenuClick, onCreateChallenge }: TopHeaderProps) {
  const { data: notificationCount = { count: 0 } } = useQuery({
    queryKey: ['/api/notifications/count'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: pendingChallenges = [] } = useQuery({
    queryKey: ['/api/challenges/pending'],
    refetchInterval: 30000,
  });

  const getEventEmoji = (type: string) => {
    switch (type) {
      case 'poker': return '🎲';
      case 'chess': return '♟️';
      case 'tournament': return '🏆';
      default: return '🎮';
    }
  };

  return (
    <div className="bg-card border-b p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          {/* Event Info */}
          {currentEvent && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {getEventEmoji(currentEvent.type)}
              </div>
              <div>
                <h2 className="font-semibold">{currentEvent.name}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>
                      {currentEvent.participants?.length || 0} players active
                    </span>
                  </span>
                  {currentEvent.prizePot && (
                    <>
                      <span>•</span>
                      <span>Pot: {currentEvent.prizePot} coins</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
              {notificationCount.count > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {notificationCount.count > 9 ? '9+' : notificationCount.count}
                </Badge>
              )}
            </Button>
          </div>

          {/* Challenge Requests */}
          <div className="relative">
            <Button variant="ghost" size="icon">
              <Sword className="h-4 w-4" />
              {pendingChallenges.length > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-yellow-500 hover:bg-yellow-600"
                >
                  {pendingChallenges.length > 9 ? '9+' : pendingChallenges.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Challenge Players Button */}
          <Button 
            className="hidden md:flex"
            onClick={onCreateChallenge}
          >
            <Gamepad2 className="h-4 w-4 mr-2" />
            Challenge Players
          </Button>
        </div>
      </div>

      {/* Event Banner */}
      {currentEvent && currentEvent.status === 'active' && (
        <div className="mt-4 bg-gradient-to-r from-primary/10 to-purple-600/10 rounded-lg p-4 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary flex items-center gap-2">
                🏆 {currentEvent.type === 'tournament' ? 'Tournament Active' : 'Event Live'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {currentEvent.description || `Winner takes all! Current pot: ${currentEvent.prizePot || 0} coins`}
              </p>
            </div>
            {currentEvent.endTime && (
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {/* TODO: Add countdown timer */}
                  --:--
                </div>
                <div className="text-xs text-muted-foreground">Time remaining</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
