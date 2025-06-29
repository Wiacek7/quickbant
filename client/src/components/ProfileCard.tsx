
import React, { useState, useEffect } from 'react';
import { X, Trophy, Users, TrendingUp, Star, Send, Share2, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Profile {
  id: string;
  name?: string;
  username?: string;
  firstName?: string;
  profileImageUrl?: string;
  bio?: string;
  level?: number;
  points?: number;
  followers_count?: number;
  is_following?: boolean;
  stats?: {
    events_won?: number;
    total_earnings?: number;
  };
  rank?: number;
}

interface ProfileCardProps {
  profile?: Profile;
  userId?: string;
  onClose: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile: initialProfile, userId, onClose }) => {
  const [profile, setProfile] = useState<Profile | null>(initialProfile || null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadProfile = async () => {
      if (!initialProfile && userId) {
        setLoading(true);
        try {
          const response = await fetch(`/api/users/${userId}`);
          if (response.ok) {
            const data = await response.json();
            setProfile(data);
          }
        } catch (error) {
          console.error('Failed to load profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();
  }, [userId, initialProfile]);

  const getUserLevel = (level?: number) => {
    if (!level || level < 5) return { badge: 'Novice', color: 'bg-gray-500' };
    if (level < 10) return { badge: 'Pro', color: 'bg-yellow-500' };
    if (level < 20) return { badge: 'Elite', color: 'bg-green-500' };
    return { badge: 'Master', color: 'bg-purple-500' };
  };

  if (loading || !profile) {
    return (
      <div
        className="bg-white rounded-[2rem] w-full max-w-[320px] shadow-xl border overflow-hidden flex flex-col items-center p-0 min-h-[220px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full bg-white/80"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col items-center w-full px-4 pt-6 pb-2 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-gray-200 mb-2" />
          <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-16 bg-gray-100 rounded mb-2" />
        </div>
      </div>
    );
  }

  const userLevel = getUserLevel(profile.level);
  const displayName = profile.name || profile.firstName || 'Unknown User';
  const displayUsername = profile.username || profile.id;

  return (
    <div
      className="bg-white rounded-[2rem] w-full max-w-[320px] shadow-xl border overflow-hidden flex flex-col items-center p-0 relative"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Share and Close buttons */}
      <div className="absolute top-3 left-3 z-20">
        <button
          type="button"
          onClick={async (e) => {
            e.stopPropagation();
            await navigator.clipboard.writeText(`${window.location.origin}/profile/${profile.id}`);
            toast({
              title: "Success",
              description: "Profile link copied!",
            });
          }}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full bg-white/80"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
      <div className="absolute top-3 right-3 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full bg-white/80"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Header: Avatar, Name, Username, Badges */}
      <div className="w-full flex flex-col items-center pt-6 pb-2 px-4 relative">
        <Avatar className="h-16 w-16 mb-2">
          <AvatarImage src={profile.profileImageUrl} />
          <AvatarFallback>{displayName[0]?.toUpperCase() || 'U'}</AvatarFallback>
        </Avatar>
        <h2 className="text-base font-semibold text-gray-800 mt-1">{displayName}</h2>
        <p className="text-xs text-gray-400 mb-1">@{displayUsername}</p>
        
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="flex items-center gap-0.5 text-[11px] text-yellow-500">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" strokeWidth={0} />
            {profile.points || 0}
          </span>
          <span className="flex items-center gap-0.5 text-[11px] text-blue-500">
            <Users className="w-4 h-4 text-blue-500" strokeWidth={2} />
            {profile.followers_count || 0}
          </span>
          <Badge className={`${userLevel.color} text-white text-xs px-2 py-1`}>
            {userLevel.badge}
          </Badge>
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <p className="text-gray-700 text-xs text-center mb-2 max-w-xs px-2 leading-tight">
          {profile.bio}
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 w-full px-4 mb-2">
        <div className="flex flex-col items-center bg-gray-50 rounded-lg py-2">
          <span className="flex items-center gap-1 text-[12px] text-yellow-500 font-semibold">
            <Trophy className="w-4 h-4" />
            {profile.stats?.events_won || 0}
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5">Events Won</span>
        </div>
        <div className="flex flex-col items-center bg-gray-50 rounded-lg py-2">
          <span className="flex items-center gap-1 text-[12px] text-blue-500 font-semibold">
            <Users className="w-4 h-4" />
            {profile.followers_count || 0}
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5">Followers</span>
        </div>
        <div className="flex flex-col items-center bg-gray-50 rounded-lg py-2">
          <span className="flex items-center gap-1 text-[12px] text-green-500 font-semibold">
            <TrendingUp className="w-4 h-4" />
            {profile.stats?.total_earnings || 0}
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5">Earnings</span>
        </div>
      </div>

      {/* Actions */}
      {user && user.id !== profile.id && (
        <div className="flex gap-2 w-full px-4 mb-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              toast({
                title: "Challenge",
                description: "Challenge feature coming soon!",
              });
            }}
            className="flex-1 py-1.5 rounded-full text-[13px] font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
          >
            <Trophy className="w-4 h-4 mr-1" />
            Challenge
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              toast({
                title: "Message",
                description: "Direct messaging coming soon!",
              });
            }}
            className="flex-1 py-1.5 rounded-full text-[13px] font-medium bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
          >
            <Send className="w-4 h-4 mr-1" />
            Message
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
