import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: number;
  preSelectedUserId?: string;
}

export function ChallengeModal({ isOpen, onClose, eventId, preSelectedUserId }: ChallengeModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [challengeType, setChallengeType] = useState('chess');
  const [entryFee, setEntryFee] = useState('100');
  const [selectedUserId, setSelectedUserId] = useState(preSelectedUserId || '');

  // Fetch event participants for opponent selection
  const { data: eventDetails } = useQuery({
    queryKey: ['/api/events', eventId],
    enabled: !!eventId && isOpen,
  });

  const participants = eventDetails?.participants || [];

  // Create challenge mutation
  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: any) => {
      const response = await apiRequest('POST', '/api/challenges', challengeData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge Sent!",
        description: "Your challenge has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
      onClose();
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send challenge. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setChallengeType('chess');
    setEntryFee('100');
    setSelectedUserId(preSelectedUserId || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      toast({
        title: "Error",
        description: "Please select an opponent.",
        variant: "destructive",
      });
      return;
    }

    const entryFeeNumber = parseInt(entryFee);
    if (isNaN(entryFeeNumber) || entryFeeNumber < 0) {
      toast({
        title: "Error",
        description: "Please enter a valid entry fee.",
        variant: "destructive",
      });
      return;
    }

    createChallengeMutation.mutate({
      challengedId: selectedUserId,
      eventId,
      type: challengeType,
      entryFee: entryFeeNumber,
    });
  };

  const challengeTypes = [
    { value: 'chess', label: 'Chess Match' },
    { value: 'poker', label: 'Poker Round' },
    { value: 'quiz', label: 'Quick Quiz' },
    { value: 'custom', label: 'Custom Game' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Challenge</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="challenge-type">Challenge Type</Label>
            <Select value={challengeType} onValueChange={setChallengeType}>
              <SelectTrigger>
                <SelectValue placeholder="Select challenge type" />
              </SelectTrigger>
              <SelectContent>
                {challengeTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="entry-fee">Entry Fee (Coins)</Label>
            <Input
              id="entry-fee"
              type="number"
              min="0"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              placeholder="100"
            />
          </div>
          
          <div>
            <Label>Select Opponent</Label>
            <ScrollArea className="h-32 mt-2 border rounded-md">
              <RadioGroup 
                value={selectedUserId} 
                onValueChange={setSelectedUserId}
                className="p-2"
              >
                {participants.map((participant: any) => (
                  <div
                    key={participant.userId}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                  >
                    <RadioGroupItem value={participant.userId} id={participant.userId} />
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={participant.user?.profileImageUrl} />
                      <AvatarFallback className="text-xs">
                        {participant.user?.firstName?.[0] || participant.user?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Label htmlFor={participant.userId} className="flex-1 cursor-pointer">
                      {participant.user?.firstName || participant.user?.username || 'Unknown User'}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </ScrollArea>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createChallengeMutation.isPending}
            >
              {createChallengeMutation.isPending ? 'Sending...' : 'Send Challenge'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
