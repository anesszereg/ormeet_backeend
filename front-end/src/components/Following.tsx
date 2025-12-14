import { useState, useRef, useEffect } from 'react';
import SearchIcon from '../assets/Svgs/recherche.svg';
import NewestIcon from '../assets/Svgs/newest.svg';
import FollowingIcon from '../assets/Svgs/following.svg';

// Import organizer logos
import Logo1 from '../assets/imges/logoFollowing/21162d651a00893986cd56b7be86b29b_fgraphic.png';
import Logo2 from '../assets/imges/logoFollowing/LOGO MUST_page-0001.jpg';
import Logo3 from '../assets/imges/logoFollowing/New-Project-e1693907021911.webp';
import Logo4 from '../assets/imges/logoFollowing/T29494_00.webp';
import Logo5 from '../assets/imges/logoFollowing/TA.webp';
import Logo6 from '../assets/imges/logoFollowing/images (1).jpg';
import Logo7 from '../assets/imges/logoFollowing/images (1).png';
import Logo8 from '../assets/imges/logoFollowing/images (2).png';
import Logo9 from '../assets/imges/logoFollowing/images (3).png';
import Logo10 from '../assets/imges/logoFollowing/images.jpg';
import Logo11 from '../assets/imges/logoFollowing/images.png';
import Logo12 from '../assets/imges/logoFollowing/logo-new@2x.png';

interface Organizer {
  id: string;
  name: string;
  followers: string;
  logo: string;
  isFollowing: boolean;
}

