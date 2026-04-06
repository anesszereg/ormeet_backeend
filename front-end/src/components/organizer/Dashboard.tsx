import { useState, useRef, useEffect } from 'react';
import organizerService, { Event, Order } from '../../services/organizerService';
import { useAuth } from '../../context/AuthContext';
import CreateEventIcon from '../../assets/Svgs/organiser/dashboard/Events/createEvent.svg';
import UpIcon from '../../assets/Svgs/organiser/dashboard/Orders/up.svg';
import DownIcon from '../../assets/Svgs/organiser/dashboard/Orders/down.svg';
import ArrowUpIcon from '../../assets/Svgs/organiser/dashboard/Orders/arrowUp.svg';
import ArrowDownIcon from '../../assets/Svgs/organiser/dashboard/Orders/arrowDown.svg';
import UpTrendIcon from '../../assets/Svgs/organiser/dashboard/dashboard/up.svg';
import DownTrendIcon from '../../assets/Svgs/organiser/dashboard/dashboard/down.svg';
import NoChangeIcon from '../../assets/Svgs/organiser/dashboard/dashboard/noChange.svg';
import SeeAllIcon from '../../assets/Svgs/organiser/dashboard/dashboard/seeAll.svg';
import ProfilePhoto1 from '../../assets/imges/photoPorifle/Mask group.png';
import ProfilePhoto2 from '../../assets/imges/photoPorifle/Mask group (1).png';
import ProfilePhoto3 from '../../assets/imges/photoPorifle/Mask group (2).png';
import ProfilePhoto4 from '../../assets/imges/photoPorifle/Mask group (3).png';
import ProfilePhoto5 from '../../assets/imges/photoPorifle/Mask group (4).png';

interface DashboardProps {
  onCreateEvent: () => void;
}

interface Activity {
  id: string;
  organizerName: string;
  organizerPhoto: string;
  action: string;
  eventName: string;
  time: string;
}

// Dashboard Stats Interface
interface DashboardStats {
  totalOrders: number;
  totalReturns: number;
  totalRevenue: number;
  ordersChange: number;
  returnsChange: number;
  revenueChange: number;
}

