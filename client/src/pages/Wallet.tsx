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
  Wallet as WalletIcon, 
  Coins, 
  Plus, 
  Minus,
  TrendingUp,
  TrendingDown,
  CreditCard,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Trophy,
  Users,
  Calendar,
  ExternalLink,
  DollarSign
} from 'lucide-react';

const Wallet = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // Fetch wallet data
  const { data: walletData = {} } = useQuery({
    queryKey: ['/api/wallet'],
    enabled: isAuthenticated,
  });

  // Fetch transaction history
  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/wallet/transactions'],
    enabled: isAuthenticated,
  });

  // Fetch payment methods
  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['/api/wallet/payment-methods'],
    enabled: isAuthenticated,
  });

  // Purchase coins mutation
  const purchaseCoinsMutation = useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string }) => {
      return await apiRequest('/api/wallet/purchase', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful!",
        description: "Coins have been added to your wallet.",
      });
      setPurchaseAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: () => {
      toast({
        title: "Purchase Failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Withdraw coins mutation
  const withdrawCoinsMutation = useMutation({
    mutationFn: async (data: { amount: number; method: string }) => {
      return await apiRequest('/api/wallet/withdraw', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal Requested",
        description: "Your withdrawal request is being processed.",
      });
      setWithdrawAmount('');
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
    },
    onError: () => {
      toast({
        title: "Withdrawal Failed",
        description: "Unable to process withdrawal. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = (amount: number) => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to purchase.",
        variant: "destructive",
      });
      return;
    }
    
    purchaseCoinsMutation.mutate({
      amount,
      paymentMethod: 'paystack',
    });
  };

  const handleWithdraw = (amount: number) => {
    if (amount <= 0 || amount > ((walletData as any)?.balance || 0)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount within your balance.",
        variant: "destructive",
      });
      return;
    }
    
    withdrawCoinsMutation.mutate({
      amount,
      method: 'bank_transfer',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
      case 'payout':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'reward':
      case 'bonus':
        return <Gift className="w-4 h-4 text-yellow-500" />;
      case 'win':
      case 'prize':
        return <Trophy className="w-4 h-4 text-purple-500" />;
      case 'referral':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <Coins className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'deposit':
      case 'reward':
      case 'bonus':
      case 'win':
      case 'prize':
      case 'referral':
        return 'text-green-500';
      case 'withdrawal':
      case 'payout':
      case 'loss':
      case 'fee':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading wallet...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-96 bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8 text-center">
            <WalletIcon className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Sign In Required</h2>
            <p className="text-white/70 mb-6">Please sign in to access your wallet</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-20 lg:pt-24">
      <div className="container mx-auto max-w-6xl px-4 pb-24 lg:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Wallet</h1>
          <p className="text-white/70">Manage your coins, transactions, and payments</p>
        </div>

        {/* Wallet Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <WalletIcon className="w-5 h-5" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Coins className="w-8 h-8 text-yellow-400" />
                    <span className="text-4xl font-bold text-white">
                      {(walletData as any)?.balance || 0}
                    </span>
                    <span className="text-white/60">coins</span>
                  </div>
                  <p className="text-white/60 text-sm">
                    ≈ ${((walletData as any)?.balance * 0.01 || 0).toFixed(2)} USD
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-white/60 text-sm mb-1">This Month</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-500 font-medium">
                      +{(walletData as any)?.monthlyEarnings || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDownLeft className="w-4 h-4 text-green-500" />
                    <span className="text-white/70 text-sm">Total Earned</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {(walletData as any)?.totalEarned || 0}
                  </p>
                </div>
                
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                    <span className="text-white/70 text-sm">Total Spent</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {(walletData as any)?.totalSpent || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => handlePurchase(100)}
                  disabled={purchaseCoinsMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Buy 100 Coins ($1.00)
                </Button>
                
                <Button
                  onClick={() => handlePurchase(500)}
                  disabled={purchaseCoinsMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Buy 500 Coins ($5.00)
                </Button>
                
                <Button
                  onClick={() => handlePurchase(1000)}
                  disabled={purchaseCoinsMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Buy 1000 Coins ($10.00)
                </Button>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <CreditCard className="w-6 h-6 text-yellow-400" />
                  <div className="flex-1">
                    <p className="text-white font-medium">Paystack</p>
                    <p className="text-white/60 text-sm">Cards, Bank Transfer</p>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Actions and History */}
        <Tabs defaultValue="purchase" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20">
            <TabsTrigger value="purchase" className="data-[state=active]:bg-white/20">
              Purchase Coins
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="data-[state=active]:bg-white/20">
              Withdraw
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white/20">
              Transaction History
            </TabsTrigger>
          </TabsList>

          {/* Purchase Tab */}
          <TabsContent value="purchase">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Purchase Coins
                </CardTitle>
                <CardDescription className="text-white/70">
                  Add coins to your wallet using Paystack payment gateway
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                      <h3 className="text-white font-semibold mb-1">Starter Pack</h3>
                      <p className="text-3xl font-bold text-white mb-2">100</p>
                      <p className="text-white/60 text-sm mb-3">coins</p>
                      <p className="text-green-400 font-medium">$1.00</p>
                      <Button
                        onClick={() => handlePurchase(100)}
                        disabled={purchaseCoinsMutation.isPending}
                        className="w-full mt-3"
                        size="sm"
                      >
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer relative">
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                      Popular
                    </Badge>
                    <CardContent className="p-4 text-center">
                      <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                      <h3 className="text-white font-semibold mb-1">Value Pack</h3>
                      <p className="text-3xl font-bold text-white mb-2">500</p>
                      <p className="text-white/60 text-sm mb-3">coins</p>
                      <p className="text-green-400 font-medium">$5.00</p>
                      <Button
                        onClick={() => handlePurchase(500)}
                        disabled={purchaseCoinsMutation.isPending}
                        className="w-full mt-3"
                        size="sm"
                      >
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer relative">
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-500">
                      Best Value
                    </Badge>
                    <CardContent className="p-4 text-center">
                      <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                      <h3 className="text-white font-semibold mb-1">Pro Pack</h3>
                      <p className="text-3xl font-bold text-white mb-2">1000</p>
                      <p className="text-white/60 text-sm mb-3">coins</p>
                      <p className="text-green-400 font-medium">$10.00</p>
                      <Button
                        onClick={() => handlePurchase(1000)}
                        disabled={purchaseCoinsMutation.isPending}
                        className="w-full mt-3"
                        size="sm"
                      >
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white font-medium mb-2 block">Custom Amount</label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder="Enter coin amount"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <Button
                        onClick={() => handlePurchase(parseInt(purchaseAmount) || 0)}
                        disabled={purchaseCoinsMutation.isPending || !purchaseAmount}
                        className="bg-gradient-to-r from-purple-500 to-yellow-400 text-white hover:from-purple-600 hover:to-yellow-500"
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Purchase
                      </Button>
                    </div>
                    <p className="text-white/60 text-sm mt-2">
                      Cost: ${((parseInt(purchaseAmount) || 0) * 0.01).toFixed(2)} USD
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Withdraw Tab */}
          <TabsContent value="withdraw">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Minus className="w-5 h-5" />
                  Withdraw Coins
                </CardTitle>
                <CardDescription className="text-white/70">
                  Convert your coins back to real money
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-medium mb-2">Withdrawal Information</h4>
                  <ul className="text-white/80 text-sm space-y-1">
                    <li>• Minimum withdrawal: 500 coins ($5.00)</li>
                    <li>• Processing time: 1-3 business days</li>
                    <li>• Withdrawal fee: 2% of amount</li>
                    <li>• Available balance: {(walletData as any)?.balance || 0} coins</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white font-medium mb-2 block">Withdrawal Amount</label>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder="Enter coin amount to withdraw"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <Button
                        onClick={() => handleWithdraw(parseInt(withdrawAmount) || 0)}
                        disabled={withdrawCoinsMutation.isPending || !withdrawAmount}
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Withdraw
                      </Button>
                    </div>
                    <p className="text-white/60 text-sm mt-2">
                      You'll receive: ${((parseInt(withdrawAmount) || 0) * 0.01 * 0.98).toFixed(2)} USD (after 2% fee)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {(transactions as any[]).map((transaction: any) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="text-white font-medium">{transaction.description}</p>
                            <div className="flex items-center gap-2 text-white/60 text-sm">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(transaction.createdAt).toLocaleDateString()}</span>
                              <Badge variant="outline" className="text-xs">
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                            {transaction.type === 'withdrawal' || transaction.type === 'payout' ? '-' : '+'}
                            {transaction.amount} coins
                          </p>
                          {transaction.usdAmount && (
                            <p className="text-white/60 text-sm">
                              ${transaction.usdAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60 text-lg">No transactions yet</p>
                    <p className="text-white/40 text-sm">Your transaction history will appear here</p>
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

export default Wallet;