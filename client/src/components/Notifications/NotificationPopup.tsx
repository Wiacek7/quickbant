import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NotificationPopupProps {
  notification?: {
    id: string;
    type: 'success' | 'error' | 'info' | 'achievement';
    title: string;
    message: string;
    duration?: number;
  };
  onClose: () => void;
}

export function NotificationPopup({ notification, onClose }: NotificationPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, notification.duration || 4000);

      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'achievement':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'achievement':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 ${getBackgroundColor()} text-white p-4 rounded-lg shadow-lg transform transition-transform duration-300 z-50 max-w-sm ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className="font-medium">{notification.title}</p>
          <p className="text-sm opacity-90">{notification.message}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white/80 hover:text-white hover:bg-white/10 h-6 w-6"
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
