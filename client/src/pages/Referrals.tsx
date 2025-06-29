import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Copy, 
  Gift, 
  Users, 
  TrendingUp,
  Share2,
  Check,
  ExternalLink,
  Twitter,
  Facebook,
  MessageCircle
} from 'lucide-react';

const Referrals = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Generate referral code based on user ID
  const referralCode = (user as any)?.id ? `GAMER${(user as any).id.slice(-6).toUpperCase()}` : '';
  const referralLink = `${window.location.origin}/?ref=${referralCode}`;

  // Fetch referral statistics
  const { data: referralStats = {} } = useQuery({
    queryKey: ['/api/referrals/stats'],
    enabled: isAuthenticated,
  });

  // Fetch referred users
  const { data: referredUsers = [] } = useQuery({
    queryKey: ['/api/referrals/users'],
    enabled: isAuthenticated,
  });

  // Fetch referral rewards
  const { data: rewards = [] } = useQuery({
    queryKey: ['/api/referrals/rewards'],
    enabled: isAuthenticated,
  });

  // Claim rewards mutation
  const claimRewardMutation = useMutation({
    mutationFn: async (rewardId: number) => {
      return await apiRequest(`/api/referrals/rewards/${rewardId}/claim`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Reward Claimed!",
        description: "Your referral reward has been added to your account.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/referrals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: () => {
      toast({
        title: "Claim Failed",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Referral link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const text = "Join me on EventChat - the ultimate gaming and challenge platform! 🎮";
    const url = referralLink;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading referrals...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-96 bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <UserPlus className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sign In Required</h2>
            <p className="text-white/70 mb-6">Please sign in to access the referral system</p>
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
          <h1 className="text-3xl font-bold text-white mb-2">Referral Program</h1>
          <p className="text-white/70">Invite friends and earn rewards together! Get coins for every successful referral.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Referral Link and Share */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Your Referral Link
                </CardTitle>
                <CardDescription className="text-white/70">
                  Share this link with friends to earn rewards when they join and participate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="bg-white/10 border-white/20 text-white flex-1"
                  />
                  <Button
                    onClick={copyReferralLink}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => shareToSocial('twitter')}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    <Twitter className="w-4 h-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    onClick={() => shareToSocial('facebook')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Facebook className="w-4 h-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    onClick={() => shareToSocial('whatsapp')}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-medium mb-2">How it works:</h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Share your referral link with friends</li>
                    <li>• They sign up and complete their first challenge</li>
                    <li>• You both earn 100 coins as a welcome bonus</li>
                    <li>• Continue earning 50 coins for each active referral</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Referred Users */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Your Referrals ({referredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {referredUsers.length > 0 ? (
                  <div className="space-y-3">
                    {referredUsers.map((referral: any) => (
                      <div key={referral.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={referral.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${referral.id}`}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-white/20"
                          />
                          <div>
                            <p className="text-white font-medium">
                              {referral.firstName || 'Anonymous User'}
                            </p>
                            <p className="text-white/60 text-sm">
                              Joined {new Date(referral.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={referral.isActive ? "default" : "secondary"}>
                            {referral.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <p className="text-white/60 text-sm mt-1">
                            +{referral.rewardEarned || 0} coins
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60">No referrals yet</p>
                    <p className="text-white/40 text-sm">Start sharing your link to see referrals here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Statistics and Rewards */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{(referralStats as any)?.totalReferrals || 0}</p>
                  <p className="text-white/60 text-sm">Total Referrals</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <Gift className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{(referralStats as any)?.totalEarned || 0}</p>
                  <p className="text-white/60 text-sm">Coins Earned</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{(referralStats as any)?.activeReferrals || 0}</p>
                  <p className="text-white/60 text-sm">Active Users</p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-4 text-center">
                  <ExternalLink className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{(referralStats as any)?.clickCount || 0}</p>
                  <p className="text-white/60 text-sm">Link Clicks</p>
                </CardContent>
              </Card>
            </div>

            {/* Pending Rewards */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Pending Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rewards.length > 0 ? (
                  <div className="space-y-3">
                    {rewards.filter((reward: any) => !reward.claimed).map((reward: any) => (
                      <div key={reward.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{reward.description}</p>
                          <p className="text-white/60 text-sm">{reward.amount} coins</p>
                        </div>
                        <Button
                          onClick={() => claimRewardMutation.mutate(reward.id)}
                          disabled={claimRewardMutation.isPending}
                          size="sm"
                          className="bg-gradient-to-r from-purple-500 to-yellow-400 text-white hover:from-purple-600 hover:to-yellow-500"
                        >
                          Claim
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Gift className="w-12 h-12 text-white/30 mx-auto mb-3" />
                    <p className="text-white/60 text-sm">No pending rewards</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Referral Tiers */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Referral Tiers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Bronze (0-4 referrals)</span>
                    <span className="text-yellow-400 text-sm">50 coins each</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Silver (5-9 referrals)</span>
                    <span className="text-yellow-400 text-sm">75 coins each</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/70 text-sm">Gold (10+ referrals)</span>
                    <span className="text-yellow-400 text-sm">100 coins each</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/20 to-yellow-400/20 rounded-lg p-3 mt-4">
                  <p className="text-white text-sm text-center">
                    Current Tier: <span className="font-bold">
                      {(referralStats as any)?.totalReferrals >= 10 ? 'Gold' : 
                       (referralStats as any)?.totalReferrals >= 5 ? 'Silver' : 'Bronze'}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;