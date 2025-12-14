import { useNavigate } from 'react-router-dom';

interface EventMapCardProps {
  image: string;
  title: string;
  date: string;
  venue: string;
  price: string;
  badge?: string;
  badgeColor?: string;
  eventId?: string;
  onClose: () => void;
}

const EventMapCard = ({ 
  image, 
  title, 
  date, 
  venue, 
  price, 
  badge, 
  badgeColor = '#4CAF50',
  eventId,
  onClose 
}: EventMapCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click from propagating to close button
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    if (eventId) {
      navigate(`/event/${eventId}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl overflow-hidden shadow-2xl w-[280px] relative border border-[#EEEEEE] cursor-pointer"
    >
      {/* Event image */}
      <div className="relative w-full h-[160px]">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3L9 9" stroke="#4F4F4F" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Event details */}
      <div className="p-3.5">
        <h3 className="text-base font-semibold text-black mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-sm text-[#757575] mb-1">
          {date} • {venue}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-[#757575]">from</span>
            <span className="text-base font-semibold text-black">{price}</span>
          </div>
          {badge && (
            <span 
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: badgeColor === '#4CAF50' ? '#E8F5E9' : '#FFF3E0',
                color: badgeColor 
              }}
            >
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventMapCard;
