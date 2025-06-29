import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Moon, Sun, Plus, MessageCircle, Gamepad2, Coins, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

interface SidebarProps {
  selectedEventId?: number;
  onEventSelect: (eventId: number) => void;
  onCreateEvent: () => void;
}

interface Event {
  id: number;
  name: string;
  type: string;
  status: string;
  participantCount?: number;
  lastMessage?: string;
  unreadCount?: number;
}

export function Sidebar({ selectedEventId, onEventSelect, onCreateEvent }: SidebarProps) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'events' | 'challenges'>('events');

  const { data: userEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/events/my'],
  });

  const { data: pendingChallenges = [] } = useQuery({
    queryKey: ['/api/challenges/pending'],
  });

  return (
    <div className="hidden md:flex md:w-72 bg-card border-r flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">EventChat</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback>
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* User Stats */}
        <div className="mt-3 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{user?.coins || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-purple-500" />
            <span className="font-medium">Lvl {user?.level || 1}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b">
        <Button
          variant={activeTab === 'events' ? 'default' : 'ghost'}
          className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          onClick={() => setActiveTab('events')}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Events
        </Button>
        <Button
          variant={activeTab === 'challenges' ? 'default' : 'ghost'}
          className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary relative"
          onClick={() => setActiveTab('challenges')}
        >
          <Gamepad2 className="h-4 w-4 mr-2" />
          Challenges
          {pendingChallenges.length > 0 && (
            <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
              {pendingChallenges.length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'events' ? (
          <div className="space-y-2">
            {userEvents.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                  selectedEventId === event.id ? 'bg-primary/10 border border-primary/20' : ''
                }`}
                onClick={() => onEventSelect(event.id)}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium truncate">{event.name}</h3>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${
                      event.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`} />
                    <span className="text-xs text-muted-foreground">
                      {event.participantCount || 0}
                    </span>
                  </div>
                </div>
                {event.lastMessage && (
                  <p className="text-xs text-muted-foreground truncate">
                    {event.lastMessage}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground capitalize">
                    {event.type}
                  </span>
                  {event.unreadCount && event.unreadCount > 0 && (
                    <Badge variant="default" className="h-5 px-2 text-xs">
                      {event.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {pendingChallenges.map((challenge: any) => (
              <div
                key={challenge.id}
                className="p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={challenge.challenger?.profileImageUrl} />
                    <AvatarFallback className="text-xs">
                      {challenge.challenger?.firstName?.[0] || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {challenge.challenger?.firstName || challenge.challenger?.username}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {challenge.type} challenge - {challenge.entryFee} coins
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="h-7 text-xs">
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t">
        <Button 
          onClick={onCreateEvent}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>
    </div>
  );
}
