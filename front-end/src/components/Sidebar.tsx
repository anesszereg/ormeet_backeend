import { useState } from 'react';
import MyTicketIcon from '../assets/Svgs/sidbar/Myticket.svg';
import FavouriteIcon from '../assets/Svgs/sidbar/favourite.svg';
import FollowingIcon from '../assets/Svgs/sidbar/following.svg';
import SettingsIcon from '../assets/Svgs/sidbar/settings.svg';
import RechercheIcon from '../assets/Svgs/sidbar/recherche.svg';
import { BsFillArrowLeftCircleFill } from "react-icons/bs";
import { BsFillArrowRightCircleFill } from "react-icons/bs";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

const Sidebar = ({ activeTab = 'my-tickets', onTabChange, onCollapseChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  const menuItems = [
    { id: 'my-tickets', label: 'My tickets', icon: MyTicketIcon },
    { id: 'favorite-events', label: 'Favorite events', icon: FavouriteIcon },
    { id: 'following', label: 'Following', icon: FollowingIcon },
    { id: 'account-settings', label: 'Account settings', icon: SettingsIcon },
  ];

  return (
    // Sidebar container: Fixed width when expanded (240px), collapsed width (80px)
    // Background: light gray (#F8F8F8), minimum height to maintain consistent size
    // Smooth transition for width changes
    <aside
      className={`${isCollapsed ? 'w-20' : 'w-60'
        } min-h-full bg-[#F8F8F8] flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Header section: "Your Dashboard" title + toggle button */}
      {/* Height: 64px to match navbar, padding for alignment and border spacing */}
      <div className="h-16 pl-6 flex items-center justify-between border-b border-[#EEEEEE] ">
        {/* Container for perfect vertical alignment */}
        <div className="flex items-center justify-between w-full">
          {/* Title: only visible when sidebar is expanded */}
          {!isCollapsed && (
            <h2 className="text-base font-semibold text-black">Your Dashboard</h2>
          )}

          {/* Toggle button: switches between collapse/expand states */}
          {/* Button: circular with hover effect */}
          <button
            onClick={handleToggleCollapse}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#EEEEEE] transition-all cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              // Circle arrow pointing right (expand)
              <BsFillArrowRightCircleFill size={24} />
            ) : (
              // Circle arrow pointing left (collapse)
              <BsFillArrowLeftCircleFill size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Search bar section */}
      {/* Padding: 16px vertical, 12px horizontal for comfortable spacing */}
      <div className="px-3 py-4">
        {isCollapsed ? (
          /* Search icon button when collapsed - clicking expands sidebar */
          <button
            onClick={handleToggleCollapse}
            className="w-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img src={RechercheIcon} alt="Search" className="w-8 h-8" />
          </button>
        ) : (
          /* Search input when expanded */
          <div className="relative">
            {/* Search icon: positioned at left side of input, 32x32px */}
            <div className="absolute left-1 top-1/2 -translate-y-1/2 pointer-events-none">
              <img src={RechercheIcon} alt="Search" className="w-8 h-8" />
            </div>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#EEEEEE] text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
              style={{ borderRadius: '85.41px' }}
            />
          </div>
        )}
      </div>

      {/* Navigation menu items */}
      {/* Padding top: 8px for spacing from search bar */}
      <nav className="flex-1 px-3 pt-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              {/* Menu item button: full width, padding for comfortable click area */}
              {/* Height: 44px, rounded corners for modern look */}
              <button
                onClick={() => onTabChange?.(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-all relative cursor-pointer ${activeTab === item.id
                    ? 'bg-[#FAFAFA] text-black'
                    : 'text-[#434343] hover:bg-white/50 hover:text-[#FF4000]'
                  }`}
              >
                {/* Active indicator: orange vertical bar on the left */}
                {/* Size: W:4px H:24px, positioned at left edge */}
                {activeTab === item.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#FF4000] rounded-r" />
                )}

                {/* Icon: 20x20px, maintains original size when collapsed */}
                <img
                  src={item.icon}
                  alt={item.label}
                  className="w-5 h-5 shrink-0"
                />

                {/* Label text: only visible when expanded */}
                {/* Font: 14px, medium weight for readability */}
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
