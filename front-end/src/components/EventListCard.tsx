import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface EventListCardProps {
  image: string;
  title: string;
  date: string;
  venue: string;
  price: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  eventId?: string;
  isPast?: boolean;
  availableSpots?: number;
}

const EventListCard = ({ 
  image, 
  title, 
  date, 
  venue, 
  price, 
  badge, 
  badgeColor = '#4CAF50',
  description,
  eventId,
  isPast = false,
  availableSpots,
}: EventListCardProps) => {
  const { t } = useTranslation('attendee');
  const content = (
    <div
      className={`bg-white rounded-2xl overflow-hidden transition-all flex w-full border border-[#EEEEEE] ${isPast ? 'opacity-60 grayscale' : 'hover:shadow-lg hover:scale-[1.01]'}`}
    >
      {/* Event image - Left side */}
      <div className="relative w-32 sm:w-40 md:w-[200px] lg:w-[240px] xl:w-[280px] 2xl:w-[320px] h-24 sm:h-32 md:h-[160px] lg:h-[180px] shrink-0">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>

      {/* Event details - Right side */}
      <div className="flex-1 p-4 xl:p-5 2xl:p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-base font-semibold text-black mb-2 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-[#757575] mb-2">
            <bdi>{date}</bdi> • {venue}
          </p>
          {description && (
            <p className="text-sm text-[#757575] line-clamp-2">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xs text-[#757575]">{t('eventListCard.fromPrice')}</span>
            <span className="text-base font-semibold text-black"><bdi>{price === 'Free' ? t('searchResult.freePrice') : price}</bdi></span>
          </div>
          {isPast ? (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-500">
              {t('eventListCard.pastEvent', 'Past')}
            </span>
          ) : availableSpots !== undefined && availableSpots <= 10 && availableSpots > 0 ? (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-orange-50 text-orange-500">
              {availableSpots} {t('eventListCard.spotsLeft', 'left')}
            </span>
          ) : availableSpots === 0 ? (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-red-50 text-red-500">
              {t('eventListCard.soldOut', 'Sold out')}
            </span>
          ) : badge ? (
            <span 
              className="text-xs font-medium px-3 py-1 rounded-full"
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

  return eventId ? (
    <Link to={`/event/${eventId}`} className="block w-full cursor-pointer">
      {content}
    </Link>
  ) : content;
};

export default EventListCard;
