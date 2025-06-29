import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Trophy, Medal, Sword } from 'lucide-react';

interface RightPanelProps {
  eventId?: number;
  onChallengeUser: (userId: string) => void;
}

export function RightPanel({ eventId, onChallengeUser }: RightPanelProps) {
  const { data: eventDetails } = useQuery({
    queryKey: ['/api/events', eventId],
    enabled: !!eventId,
  });

  const participants = eventDetails?.participants || [];

  // Mock leaderboard data - in real app, this would come from API
  const leaderboard = [
    { rank: 1, username: 'Alex_Champion', points: 500, userId: 'user1' },
    { rank: 2, username: 'Sarah_Gaming', points: 350, userId: 'user2' },
    { rank: 3, username: 'Mike_Poker', points: 250, userId: 'user3' },
  ];

  // Mock achievements - in real app, this would come from API
  const recentAchievements = [
    {
      id: 1,
      icon: '🏆',
      title: 'Tournament Winner',
      description: 'Alex_Champion earned 500 coins',
      color: 'bg-green-500',
    },
    {
      id: 2,
      icon: '⚡',
      title: 'Speed Demon',
      description: 'Mike_Poker completed 10 quick challenges',
      color: 'bg-purple-500',
    },
    {
      id: 3,
      icon: '🎯',
      title: 'Perfect Streak',
      description: 'Sarah_Gaming won 5 games in a row',
      color: 'bg-yellow-500',
    },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-gray-400';
      case 3: return 'bg-orange-400';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="hidden lg:flex lg:w-80 bg-card border-l flex-col">
      {/* Panel Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Event Details</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Event Participants */}
      <div className="p-4 border-b">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <span>Players</span>
          <Badge variant="secondary" className="h-5 px-2 text-xs">
            {participants.length}
          </Badge>
        </h4>
        <div className="space-y-2">
          {participants.map((participant: any) => (
            <div
              key={participant.userId}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={participant.user?.profileImageUrl} />
                    <AvatarFallback className="text-xs">
                      {participant.user?.firstName?.[0] || participant.user?.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {participant.user?.username || participant.user?.firstName || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {participant.user?.coins || 0} coins
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-purple-500 hover:text-purple-600"
                onClick={() => onChallengeUser(participant.userId)}
              >
                <Sword className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="p-4 border-b">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span>Event Leaderboard</span>
        </h4>
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-2 rounded-lg ${
                entry.rank === 1 ? 'bg-yellow-500/10' : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 ${getRankColor(entry.rank)} text-white rounded-full flex items-center justify-center text-xs font-bold`}
                >
                  {entry.rank}
                </div>
                <span className="text-sm font-medium">{entry.username}</span>
              </div>
              <span className={`text-sm font-bold ${
                entry.rank === 1 ? 'text-yellow-600' : 'text-muted-foreground'
              }`}>
                +{entry.points}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <Medal className="h-4 w-4 text-green-500" />
          <span>Recent Achievements</span>
        </h4>
        <div className="space-y-3">
          {recentAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg animate-slide-down"
            >
              <div className={`w-8 h-8 ${achievement.color} rounded-full flex items-center justify-center text-white text-sm`}>
                {achievement.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{achievement.title}</p>
                <p className="text-xs text-muted-foreground">
                  {achievement.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
