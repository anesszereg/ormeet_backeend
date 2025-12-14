import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  image: string;
  title: string;
  date: string;
  venue: string;
  price: string;
  badge?: string;
  badgeColor?: string;
  eventId?: string;
}

const EventCard = ({ image, title, date, venue, price, badge, badgeColor = '#4CAF50', eventId }: EventCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer w-full border border-[#EEEEEE]"
    >
      {/* Event image */}
      <div className="relative w-full h-48 md:h-56">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Event details */}
      <div className="p-3 md:p-4">
        <h3 className="text-lg md:text-base font-semibold text-black mb-2 line-clamp-2 leading-tight">
          {title}
        </h3>
        <p className="text-base md:text-sm text-[#757575] mb-2">
          {date} • {venue}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-sm md:text-xs text-[#757575]">from</span>
            <span className="text-lg md:text-base font-semibold text-black">{price}</span>
          </div>
          {badge && (
            <span 
              className="text-sm md:text-xs font-medium px-3 py-1.5 md:py-1 rounded-full"
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

export default EventCard;
