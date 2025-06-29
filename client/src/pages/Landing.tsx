import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Gamepad2, Trophy, Zap, Users, Shield } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              E
            </div>
            <span className="text-xl font-bold">EventChat</span>
          </div>
          <Button onClick={() => window.location.href = '/api/login'}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Real-time Gaming & Challenge Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the ultimate gaming community with lightning-fast chat, competitive challenges, 
            and real-time betting. Experience Discord-speed messaging with gamified social features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8"
              onClick={() => window.location.href = '/api/login'}
            >
              Start Playing Now
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for Competitive Gaming
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built for gamers who demand speed, competition, and seamless social interaction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Lightning-Fast Chat</CardTitle>
              <CardDescription>
                Discord-speed messaging with real-time delivery, typing indicators, and instant notifications.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-purple-500/20 hover:border-purple-500/40 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center mb-4">
                <Gamepad2 className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle>Challenge System</CardTitle>
              <CardDescription>
                Create and accept challenges with real-time notifications and automatic coin distribution.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-green-500/20 hover:border-green-500/40 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center mb-4">
                <Trophy className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle>Competitive Events</CardTitle>
              <CardDescription>
                Join tournaments, track leaderboards, and earn achievements in various gaming events.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-yellow-500" />
              </div>
              <CardTitle>Event-Based Rooms</CardTitle>
              <CardDescription>
                Dedicated chat rooms for each event with participant management and real-time updates.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-blue-500/20 hover:border-blue-500/40 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>Social Features</CardTitle>
              <CardDescription>
                Points system, badges, referral rewards, and global leaderboards to enhance competition.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-red-500/20 hover:border-red-500/40 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-red-500" />
              </div>
              <CardTitle>Secure Payments</CardTitle>
              <CardDescription>
                Integrated Paystack payments for coin purchases with secure transaction processing.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join the Competition?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start playing, chatting, and competing with gamers from around the world.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 text-primary hover:text-primary"
            onClick={() => window.location.href = '/api/login'}
          >
            Join EventChat Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-purple-600 rounded flex items-center justify-center text-white text-sm font-bold">
                E
              </div>
              <span className="font-semibold">EventChat</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 EventChat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
