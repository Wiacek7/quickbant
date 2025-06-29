import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Shield, Clock, Key } from 'lucide-react';
import { Link } from 'wouter';

const AuthTest = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Authentication Test</h1>
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Back to Events
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Authentication Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">Authentication Status</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Status:</span>
                <Badge variant={isAuthenticated ? "default" : "destructive"}>
                  {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/70">Loading:</span>
                <Badge variant={isLoading ? "secondary" : "outline"}>
                  {isLoading ? "Loading..." : "Ready"}
                </Badge>
              </div>

              <div className="pt-4">
                {!isAuthenticated ? (
                  <div className="space-y-4">
                    <p className="text-white/70 text-sm">
                      You are not currently authenticated. Sign in to access user features.
                    </p>
                    <Button
                      onClick={() => window.location.href = '/api/login'}
                      className="w-full bg-gradient-to-r from-purple-500 to-yellow-400 text-white font-semibold hover:from-purple-600 hover:to-yellow-500"
                    >
                      Sign In with Replit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-white/70 text-sm">
                      You are successfully authenticated and can access all features.
                    </p>
                    <Button
                      onClick={() => window.location.href = '/api/logout'}
                      variant="outline"
                      className="w-full border-white/20 text-white hover:bg-white/10"
                    >
                      Sign Out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-white" />
              <h2 className="text-xl font-semibold text-white">User Information</h2>
            </div>

            {!isAuthenticated ? (
              <div className="text-center py-8">
                <User className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">No user data available</p>
                <p className="text-white/40 text-sm">Please sign in to view your profile</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={(user as any)?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(user as any)?.id || 'user'}`}
                    alt="Profile"
                    className="w-16 h-16 rounded-full border-2 border-white/20"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {(user as any)?.firstName || (user as any)?.email || 'Anonymous User'}
                    </h3>
                    <p className="text-white/60 text-sm">User ID: {(user as any)?.id}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-white/60" />
                    <span className="text-white/70 text-sm">ID:</span>
                    <span className="text-white font-mono text-sm">{(user as any)?.id}</span>
                  </div>

                  {(user as any)?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-white/60" />
                      <span className="text-white/70 text-sm">Email:</span>
                      <span className="text-white text-sm">{(user as any)?.email}</span>
                    </div>
                  )}

                  {(user as any)?.firstName && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-white/60" />
                      <span className="text-white/70 text-sm">Name:</span>
                      <span className="text-white text-sm">{(user as any)?.firstName}</span>
                    </div>
                  )}

                  {(user as any)?.lastName && (
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-white/60" />
                      <span className="text-white/70 text-sm">Last Name:</span>
                      <span className="text-white text-sm">{(user as any)?.lastName}</span>
                    </div>
                  )}

                  {(user as any)?.createdAt && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-white/60" />
                      <span className="text-white/70 text-sm">Member Since:</span>
                      <span className="text-white text-sm">
                        {new Date((user as any).createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/20">
                  <h4 className="text-white font-medium mb-2">Raw User Data:</h4>
                  <pre className="bg-black/30 rounded-lg p-3 text-xs text-white/80 overflow-auto max-h-40">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* API Test Section */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">API Endpoints Test</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => {
                fetch('/api/auth/user')
                  .then(res => res.json())
                  .then(data => console.log('User API:', data))
                  .catch(err => console.error('User API Error:', err));
              }}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Test /api/auth/user
            </Button>
            
            <Button
              onClick={() => {
                fetch('/api/events')
                  .then(res => res.json())
                  .then(data => console.log('Events API:', data))
                  .catch(err => console.error('Events API Error:', err));
              }}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Test /api/events
            </Button>
            
            <Button
              onClick={() => {
                if (isAuthenticated) {
                  fetch('/api/events/my')
                    .then(res => res.json())
                    .then(data => console.log('My Events API:', data))
                    .catch(err => console.error('My Events API Error:', err));
                } else {
                  alert('Please sign in first');
                }
              }}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Test /api/events/my
            </Button>
          </div>
          
          <p className="text-white/60 text-sm mt-4">
            Check the browser console (F12) to see API responses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthTest;