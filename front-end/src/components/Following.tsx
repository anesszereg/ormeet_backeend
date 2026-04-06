import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import userPreferencesService, { Organization } from '../services/userPreferencesService';
import OrganizerLogo from '../assets/imges/logoFollowing/images (1).png';

const Following = () => {
  const navigate = useNavigate();
  const [following, setFollowing] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      setIsLoading(true);
      try {
        const data = await userPreferencesService.getFollowingOrganizers();
        console.log('✅ [Following] Loaded', data.length, 'followed organizers');
        setFollowing(data);
      } catch (err: any) {
        console.error('❌ [Following] Failed to load following:', err);
        setError(err.response?.data?.message || 'Failed to load followed organizers');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFollowing();
  }, []);

  const handleUnfollow = async (organizerId: string) => {
    try {
      await userPreferencesService.unfollowOrganizer(organizerId);
      setFollowing(following.filter(o => o.id !== organizerId));
      console.log('✅ [Following] Unfollowed organizer');
    } catch (err) {
      console.error('❌ [Following] Failed to unfollow:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-bold text-black mb-6">Organisers you follow</h1>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF4000]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <h1 className="text-2xl font-bold text-black mb-6">Organisers you follow</h1>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-black mb-6">Organisers you follow</h1>

      {following.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-32 h-32 bg-gradient-to-br from-[#FF4000]/10 to-[#FF4000]/5 rounded-full flex items-center justify-center mb-6">
            <svg className="w-16 h-16 text-[#FF4000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-black mb-3">Not Following Anyone Yet</h2>
          <p className="text-base text-[#4F4F4F] text-center max-w-md mb-6">
            Start following organizers to stay updated with their latest events!
          </p>
          <button
            onClick={() => navigate('/browse-events')}
            className="px-6 py-3 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors"
          >
            Browse Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {following.map((org) => (
            <div key={org.id} className="bg-white rounded-2xl shadow-sm border border-[#EEEEEE] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <img
                  src={org.logo || OrganizerLogo}
                  alt={org.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#EEEEEE]"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-black mb-1 truncate">{org.name}</h3>
                  <p className="text-sm text-[#4F4F4F] line-clamp-2">{org.description || 'Event organizer'}</p>
                </div>
              </div>

              {org.website && (
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#FF4000] hover:underline mb-4 block"
                >
                  Visit Website →
                </a>
              )}

              <button
                onClick={() => handleUnfollow(org.id)}
                className="w-full py-2.5 border-2 border-[#FF4000] text-[#FF4000] font-semibold rounded-full hover:bg-[#FFF4F3] transition-colors"
              >
                Unfollow
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Following;
