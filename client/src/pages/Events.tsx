import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Gamepad2, Search, Plus, Trophy, Music, Coins, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: number;
  name: string;
  type: string;
  status: string;
  description?: string;
  entryFee?: number;
  maxParticipants?: number;
  participantCount?: number;
  createdAt: string;
  creator?: {
    id: string;
    firstName?: string;
    profileImageUrl?: string;
  };
}

const Events = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch events
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
    enabled: true,
  });

  // Set up a refresh interval to ensure the latest data is displayed
  useEffect(() => {
    const interval = setInterval(() => {
      // Refresh events every 30 seconds
      window.location.reload();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'create') {
      if (!isAuthenticated) {
        window.location.href = '/api/login';
        return;
      }
      // Navigate to create event (we'll implement this later)
      toast({
        title: "Create Event",
        description: "Event creation coming soon!",
        variant: "default",
      });
    } else {
      setSelectedCategory(categoryId);
    }
  };

  const handleJoinEvent = async (eventId: number) => {
    if (!isAuthenticated) {
      window.location.href = '/api/login';
      return;
    }

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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const categories = [
    {
      id: 'create',
      label: 'Create Event',
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#1A472E]',
      icon: <Plus className="w-6 h-6" />,
    },
    {
      id: 'gaming',
      label: 'Gaming',
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#1A472E]',
      icon: <Gamepad2 className="w-6 h-6" />,
    },
    {
      id: 'sports',
      label: 'Sports',
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#2A1215]',
      icon: <Trophy className="w-6 h-6" />,
    },
    {
      id: 'music',
      label: 'Music',
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#1F1435]',
      icon: <Music className="w-6 h-6" />,
    },
    {
      id: 'crypto',
      label: 'Crypto',
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#FFA620FF]',
      icon: <Coins className="w-6 h-6" />,
    },
    {
      id: 'social',
      label: 'Social',
      gradient: 'from-[#A020F0] to-[#CCFF00]',
      bgColor: 'bg-[#2A1F0E]',
      icon: <Users className="w-6 h-6" />,
    },
  ];

  // Filter events by category and search query
  const filteredEvents = (events as Event[]).filter((event: Event) => {
    const matchesCategory = selectedCategory === 'all' ? true : event.type.toLowerCase() === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.type.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Mobile scroll-based header animation
  const [headerOffset, setHeaderOffset] = useState(0);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) {
      setHeaderOffset(0);
      return;
    }
    
    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY > lastScrollY.current) {
            setHeaderOffset(-80); // Hide header
          } else if (currentScrollY < lastScrollY.current) {
            setHeaderOffset(0); // Show header
          }
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated header for mobile */}
      <div
        style={typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches ? {
          transform: `translateY(${headerOffset}px)`,
          transition: 'transform 0.25s cubic-bezier(.4,0,.2,1)',
          zIndex: 50,
          position: 'sticky',
          top: 0,
          background: 'inherit',
          pointerEvents: headerOffset === -80 ? 'none' : 'auto',
          opacity: headerOffset === -80 ? 0 : 1,
        } : {}}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-yellow-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-white">EventChat</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400 w-64"
                />
              </div>
              
              {/* User section */}
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <div className="text-white text-sm">
                    {(user as any)?.firstName || 'User'}
                  </div>
                  <img
                    src={(user as any)?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(user as any)?.id || 'user'}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = '/api/logout'}
                    className="text-white hover:bg-white/10"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-gradient-to-r from-purple-500 to-yellow-400 text-white font-semibold hover:from-purple-600 hover:to-yellow-500"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Category Bar */}
        <div className="p-4 border-b border-white/10">
          <div className="container mx-auto">
            <div className="flex overflow-x-auto gap-2 pb-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full border transition-all duration-300 ${
                  selectedCategory === 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-yellow-400 text-white border-transparent'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                }`}
              >
                All Events
              </button>
              
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-purple-500 to-yellow-400 text-white border-transparent'
                      : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                  }`}
                >
                  {category.icon}
                  <span className="text-sm font-medium whitespace-nowrap">{category.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="p-4 md:hidden border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto p-4">
        {eventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/10 rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-3" />
                <div className="h-3 bg-white/20 rounded mb-2" />
                <div className="h-3 bg-white/20 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="w-8 h-8 text-white/50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
            <p className="text-white/60 mb-6">
              {searchQuery ? `No events match "${searchQuery}"` : 'No events available at the moment'}
            </p>
            {isAuthenticated && (
              <Button
                onClick={() => handleCategoryClick('create')}
                className="bg-gradient-to-r from-purple-500 to-yellow-400 text-white font-semibold hover:from-purple-600 hover:to-yellow-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event: Event) => (
              <div key={event.id} className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">{event.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {event.type}
                      </Badge>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      event.status === 'active' ? 'bg-green-400' : 
                      event.status === 'pending' ? 'bg-yellow-400' : 'bg-gray-400'
                    }`} />
                  </div>
                  
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {event.description || 'Join this exciting event and compete with others!'}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      {event.entryFee && (
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4" />
                          <span>{event.entryFee}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{event.participantCount || 0}/{event.maxParticipants || '∞'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={event.creator?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${event.creator?.id || 'creator'}`}
                        alt="Creator"
                        className="w-6 h-6 rounded-full border border-white/20"
                      />
                      <span className="text-white/60 text-sm">
                        {event.creator?.firstName || 'Anonymous'}
                      </span>
                    </div>
                    
                    <Link href={`/chat/${event.id}`}>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-yellow-400 text-white font-semibold hover:from-purple-600 hover:to-yellow-500"
                      >
                        Join Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;