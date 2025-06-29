import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Swords, 
  Trophy, 
  Clock, 
  Users, 
  Target,
  Plus,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Coins,
  Calendar,
  User
} from 'lucide-react';

const Challenges = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch my challenges
  const { data: myChallenges = [] } = useQuery({
    queryKey: ['/api/challenges/my'],
    enabled: isAuthenticated,
  });

  // Fetch pending challenges (received)
  const { data: pendingChallenges = [] } = useQuery({
    queryKey: ['/api/challenges/pending'],
    enabled: isAuthenticated,
  });

  // Fetch challenge statistics
  const { data: challengeStats = {} } = useQuery({
    queryKey: ['/api/challenges/stats'],
    enabled: isAuthenticated,
  });

  // Accept challenge mutation
  const acceptChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      return await apiRequest(`/api/challenges/${challengeId}/accept`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Challenge Accepted!",
        description: "You have accepted the challenge. Good luck!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
    onError: () => {
      toast({
        title: "Accept Failed",
        description: "Failed to accept challenge. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Decline challenge mutation
  const declineChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      return await apiRequest(`/api/challenges/${challengeId}/decline`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Challenge Declined",
        description: "You have declined the challenge.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
    },
    onError: () => {
      toast({
        title: "Decline Failed",
        description: "Failed to decline challenge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      case 'accepted':
      case 'active':
        return <Clock className="w-4 h-4" />;
      case 'completed':
      case 'won':
        return <CheckCircle className="w-4 h-4" />;
      case 'declined':
      case 'lost':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
      case 'accepted':
      case 'active':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      case 'completed':
      case 'won':
        return 'bg-green-500/20 text-green-400 border-green-500/20';
      case 'declined':
      case 'lost':
        return 'bg-red-500/20 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/20';
    }
  };

  const filteredChallenges = (challenges: any[]) => {
    return challenges.filter((challenge: any) => {
      const matchesSearch = challenge.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           challenge.challenger?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           challenge.challenged?.firstName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || challenge.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading challenges...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-96 bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <Swords className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sign In Required</h2>
            <p className="text-white/70 mb-6">Please sign in to view and create challenges</p>
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
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Challenges</h1>
          <p className="text-white/70">Challenge other players, track your progress, and climb the leaderboards.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Swords className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{(challengeStats as any)?.total || 0}</p>
              <p className="text-white/60 text-sm">Total Challenges</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{(challengeStats as any)?.won || 0}</p>
              <p className="text-white/60 text-sm">Victories</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{(challengeStats as any)?.winRate || 0}%</p>
              <p className="text-white/60 text-sm">Win Rate</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{(challengeStats as any)?.active || 0}</p>
              <p className="text-white/60 text-sm">Active</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
                <Input
                  placeholder="Search challenges..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Challenge
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different challenge views */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="pending" className="data-[state=active]:bg-white/20">
              Pending ({pendingChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="my-challenges" className="data-[state=active]:bg-white/20">
              My Challenges ({myChallenges.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Challenges Tab */}
          <TabsContent value="pending">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Challenges Awaiting Your Response
                </CardTitle>
                <CardDescription className="text-white/70">
                  Other players have challenged you to compete
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingChallenges.length > 0 ? (
                  <div className="space-y-4">
                    {filteredChallenges(pendingChallenges).map((challenge: any) => (
                      <div key={challenge.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <img
                                src={challenge.challenger?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${challenge.challenger?.id}`}
                                alt="Challenger"
                                className="w-10 h-10 rounded-full border-2 border-white/20"
                              />
                              <div>
                                <h4 className="text-white font-medium">{challenge.title}</h4>
                                <p className="text-white/60 text-sm">
                                  Challenged by {challenge.challenger?.firstName || 'Anonymous'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-white/70 text-sm">
                              <div className="flex items-center gap-1">
                                <Coins className="w-4 h-4" />
                                <span>{challenge.entryFee || 0} coins</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            {challenge.description && (
                              <p className="text-white/60 text-sm mt-2">{challenge.description}</p>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => acceptChallengeMutation.mutate(challenge.id)}
                              disabled={acceptChallengeMutation.isPending}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              onClick={() => declineChallengeMutation.mutate(challenge.id)}
                              disabled={declineChallengeMutation.isPending}
                              variant="outline"
                              size="sm"
                              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60 text-lg">No pending challenges</p>
                    <p className="text-white/40 text-sm">When someone challenges you, they'll appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Challenges Tab */}
          <TabsContent value="my-challenges">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Swords className="w-5 h-5" />
                  My Challenge History
                </CardTitle>
                <CardDescription className="text-white/70">
                  Track all your challenges and their outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {myChallenges.length > 0 ? (
                  <div className="space-y-4">
                    {filteredChallenges(myChallenges).map((challenge: any) => (
                      <div key={challenge.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <img
                                src={challenge.opponent?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${challenge.opponent?.id}`}
                                alt="Opponent"
                                className="w-10 h-10 rounded-full border-2 border-white/20"
                              />
                              <div>
                                <h4 className="text-white font-medium">{challenge.title}</h4>
                                <p className="text-white/60 text-sm">
                                  vs {challenge.opponent?.firstName || 'Anonymous'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-white/70 text-sm">
                              <div className="flex items-center gap-1">
                                <Coins className="w-4 h-4" />
                                <span>{challenge.entryFee || 0} coins</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(challenge.createdAt).toLocaleDateString()}</span>
                              </div>
                              {challenge.completedAt && (
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>Completed {new Date(challenge.completedAt).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            
                            {challenge.description && (
                              <p className="text-white/60 text-sm mt-2">{challenge.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Badge className={`border ${getStatusColor(challenge.status)}`}>
                              {getStatusIcon(challenge.status)}
                              <span className="ml-1 capitalize">{challenge.status}</span>
                            </Badge>
                            
                            {challenge.status === 'active' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                View Details
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Swords className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60 text-lg">No challenges yet</p>
                    <p className="text-white/40 text-sm">Create your first challenge to get started</p>
                    <Button
                      className="mt-4 bg-gradient-to-r from-purple-500 to-yellow-400 text-white hover:from-purple-600 hover:to-yellow-500"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Challenge
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Challenges;