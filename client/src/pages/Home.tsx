import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from '@/components/Layout/Sidebar';
import { TopHeader } from '@/components/Layout/TopHeader';
import { RightPanel } from '@/components/Layout/RightPanel';
import { ChatArea } from '@/components/Chat/ChatArea';
import { ChallengeModal } from '@/components/Modals/ChallengeModal';
import { NotificationPopup } from '@/components/Notifications/NotificationPopup';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Gamepad2, Trophy, Bell } from 'lucide-react';

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [selectedEventId, setSelectedEventId] = useState<number>();
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [challengeUserId, setChallengeUserId] = useState<string>();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notification, setNotification] = useState<any>(null);

  // Form state for creating events
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    type: 'poker',
    maxParticipants: 20,
    entryFee: 0,
  });

  // Fetch current event details
  const { data: currentEvent } = useQuery({
    queryKey: ['/api/events', selectedEventId],
    enabled: !!selectedEventId,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest('POST', '/api/events', eventData);
      return response.json();
    },
    onSuccess: (newEvent) => {
      toast({
        title: "Event Created!",
        description: `${newEvent.name} has been created successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setSelectedEventId(newEvent.id);
      setIsCreateEventModalOpen(false);
      resetEventForm();
      
      // Show notification popup
      setNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Event Created!',
        message: `${newEvent.name} is now live and ready for players.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetEventForm = () => {
    setEventForm({
      name: '',
      description: '',
      type: 'poker',
      maxParticipants: 20,
      entryFee: 0,
    });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventForm.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter an event name.",
        variant: "destructive",
      });
      return;
    }

    createEventMutation.mutate(eventForm);
  };

  const handleChallengeUser = (userId: string) => {
    setChallengeUserId(userId);
    setIsChallengeModalOpen(true);
  };

  const eventTypes = [
    { value: 'poker', label: 'Poker Game' },
    { value: 'chess', label: 'Chess Match' },
    { value: 'tournament', label: 'Tournament' },
    { value: 'quiz', label: 'Quiz Game' },
    { value: 'custom', label: 'Custom Event' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        selectedEventId={selectedEventId}
        onEventSelect={setSelectedEventId}
        onCreateEvent={() => setIsCreateEventModalOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <TopHeader
          currentEvent={currentEvent}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onCreateChallenge={() => setIsChallengeModalOpen(true)}
        />
        
        <ChatArea
          eventId={selectedEventId}
          onCreateChallenge={() => setIsChallengeModalOpen(true)}
        />
      </div>

      {/* Right Panel */}
      <RightPanel
        eventId={selectedEventId}
        onChallengeUser={handleChallengeUser}
      />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t p-2 z-40">
        <div className="flex items-center justify-around">
          <Button variant="ghost" className="flex flex-col items-center gap-1 p-2 text-primary">
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">Chat</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 p-2">
            <Gamepad2 className="h-5 w-5" />
            <span className="text-xs">Games</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 p-2">
            <Trophy className="h-5 w-5" />
            <span className="text-xs">Leaderboard</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 p-2 relative">
            <Bell className="h-5 w-5" />
            <span className="text-xs">Alerts</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </div>
          </Button>
        </div>
      </div>

      {/* Challenge Modal */}
      <ChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => {
          setIsChallengeModalOpen(false);
          setChallengeUserId(undefined);
        }}
        eventId={selectedEventId}
        preSelectedUserId={challengeUserId}
      />

      {/* Create Event Modal */}
      <Dialog open={isCreateEventModalOpen} onOpenChange={setIsCreateEventModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                value={eventForm.name}
                onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Friday Night Poker"
                required
              />
            </div>

            <div>
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Join us for an exciting poker tournament..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="event-type">Event Type</Label>
              <Select 
                value={eventForm.type} 
                onValueChange={(value) => setEventForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max-participants">Max Players</Label>
                <Input
                  id="max-participants"
                  type="number"
                  min="2"
                  max="100"
                  value={eventForm.maxParticipants}
                  onChange={(e) => setEventForm(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 20 }))}
                />
              </div>
              <div>
                <Label htmlFor="entry-fee">Entry Fee (Coins)</Label>
                <Input
                  id="entry-fee"
                  type="number"
                  min="0"
                  value={eventForm.entryFee}
                  onChange={(e) => setEventForm(prev => ({ ...prev, entryFee: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsCreateEventModalOpen(false);
                  resetEventForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Notification Popup */}
      <NotificationPopup
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
