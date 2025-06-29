import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Coins, 
  Target, 
  Users, 
  Award,
  Edit,
  Save,
  X,
  Star,
  TrendingUp
} from 'lucide-react';

const Profile = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
  });

  // Fetch user statistics
  const { data: stats = {} } = useQuery({
    queryKey: ['/api/user/stats'],
    enabled: isAuthenticated,
  });

  // Fetch user achievements
  const { data: achievements = [] } = useQuery({
    queryKey: ['/api/user/achievements'],
    enabled: isAuthenticated,
  });

  // Fetch user challenges
  const { data: challenges = [] } = useQuery({
    queryKey: ['/api/challenges/my'],
    enabled: isAuthenticated,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editData);
  };

  const handleEditClick = () => {
    setEditData({
      firstName: (user as any)?.firstName || '',
      lastName: (user as any)?.lastName || '',
    });
    setIsEditing(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-96 bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sign In Required</h2>
            <p className="text-white/70 mb-6">Please sign in to view your profile</p>
            <Button
              onClick={() => window.location.href = '/api/login'}
              className="w-full bg-gradient-to-r from-purple-500 to-yellow-400 text-white font-semibold hover:from-purple-600 hover:to-yellow-500"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader className="text-center">
                <div className="relative">
                  <img
                    src={(user as any)?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(user as any)?.id || 'user'}`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white/20 mx-auto mb-4"
                  />
                  <div className="absolute top-0 right-1/4 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={editData.firstName}
                      onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="First Name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <Input
                      value={editData.lastName}
                      onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Last Name"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-white/20 text-white hover:bg-white/10"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-white">
                      {(user as any)?.firstName || 'Anonymous User'}
                      {(user as any)?.lastName && ` ${(user as any).lastName}`}
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      {(user as any)?.email}
                    </CardDescription>
                    <Button
                      onClick={handleEditClick}
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-white/80">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{(user as any)?.email}</span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Member since {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Level {(stats as any)?.level || 1}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{(stats as any)?.coins || 0}</p>
                  <p className="text-white/60 text-sm">Coins</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{(stats as any)?.wins || 0}</p>
                  <p className="text-white/60 text-sm">Wins</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{(stats as any)?.eventsJoined || 0}</p>
                  <p className="text-white/60 text-sm">Events</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{(stats as any)?.winRate || 0}%</p>
                  <p className="text-white/60 text-sm">Win Rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {achievements.length > 0 ? (
                  <div className="space-y-3">
                    {achievements.slice(0, 5).map((achievement: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{achievement.title}</p>
                          <p className="text-white/60 text-sm">{achievement.description}</p>
                        </div>
                        <Badge variant="secondary" className="ml-auto">
                          +{achievement.points || 0} XP
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60">No achievements yet</p>
                    <p className="text-white/40 text-sm">Start participating in events to earn achievements</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Challenges */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Recent Challenges
                </CardTitle>
              </CardHeader>
              <CardContent>
                {challenges.length > 0 ? (
                  <div className="space-y-3">
                    {challenges.slice(0, 5).map((challenge: any) => (
                      <div key={challenge.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{challenge.title}</p>
                          <p className="text-white/60 text-sm">
                            vs {challenge.challenger?.firstName || 'Anonymous'}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={
                              challenge.status === 'won' ? 'default' :
                              challenge.status === 'lost' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {challenge.status}
                          </Badge>
                          {challenge.entryFee && (
                            <p className="text-white/60 text-sm mt-1">
                              {challenge.entryFee} coins
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60">No challenges yet</p>
                    <p className="text-white/40 text-sm">Challenge other players to start competing</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;