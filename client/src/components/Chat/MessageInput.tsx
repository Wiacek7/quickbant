import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Smile, Send, Sword, Coins, Gift } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  onCreateChallenge: () => void;
  disabled?: boolean;
  isConnected?: boolean;
}

export function MessageInput({ 
  onSendMessage, 
  onStartTyping, 
  onStopTyping, 
  onCreateChallenge,
  disabled,
  isConnected = true
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      handleStopTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      onStartTyping();
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 1000);
  };

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false);
      onStopTyping();
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t p-4">
      {!isConnected && (
        <div className="mb-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
          Real-time chat disconnected. Messages will still be sent.
        </div>
      )}
      <div className="flex items-center gap-3">
        {/* File Upload */}
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Paperclip className="h-4 w-4" />
        </Button>
        
        {/* Message Input */}
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={disabled}
            className="pr-12 bg-muted/50"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </div>

        {/* Send Button */}
        <Button 
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="h-10 w-10 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 mt-3">
        <Button
          variant="ghost"
          size="sm"
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/20"
          onClick={onCreateChallenge}
        >
          <Sword className="h-4 w-4 mr-1" />
          Challenge
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
        >
          <Coins className="h-4 w-4 mr-1" />
          Bet
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20"
        >
          <Gift className="h-4 w-4 mr-1" />
          Gift Points
        </Button>
      </div>
    </div>
  );
}