const Dashboard = ({ onCreateEvent }: DashboardProps) => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);

  // API Data States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalReturns: 0,
    totalRevenue: 0,
    ordersChange: 0,
    returnsChange: 0,
    revenueChange: 0,
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Use organizationId if available, otherwise fall back to user.id
        const organizerId = user.organizationId || user.id;
        console.log('📊 [Dashboard] Using organizerId:', organizerId);
        
        // Fetch events and orders in parallel
        const [eventsData, ordersData] = await Promise.all([
          organizerService.getEvents({ organizerId }),
          organizerService.getOrders(),
        ]);

        // Log fetched data
        console.log('📊 [Dashboard] Fetched Events:', eventsData);
        console.log('📊 [Dashboard] Fetched Orders:', ordersData);
        
        setEvents(eventsData);
        
        // Filter orders for organizer's events
        const eventIds = new Set(eventsData.map(e => e.id));
        const organizerOrders = ordersData.filter(o => eventIds.has(o.eventId));
        setOrders(organizerOrders);
        
        console.log('📊 [Dashboard] Organizer Orders (filtered):', organizerOrders);

        // Calculate stats
        const paidOrders = organizerOrders.filter(o => o.status === 'paid');
        const refundedOrders = organizerOrders.filter(o => o.status === 'refunded');
        const totalRevenue = paidOrders.reduce((sum, o) => sum + (parseFloat(String(o.amountTotal)) || 0), 0);

        // No historical data available yet — show 0% change
        const ordersChange = 0;
        const returnsChange = 0;
        const revenueChange = 0;

        const calculatedStats = {
          totalOrders: organizerOrders.length,
          totalReturns: refundedOrders.length,
          totalRevenue,
          ordersChange,
          returnsChange,
          revenueChange,
        };
        
        console.log('📊 [Dashboard] Calculated Stats:', calculatedStats);
        setStats(calculatedStats);
      } catch (err) {
        console.error('❌ [Dashboard] Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  // Generate recent activities from real orders data
  const recentActivities: Activity[] = orders.slice(0, 5).map((order, index) => {
    const photos = [ProfilePhoto1, ProfilePhoto2, ProfilePhoto3, ProfilePhoto4, ProfilePhoto5];
    const event = events.find(e => e.id === order.eventId);
    return {
      id: order.id,
      organizerName: order.billingName || 'Customer',
      organizerPhoto: photos[index % photos.length],
      action: order.status === 'paid' ? 'purchased tickets for' : 'placed an order for',
      eventName: event?.title || 'an event',
      time: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    };
  });

  const displayedActivities = recentActivities.slice(0, 3);

  const periods = ['Weekly', 'Monthly', 'Yearly'];

  // Generate ticket data from real orders
  const getTicketData = () => {
    // Group orders by ticket type and calculate stats
    const ticketStats = new Map<string, { sold: number; revenue: number }>();
    
    orders.forEach(order => {
      if (order.status === 'paid' && order.items) {
        order.items.forEach(item => {
          const current = ticketStats.get(item.ticketTypeId) || { sold: 0, revenue: 0 };
          ticketStats.set(item.ticketTypeId, {
            sold: current.sold + item.quantity,
            revenue: current.revenue + (item.unitPrice * item.quantity)
          });
        });
      }
    });

    const totalSold = Array.from(ticketStats.values()).reduce((sum, t) => sum + t.sold, 0);
    
    // Convert to display format
    const entries = Array.from(ticketStats.entries());
    if (entries.length === 0) return [];
    
    return entries.map(([typeId, stat]) => {
      const salesPercent = totalSold > 0 ? Math.round((stat.sold / totalSold) * 100) : 0;
      return {
        type: typeId,
        sold: stat.sold,
        conversion: '-',
        totalSales: `${salesPercent}%`,
        trend: stat.sold > 0 ? 'up' : 'nochange',
        change: '0%'
      };
    });
  };

  const ticketData = getTicketData();

  const getFromLastLabel = () => {
    switch (selectedPeriod) {
      case 'Monthly':
        return 'From Last Month';
      case 'Yearly':
        return 'From Last Year';
      default:
        return 'From Last Week';
    }
  };

  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period);
    setIsPeriodDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setIsPeriodDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isActivitiesModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isActivitiesModalOpen]);

  return (
    <div className="w-full">
      {/* Header with Create Event Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-black">Dashboard</h1>
        
        {/* Create Event Button - Exact same as Events tab */}
        <button
          onClick={onCreateEvent}
          className="relative flex items-center gap-2 pl-11 pr-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm sm:text-base rounded-full transition-all cursor-pointer whitespace-nowrap"
          style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
        >
          <img src={CreateEventIcon} alt="Create" className="absolute left-1 top-1/2 -translate-y-1/2 w-[26px] h-[26px] sm:w-[30px] sm:h-[30px]" />
          <span>Create Event</span>
        </button>
      </div>

      {/* KPI Cards - Exact same design as Orders tab */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Orders KPI */}
        <div className="bg-white border border-light-gray rounded-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs lg:text-sm text-gray mb-1">Total Orders</p>
              <h3 className="text-2xl lg:text-3xl font-bold text-black">
                {isLoading ? '...' : stats.totalOrders.toLocaleString()}
              </h3>
            </div>
            <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
              <img src={stats.ordersChange >= 0 ? UpIcon : DownIcon} alt="Trend" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <img src={stats.ordersChange >= 0 ? ArrowUpIcon : ArrowDownIcon} alt="Change" className="w-3 h-3" />
            <span className={`text-xs lg:text-sm font-medium ${stats.ordersChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {Math.abs(stats.ordersChange)}%
            </span>
            <span className="text-xs lg:text-sm text-gray ml-1">From last month</span>
          </div>
        </div>

        {/* Total Returns KPI */}
        <div className="bg-white border border-light-gray rounded-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs lg:text-sm text-gray mb-1">Total Returns</p>
              <h3 className="text-2xl lg:text-3xl font-bold text-black">
                {isLoading ? '...' : stats.totalReturns.toLocaleString()}
              </h3>
            </div>
            <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
              <img src={stats.returnsChange >= 0 ? UpIcon : DownIcon} alt="Trend" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <img src={stats.returnsChange >= 0 ? ArrowUpIcon : ArrowDownIcon} alt="Change" className="w-3 h-3" />
            <span className={`text-xs lg:text-sm font-medium ${stats.returnsChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {Math.abs(stats.returnsChange)}%
            </span>
            <span className="text-xs lg:text-sm text-gray ml-1">From last month</span>
          </div>
        </div>

        {/* Total Revenue KPI */}
        <div className="bg-white border border-light-gray rounded-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs lg:text-sm text-gray mb-1">Total Revenue</p>
              <h3 className="text-2xl lg:text-3xl font-bold text-black">
                {isLoading ? '...' : `$${stats.totalRevenue.toLocaleString()}`}
              </h3>
            </div>
            <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
              <img src={stats.revenueChange >= 0 ? UpIcon : DownIcon} alt="Trend" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <img src={stats.revenueChange >= 0 ? ArrowUpIcon : ArrowDownIcon} alt="Change" className="w-3 h-3" />
            <span className={`text-xs lg:text-sm font-medium ${stats.revenueChange >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {Math.abs(stats.revenueChange)}%
            </span>
            <span className="text-xs lg:text-sm text-gray ml-1">From last month</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch">
        {/* Top Selling Ticket Categories - Takes 2 columns */}
        <div className="lg:col-span-2 bg-white border border-light-gray rounded-xl p-6 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-black">Top Selling Ticket Categories</h2>
            <div className="flex items-center gap-3">
              {/* Period Dropdown */}
              <div className="relative" ref={periodRef}>
                <button
                  type="button"
                  onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                  className="px-3 py-1 text-sm text-black border border-light-gray rounded-xl focus:outline-none focus:border-primary transition-all flex items-center justify-between min-w-[100px] cursor-pointer"
                >
                  {selectedPeriod}
                  <svg className="w-4 h-4 text-gray ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isPeriodDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-light-gray rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {periods.map((period) => (
                      <button
                        key={period}
                        type="button"
                        onClick={() => handlePeriodSelect(period)}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                          selectedPeriod === period
                            ? 'bg-primary-light text-primary font-medium'
                            : 'text-gray hover:bg-secondary-light'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-light-gray">
                  <th className="text-left text-xs font-medium text-gray pb-3" style={{ width: '25%' }}>Ticket Type</th>
                  <th className="text-left text-xs font-medium text-gray pb-3" style={{ width: '15%' }}>Sold</th>
                  <th className="text-left text-xs font-medium text-gray pb-3" style={{ width: '18%' }}>Conversion</th>
                  <th className="text-left text-xs font-medium text-gray pb-3" style={{ width: '17%' }}>Total Sales %</th>
                  <th className="text-left text-xs font-medium text-gray pb-3" style={{ width: '25%' }}>{getFromLastLabel()}</th>
                </tr>
              </thead>
              <tbody>
                {ticketData.map((ticket, index) => (
                  <tr key={ticket.type} className={index < ticketData.length - 1 ? 'border-b border-light-gray' : ''}>
                    <td className="py-4 text-sm font-medium text-black">{ticket.type}</td>
                    <td className="py-4 text-sm text-black">{ticket.sold}</td>
                    <td className="py-4 text-sm text-black">{ticket.conversion}</td>
                    <td className="py-4 text-sm text-black">{ticket.totalSales}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-1">
                        {ticket.trend === 'up' && (
                          <>
                            <img src={UpTrendIcon} alt="Up" className="w-3 h-3" />
                            <span className="text-sm font-medium text-[#10B981]">{ticket.change}</span>
                            <span className="text-sm text-gray">Up</span>
                          </>
                        )}
                        {ticket.trend === 'down' && (
                          <>
                            <img src={DownTrendIcon} alt="Down" className="w-3 h-3" />
                            <span className="text-sm font-medium text-[#EF4444]">{ticket.change}</span>
                            <span className="text-sm text-gray">Down</span>
                          </>
                        )}
                        {ticket.trend === 'nochange' && (
                          <>
                            <img src={NoChangeIcon} alt="No change" className="w-3 h-3" />
                            <span className="text-sm font-medium text-[#003a97]">{ticket.change}</span>
                            <span className="text-sm text-gray">No Change</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Activities Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-black">Recent Activities</h2>
              <button 
                onClick={() => setIsActivitiesModalOpen(true)}
                className="text-[#FF4000] text-xs font-medium hover:text-[#E63900] transition-colors cursor-pointer"
              >
                See All
              </button>
            </div>

            {/* Activities List */}
            <div className="space-y-3">
              {displayedActivities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600">No recent activities</p>
                  <p className="text-xs text-gray-400 mt-1">Activities will appear here when orders are placed</p>
                </div>
              ) : (
                displayedActivities.map((activity, index) => (
                  <div key={activity.id}>
                    <div className="flex items-start gap-3">
                      {/* Organizer Photo */}
                      <img 
                        src={activity.organizerPhoto} 
                        alt={activity.organizerName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      
                      {/* Activity Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-black">
                          <span className="font-bold">{activity.organizerName}</span>
                          {' '}{activity.action}{' '}
                          {activity.eventName}.
                        </p>
                        <p className="text-xs text-gray mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                    {index < displayedActivities.length - 1 && (
                      <div className="border-b border-light-gray mt-3"></div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Alert Panels */}
        <div className="flex flex-col justify-between gap-6">
          {/* Important Alerts Panel */}
          <div className="bg-white border border-light-gray rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FF4000] rounded-full"></div>
                <h3 className="text-sm font-bold text-black">Important Alerts</h3>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="text-xs text-gray">No alerts at the moment</p>
            </div>
          </div>

          {/* Action Required Panel */}
          <div className="bg-white border border-light-gray rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#FBBC04] rounded-full"></div>
                <h3 className="text-sm font-bold text-black">Action Required</h3>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-xs text-gray">No actions required</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Modal */}
      {isActivitiesModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsActivitiesModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-light-gray">
              <h2 className="text-xl font-bold text-black">All Activities</h2>
              <button 
                onClick={() => setIsActivitiesModalOpen(false)}
                className="text-gray hover:text-black transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-light-gray last:border-0 last:pb-0">
                    {/* Organizer Photo */}
                    <img 
                      src={activity.organizerPhoto} 
                      alt={activity.organizerName}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    
                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black">
                        <span className="font-bold">{activity.organizerName}</span>
                        {' '}{activity.action}{' '}
                        <span className="font-bold">{activity.eventName}</span>
                      </p>
                      <p className="text-xs text-gray mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
