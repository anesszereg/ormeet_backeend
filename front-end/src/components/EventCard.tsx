import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface EventCardProps {
  image: string;
  title: string;
  date: string;
  venue: string;
  price: string;
  badge?: string;
  badgeColor?: string;
  eventId?: string;
  isPast?: boolean;
  availableSpots?: number;
}

const EventCard = ({ image, title, date, venue, price, badge, badgeColor = '#4CAF50', eventId, isPast = false, availableSpots }: EventCardProps) => {
  const { t } = useTranslation('attendee');
  const navigate = useNavigate();

  const handleClick = () => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`bg-white rounded-2xl overflow-hidden transition-all w-full border border-[#EEEEEE] cursor-pointer ${isPast ? 'opacity-60 grayscale' : 'hover:shadow-lg hover:scale-[1.02]'}`}
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
          <bdi>{date}</bdi> • {venue}
        </p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-1">
            <span className="text-sm md:text-xs text-[#757575]">{t('eventCard.fromPrice')}</span>
            <span className="text-lg md:text-base font-semibold text-black"><bdi>{price === 'Free' ? t('searchResult.freePrice') : price}</bdi></span>
          </div>
          {isPast ? (
            <span className="text-sm md:text-xs font-medium px-3 py-1.5 md:py-1 rounded-full bg-gray-100 text-gray-500">
              {t('eventCard.pastEvent', 'Past')}
            </span>
          ) : availableSpots !== undefined && availableSpots <= 10 && availableSpots > 0 ? (
            <span className="text-sm md:text-xs font-medium px-3 py-1.5 md:py-1 rounded-full bg-orange-50 text-orange-500">
              {availableSpots} {t('eventCard.spotsLeft', 'left')}
            </span>
          ) : availableSpots === 0 ? (
            <span className="text-sm md:text-xs font-medium px-3 py-1.5 md:py-1 rounded-full bg-red-50 text-red-500">
              {t('eventCard.soldOut', 'Sold out')}
            </span>
          ) : badge ? (
            <span 
              className="text-sm md:text-xs font-medium px-3 py-1.5 md:py-1 rounded-full"
              style={{ 
                backgroundColor: badgeColor === '#4CAF50' ? '#E8F5E9' : '#FFF3E0',
                color: badgeColor 
              }}
            >
              {badge}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