const Following = () => {
  const [sortOption, setSortOption] = useState('Newest First');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [unfollowConfirmId, setUnfollowConfirmId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [organizers, setOrganizers] = useState<Organizer[]>([
    { id: '1', name: 'StellarSync Events', followers: '15K', logo: Logo1, isFollowing: true },
    { id: '2', name: 'The Social Curve', followers: '13K', logo: Logo2, isFollowing: true },
    { id: '3', name: 'Pulsewave Entertainment', followers: '18K', logo: Logo3, isFollowing: true },
    { id: '4', name: 'VibeNest Events', followers: '12K', logo: Logo4, isFollowing: true },
    { id: '5', name: 'Eventura', followers: '16K', logo: Logo5, isFollowing: true },
    { id: '6', name: 'GlowMint Productions', followers: '14K', logo: Logo6, isFollowing: true },
    { id: '7', name: 'Epicline Events', followers: '19K', logo: Logo7, isFollowing: true },
    { id: '8', name: 'Rhythm & Roots', followers: '11K', logo: Logo8, isFollowing: true },
    { id: '9', name: 'Urban Pulse Collective', followers: '17K', logo: Logo9, isFollowing: true },
    { id: '10', name: 'Horizon Events Co.', followers: '20K', logo: Logo10, isFollowing: true },
    { id: '11', name: 'Nexus Entertainment', followers: '22K', logo: Logo11, isFollowing: true },
    { id: '12', name: 'Velocity Productions', followers: '25K', logo: Logo12, isFollowing: true },
  ]);

  const handleUnfollowClick = (id: string) => {
    setUnfollowConfirmId(id);
    setOpenMenuId(null);
  };

  const confirmUnfollow = () => {
    if (unfollowConfirmId) {
      setOrganizers(organizers.map(org => 
        org.id === unfollowConfirmId ? { ...org, isFollowing: false } : org
      ));
      setUnfollowConfirmId(null);
    }
  };

  const cancelUnfollow = () => {
    setUnfollowConfirmId(null);
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const sortOptions = ['Newest First', 'Oldest First', 'A-Z'];

  // Filter organizers based on search and following status
  const filteredOrganizers = organizers.filter(org => 
    org.isFollowing && org.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const followingCount = organizers.filter(org => org.isFollowing).length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black mb-2">Organisers you follow</h1>
      </div>

      {/* Count and Controls Bar */}
      <div className="flex items-center justify-between mb-6">
        {/* Organizers count */}
        <div className="text-base font-semibold text-black">
          {followingCount} Organiser{followingCount !== 1 ? 's' : ''}
        </div>

        {/* Search and Sort Controls */}
        <div className="flex items-center gap-4">
          {/* Search bar with icon */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Organisers"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-10 bg-white border border-[#EEEEEE] text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
              style={{ borderRadius: '85.41px', width: '187px', height: '38px' }}
            />
            {/* Search icon positioned on the right */}
            <img 
              src={SearchIcon} 
              alt="Search" 
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none" 
            />
          </div>

          {/* Sort dropdown with newest icon - Fixed width 187px */}
          <div className="relative">
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 pl-11 pr-3 border border-[#EEEEEE] bg-white cursor-pointer hover:border-[#FF4000] transition-colors"
              style={{ borderRadius: '85.41px', width: '187px', height: '38px' }}
            >
              {/* Newest icon on the left */}
              <img src={NewestIcon} alt="Sort" className="absolute left-1 top-1/2 -translate-y-1/2 w-[30px] h-[30px]" />
              <span className="text-sm font-medium text-[#4F4F4F] truncate flex-1">{sortOption}</span>
              {/* Dropdown arrow */}
              <svg className="w-4 h-4 text-[#4F4F4F] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-[#EEEEEE] py-1 z-10">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortOption(option);
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                      sortOption === option
                        ? 'bg-[#FFF4F3] text-[#FF4000] font-medium'
                        : 'text-[#4F4F4F] hover:bg-[#F8F8F8]'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Organizers List */}
      {filteredOrganizers.length > 0 ? (
        <div className="space-y-4">
          {filteredOrganizers.map((organizer) => (
            <div
              key={organizer.id}
              className="flex items-center justify-between p-4 bg-white border border-[#EEEEEE] rounded-lg hover:border-[#FF4000] transition-colors"
            >
              {/* Left section: Logo + Info */}
              <div className="flex items-center gap-4">
                {/* Organizer Logo */}
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-gray-100">
                  <img 
                    src={organizer.logo} 
                    alt={organizer.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Organizer Info */}
                <div>
                  <h3 className="text-base font-semibold text-black mb-1">
                    {organizer.name}
                  </h3>
                  <p className="text-sm text-[#4F4F4F]">
                    {organizer.followers} Followers
                  </p>
                </div>
              </div>

              {/* Right section: Following button with menu */}
              <div className="relative" ref={openMenuId === organizer.id ? menuRef : null}>
                <button
                  onClick={() => toggleMenu(organizer.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#EEEEEE] rounded-full hover:border-[#FF4000] hover:bg-[#FFF4F3] transition-colors"
                >
                  {/* Following icon */}
                  <img src={FollowingIcon} alt="Following" className="w-5 h-5" />
                  <span className="text-sm font-medium text-black">Following</span>
                </button>

                {/* Unfollow context menu */}
                {openMenuId === organizer.id && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-[#EEEEEE] py-1 z-50">
                    <button
                      onClick={() => handleUnfollowClick(organizer.id)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#FF4000] hover:bg-[#FFF4F3] transition-colors"
                    >
                      {/* Unfollow icon (user minus) */}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                      </svg>
                      <span>Unfollow</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty state
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-[#F8F8F8] flex items-center justify-center">
            <svg className="w-12 h-12 text-[#BCBCBC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-black mb-2">
            No organisers found
          </h3>
          <p className="text-sm text-[#4F4F4F] max-w-md">
            {searchQuery 
              ? "Try adjusting your search to find organisers you're following."
              : "You're not following any organisers yet. Start exploring events to find organisers to follow!"}
          </p>
        </div>
      )}

      {/* Unfollow Confirmation Modal */}
      {unfollowConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-xl font-bold text-black mb-3">Unfollow Organiser?</h3>
            <p className="text-sm text-[#4F4F4F] mb-6">
              Are you sure you want to unfollow {organizers.find(org => org.id === unfollowConfirmId)?.name}? You won't receive updates about their events anymore.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelUnfollow}
                className="flex-1 px-4 py-3 border border-[#EEEEEE] text-black rounded-lg text-sm font-medium hover:bg-[#F8F8F8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnfollow}
                className="flex-1 px-4 py-3 bg-[#FF4000] text-white rounded-lg text-sm font-medium hover:bg-[#E63900] transition-colors"
              >
                Unfollow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Following;
