import React, { useState } from 'react';
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
  Menu,
  X,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

interface MobileNavProps {
  notificationCount?: number;
}

export function MobileNav({ notificationCount = 0 }: MobileNavProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-yellow-400 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">EventChat</span>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
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
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-white hover:bg-white/10"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={toggleMenu}>
          <div 
            className="fixed top-16 right-0 bottom-0 w-80 bg-slate-900 border-l border-white/10 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {isAuthenticated ? (
              <>
                {/* User Profile Section */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-lg">
                  <img
                    src={(user as any)?.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${(user as any)?.id || 'user'}`}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-white/20"
                  />
                  <div>
                    <p className="text-white font-medium">
                      {(user as any)?.firstName || 'Anonymous User'}
                    </p>
                    <p className="text-white/60 text-sm">
                      {(user as any)?.email}
                    </p>
                  </div>
                </div>

                {/* Navigation Items */}
                <nav className="space-y-2 mb-6">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActiveRoute(item.path);
                    
                    return (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          className={`w-full justify-start gap-3 text-left ${
                            active 
                              ? 'bg-white/10 text-white' 
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                          onClick={toggleMenu}
                        >
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>

                {/* Settings and Logout */}
                <div className="border-t border-white/10 pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-white/70 hover:text-white hover:bg-white/5"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => window.location.href = '/api/logout'}
                    className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 mb-4">Join the community to access all features</p>
                </div>
                
                <Button
                  onClick={() => window.location.href = '/api/login'}
                  className="w-full bg-gradient-to-r from-purple-500 to-yellow-400 text-white font-semibold hover:from-purple-600 hover:to-yellow-500"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      {isAuthenticated && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-sm border-t border-white/10">
          <div className="flex items-center justify-around py-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item.path);
              
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                      active 
                        ? 'text-yellow-400' 
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Spacer for mobile content */}
      <div className="lg:hidden h-16" />
      {isAuthenticated && <div className="lg:hidden h-20" />}
    </>
  );
}