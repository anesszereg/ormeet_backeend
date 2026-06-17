import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsFillArrowLeftCircleFill, BsFillArrowRightCircleFill } from "react-icons/bs";
import DashboardIcon from '../assets/Svgs/organiser/dashboard/dashboard.svg';
import EventIcon from '../assets/Svgs/organiser/dashboard/event.svg';
import AttendeesIcon from '../assets/Svgs/organiser/dashboard/attendees.svg';
import OrdersIcon from '../assets/Svgs/organiser/dashboard/orders.svg';
import AccountSettingsIcon from '../assets/Svgs/organiser/dashboard/account settings.svg';
import WorkspaceIcon from '../assets/Svgs/organiser/dashboard/workspace.svg';
import AddIcon from '../assets/Svgs/organiser/dashboard/add.svg';

interface OrganizerSidebarProps {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

const OrganizerSidebar = ({ activeTab = 'dashboard', onTabChange, onCollapseChange }: OrganizerSidebarProps) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  const menuItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: DashboardIcon },
    { id: 'events', label: t('sidebar.events'), icon: EventIcon },
    { id: 'attendees', label: t('sidebar.attendees'), icon: AttendeesIcon },
    { id: 'orders', label: t('sidebar.orders'), icon: OrdersIcon },
    { id: 'account-settings', label: t('sidebar.accountSettings'), icon: AccountSettingsIcon },
  ];

  return (
    <aside
      className={`${isCollapsed ? 'w-20' : 'w-60'} min-h-full bg-secondary-light flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Header section */}
      <div className="h-16 ps-6 flex items-center justify-between border-b border-light-gray">
        <div className="flex items-center justify-between w-full">
          {!isCollapsed && (
            <h2 className="text-base font-semibold text-black">{t('sidebar.title')}</h2>
          )}

          <button
            onClick={handleToggleCollapse}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-gray transition-all cursor-pointer"
            aria-label={isCollapsed ? t('sidebar.expandAria') : t('sidebar.collapseAria')}
          >
            {isCollapsed ? (
              <BsFillArrowRightCircleFill size={24} className="rtl:scale-x-[-1]" />
            ) : (
              <BsFillArrowLeftCircleFill size={24} className="rtl:scale-x-[-1]" />
            )}
          </button>
        </div>
      </div>

      {/* Search bar section */}
      <div className="px-3 py-4">
        {isCollapsed ? (
          <button
            onClick={handleToggleCollapse}
            className="w-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
          >
            <svg className="w-6 h-6 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        ) : (
          <div className="relative">
            <div className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-input-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder={t('sidebar.searchPlaceholder')}
              className="w-full ps-10 pe-4 py-2 bg-white border border-light-gray text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              style={{ borderRadius: '85.41px' }}
            />
          </div>
        )}
      </div>

      {/* Navigation menu items */}
      <nav className="px-3 pt-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange?.(item.id)}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg transition-all relative cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-white text-black'
                    : 'text-dark-gray hover:bg-white/50'
                }`}
              >
                {activeTab === item.id && (
                  <div className="absolute start-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
                )}

                <img src={item.icon} alt={item.label} className="w-5 h-5 shrink-0" />

                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Divider before Workspace */}
        <div className="my-3">
          <div className="h-px bg-light-gray"></div>
        </div>

        {/* Workspace section */}
        <div className="pb-2">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <img src={WorkspaceIcon} alt="Workspace" className="w-5 h-5" />
                <span className="text-sm font-medium text-dark-gray">{t('sidebar.workspace')}</span>
              </div>
            )}
            <button
              className={`${isCollapsed ? 'w-full flex justify-center' : ''} shrink-0 cursor-pointer hover:opacity-80 transition-opacity`}
              aria-label={t('sidebar.addWorkspaceAria')}
            >
              <img src={AddIcon} alt="Add" className="w-8 h-8" />
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default OrganizerSidebar;
