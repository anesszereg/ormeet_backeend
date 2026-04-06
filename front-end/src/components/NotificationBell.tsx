import { useState, useRef, useEffect } from 'react';
import notificationService, { Notification, NotificationType } from '../services/notificationService';
import EventImageFallback from '../assets/imges/event myticket 1.jpg';

const TYPE_LABELS: Record<NotificationType, string> = {
  [NotificationType.EVENT_CANCELLED]: 'Cancelled',
  [NotificationType.EVENT_UPDATED]: 'Updated',
  [NotificationType.EVENT_REMINDER]: 'Reminder',
  [NotificationType.TICKET_PURCHASED]: 'Purchase',
  [NotificationType.ORDER_CONFIRMED]: 'Confirmed',
  [NotificationType.REFUND_PROCESSED]: 'Refund',
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        const data = await notificationService.getNotifications(20);
        setNotifications(data);
        console.log('✅ [NotificationBell] Loaded', data.length, 'notifications');
      } catch (err) {
        console.error('❌ [NotificationBell] Failed to load notifications:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = async () => {
    const willOpen = !isOpen;
    setIsOpen(willOpen);

    if (willOpen && unreadCount > 0) {
      try {
        await notificationService.markAllAsRead();
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
        console.log('✅ [NotificationBell] Marked all as read');
      } catch (err) {
        console.error('❌ [NotificationBell] Failed to mark as read:', err);
      }
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
              notifications.map((notification, index) => {
                const eventImage = notification.event?.images?.[0] || EventImageFallback;
                const eventName = notification.event?.title || notification.title;
                const timestamp = new Date(notification.createdAt);
                
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors cursor-default ${
                      index < notifications.length - 1 ? 'border-b border-[#F5F5F5]' : ''
                    }`}
                  >
                    {/* Event Image */}
                    <img
                      src={eventImage}
                      alt={eventName}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-black truncate">
                          {eventName}
                        </p>
                        <span className="text-[11px] text-[#9CA3AF] whitespace-nowrap shrink-0">
                          {formatTimestamp(timestamp)}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#757575] mt-0.5 line-clamp-2 leading-relaxed">
                        <span className="font-medium text-[#4F4F4F]">{TYPE_LABELS[notification.type]}</span>
                        {' · '}
                        {notification.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
