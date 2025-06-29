import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Users, 
  Trophy, 
  User, 
  UserPlus, 
  Swords,
  Wallet as WalletIcon,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

interface DesktopNavProps {
  notificationCount?: number;
}

export function DesktopNav({ notificationCount = 0 }: DesktopNavProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const navigationItems = [
    { path: '/', label: 'Events', icon: Home },
    { path: '/wallet', label: 'Wallet', icon: WalletIcon },
    { path: '/challenges', label: 'Challenges', icon: Swords },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/referrals', label: 'Referrals', icon: UserPlus },
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/' && location === '/') return true;
    if (path !== '/' && location.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="hidden lg:flex fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link href="/">
            <div className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-yellow-400 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">EventChat</h1>
                <p className="text-xs text-white/60">Gaming & Challenge Platform</p>
              </div>
            </div>
          </Link>

          {/* Main Navigation */}
          <nav className="flex items-center gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item.path);
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    className={`gap-2 ${
                      active 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-white hover:bg-white/10"
                >
                  <Bell className="w-5 h-5" />
                  {notificationCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center"
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  )}
                </Button>

                {/* User Profile Dropdown */}
                <div className="flex items-center gap-3 px-3 py-2 bg-white/5 rounded-lg">
                  <img
                    src={(user as any)?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(user as any)?.id || 'user'}`}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                  />
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">
                      {(user as any)?.firstName || 'Anonymous User'}
                    </p>
                    <p className="text-white/60 text-xs">
                      {(user as any)?.email}
                    </p>
                  </div>
                </div>

                {/* Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/70 hover:text-white hover:bg-white/5"
                >
                  <Settings className="w-5 h-5" />
                </Button>

                {/* Logout */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right mr-3">
                  <p className="text-white/60 text-sm">Join the community</p>
                  <p className="text-white text-xs">Access all gaming features</p>
                </div>
                
                <Button
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-gradient-to-r from-purple-500 to-yellow-400 text-white font-semibold hover:from-purple-600 hover:to-yellow-500"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}