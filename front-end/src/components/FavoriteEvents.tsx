import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userPreferencesService from '../services/userPreferencesService';
import { Event } from '../services/eventService';
import EventImageFallback from '../assets/imges/event myticket 1.jpg';

const FavoriteEvents = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      setIsLoading(true);
      try {
        const data = await userPreferencesService.getFavoriteEvents();
        console.log('✅ [FavoriteEvents] Loaded', data.length, 'favorite events');
        setFavorites(data);
      } catch (err: any) {
        console.error('❌ [FavoriteEvents] Failed to load favorites:', err);
        setError(err.response?.data?.message || 'Failed to load favorite events');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (eventId: string) => {
    try {
      await userPreferencesService.removeFavoriteEvent(eventId);
      setFavorites(favorites.filter(e => e.id !== eventId));
      console.log('✅ [FavoriteEvents] Removed event from favorites');
    } catch (err) {
      console.error('❌ [FavoriteEvents] Failed to remove favorite:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-bold text-black mb-6">Favourite Events</h1>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF4000]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-bold text-black mb-6">Favourite Events</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-black mb-6">Favourite Events</h1>

      {favorites.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-32 h-32 bg-gradient-to-br from-[#FF4000]/10 to-[#FF4000]/5 rounded-full flex items-center justify-center mb-6">
            <svg className="w-16 h-16 text-[#FF4000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-3">No Favorite Events Yet</h2>
          <p className="text-base text-[#4F4F4F] text-center max-w-md mb-6">
            Start adding events to your favorites to see them here!
          </p>
          <button
            onClick={() => navigate('/browse-events')}
            className="px-6 py-3 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors"
          >
            Browse Events
          </button>
        </div>
      ) : (
        /* Events Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((event) => {
            const eventDate = new Date(event.startAt);
            const imageUrl = event.images?.[0] || EventImageFallback;
            const lowestPrice = event.ticketTypes?.reduce((min, tt) => Math.min(min, Number(tt.price)), Infinity) ?? 0;
            const priceDisplay = lowestPrice === Infinity || lowestPrice === 0 ? 'Free' : `$${lowestPrice.toFixed(2)}`;

            return (
              <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] overflow-hidden hover:shadow-md transition-shadow">
                {/* Event Image */}
                <div className="relative h-48 bg-gray-200">
                  <img src={imageUrl} alt={event.title} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveFavorite(event.id)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    aria-label="Remove from favorites"
                  >
                    <svg className="w-6 h-6 text-[#FF4000]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>

                {/* Event Details */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">{event.title}</h3>
                  <p className="text-sm text-[#4F4F4F] mb-3 line-clamp-2">{event.shortDescription}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-[#4F4F4F]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <span className="text-lg font-bold text-[#FF4000]">{priceDisplay}</span>
                  </div>

                  <button
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="w-full py-2.5 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoriteEvents;
