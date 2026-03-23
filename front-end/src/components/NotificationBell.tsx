import { useState, useRef, useEffect } from 'react';
import EventImg1 from '../assets/imges/event myticket 1.jpg';
import EventImg2 from '../assets/imges/event myticket 2.jpg';
import EventImg3 from '../assets/imges/event myticket 3.jpg';
import EventImg5 from '../assets/imges/event myticket 5.jpg';
import EventImg6 from '../assets/imges/event myticket 6.jpg';

interface Notification {
  id: string;
  type: 'event_cancelled' | 'event_updated' | 'event_reminder';
  eventName: string;
  message: string;
  eventImage: string;
  timestamp: Date;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'event_reminder',
    eventName: 'Tech Conference 2026',
    message: 'Starts tomorrow at 10:00 AM — don\'t forget to check in!',
    eventImage: EventImg1,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
  },
  {
    id: '2',
    type: 'event_updated',
    eventName: 'Music Festival',
    message: 'Venue changed to Grand Arena, Downtown.',
    eventImage: EventImg2,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  },
  {
    id: '3',
    type: 'event_cancelled',
    eventName: 'Startup Pitch Night',
    message: 'This event has been cancelled. A refund will be processed.',
    eventImage: EventImg3,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: false,
  },
  {
    id: '4',
    type: 'event_reminder',
    eventName: 'Design Workshop',
    message: 'Your event is in 3 days. Get ready!',
    eventImage: EventImg5,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
  {
    id: '5',
    type: 'event_updated',
    eventName: 'AI Summit 2026',
    message: 'The schedule has been updated. Check the new timetable.',
    eventImage: EventImg6,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48),
    read: true,
  },
];

const TYPE_LABELS: Record<Notification['type'], string> = {
  event_cancelled: 'Cancelled',
  event_updated: 'Updated',
  event_reminder: 'Reminder',
};

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    MOCK_NOTIFICATIONS.slice(0, 10).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  );
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    if (willOpen && unreadCount > 0) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-all cursor-pointer"
        aria-label="Notifications"
      >
        <svg className="w-[21px] h-[21px] text-[#4F4F4F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-[#FF4000] text-white text-[10px] font-bold rounded-full leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[370px] bg-white rounded-xl z-50 overflow-hidden border border-[#EEEEEE]"
          style={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.10)' }}
        >
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-[#EEEEEE]">
            <h3 className="text-sm font-semibold text-black">Notifications</h3>
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-[#BCBCBC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </div>
                <p className="text-sm text-[#9CA3AF]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors cursor-default ${
                    index < notifications.length - 1 ? 'border-b border-[#F5F5F5]' : ''
                  }`}
                >
                  {/* Event Image */}
                  <img
                    src={notification.eventImage}
                    alt={notification.eventName}
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-semibold text-black truncate">
                        {notification.eventName}
                      </p>
                      <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap shrink-0">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#757575] mt-0.5 line-clamp-2 leading-relaxed">
                      <span className="font-medium text-[#4F4F4F]">{TYPE_LABELS[notification.type]}</span>
                      {' · '}
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
