import { useState, useEffect, useRef } from 'react';
import organizerService, { Order as ApiOrder, Event as ApiEvent } from '../../services/organizerService';
import { useAuth } from '../../context/AuthContext';
import SearchIcon from '../../assets/Svgs/recherche.svg';
import NewestIcon from '../../assets/Svgs/newest.svg';
import AllDateIcon from '../../assets/Svgs/organiser/dashboard/Events/allDate.svg';
import ExportIcon from '../../assets/Svgs/organiser/dashboard/Orders/export.svg';
import ExportModal from './ExportModal';
import PaidIcon from '../../assets/Svgs/organiser/dashboard/Orders/paid.svg';
import PendingIcon from '../../assets/Svgs/organiser/dashboard/Orders/pending.svg';
import FailedIcon from '../../assets/Svgs/organiser/dashboard/Orders/failed.svg';
import ArrowUpIcon from '../../assets/Svgs/organiser/dashboard/Orders/arrowUp.svg';
import ArrowDownIcon from '../../assets/Svgs/organiser/dashboard/Orders/arrowDown.svg';
import UpIcon from '../../assets/Svgs/organiser/dashboard/Orders/up.svg';
import DownIcon from '../../assets/Svgs/organiser/dashboard/Orders/down.svg';
import SuccessIcon from '../../assets/Svgs/success.svg';
import ProfilePhoto1 from '../../assets/imges/photoPorifle/Mask group.png';
import ProfilePhoto2 from '../../assets/imges/photoPorifle/Mask group (1).png';
import ProfilePhoto3 from '../../assets/imges/photoPorifle/Mask group (2).png';
import ProfilePhoto4 from '../../assets/imges/photoPorifle/Mask group (3).png';
import ProfilePhoto5 from '../../assets/imges/photoPorifle/Mask group (4).png';
import ProfilePhoto6 from '../../assets/imges/photoPorifle/Mask group (5).png';

interface Order {
  id: string;
  orderId: string;
  eventName: string;
  buyerName: string;
  buyerPhoto: string;
  ticketType: string;
  qty: number;
  totalPrice: number;
  payment: 'paid' | 'pending' | 'failed';
  orderDate: string;
  ticketStatus: 'sent' | 'not-sent';
  status: 'active' | 'draft' | 'in-transit' | 'completed' | 'cancelled';
}

interface OrdersTableProps {
  onCreateOrder?: () => void;
}

const OrdersTable = ({ onCreateOrder }: OrdersTableProps) => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'draft' | 'in-transit' | 'completed' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest First');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const ordersPerPage = 6;

  // API Data States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiOrders, setApiOrders] = useState<Order[]>([]);
  
  const sortRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch events first to filter orders by organizer's events
        // Use organizationId if available, otherwise fall back to user.id
        const organizerId = user.organizationId || user.id;
        console.log('🛒 [OrdersTable] Using organizerId:', organizerId);
        
        const eventsData = await organizerService.getEvents({ organizerId });
        const eventIds = new Set(eventsData.map((e: ApiEvent) => e.id));
        const eventMap = new Map(eventsData.map((e: ApiEvent) => [e.id, e.title]));
        
        // Fetch all orders
        const ordersData = await organizerService.getOrders();
        
        console.log('🛒 [OrdersTable] Fetched Events:', eventsData);
        console.log('🛒 [OrdersTable] Fetched Orders:', ordersData);
        
        // Filter and transform orders for organizer's events
        const transformedOrders: Order[] = ordersData
          .filter((order: ApiOrder) => eventIds.has(order.eventId))
          .map((order: ApiOrder) => {
            // Map API status to UI status
            let status: 'active' | 'draft' | 'in-transit' | 'completed' | 'cancelled' = 'active';
            let payment: 'paid' | 'pending' | 'failed' = 'pending';
            
            if (order.status === 'paid') {
              status = 'active';
              payment = 'paid';
            } else if (order.status === 'pending') {
              status = 'draft';
              payment = 'pending';
            } else if (order.status === 'cancelled') {
              status = 'cancelled';
              payment = 'failed';
            } else if (order.status === 'refunded') {
              status = 'completed';
              payment = 'paid';
            }

            return {
              id: order.id,
              orderId: `#${order.id.substring(0, 4).toUpperCase()}`,
              eventName: eventMap.get(order.eventId) || 'Unknown Event',
              buyerName: order.user?.name || order.billingName || 'Unknown',
              buyerPhoto: order.user?.profilePhoto || ProfilePhoto1,
              ticketType: order.items?.[0]?.ticketTypeId ? 'General' : 'Unknown',
              qty: order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
              totalPrice: order.amountTotal || 0,
              payment,
              orderDate: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              ticketStatus: order.status === 'paid' ? 'sent' : 'not-sent',
              status,
            };
          });
        
        console.log('🛒 [OrdersTable] Transformed Orders:', transformedOrders);
        setApiOrders(transformedOrders);
      } catch (err) {
        console.error('❌ [OrdersTable] Failed to fetch orders:', err);
        setError('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Delete order handler
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    setIsDeleting(true);
    try {
      await organizerService.deleteOrder(orderToDelete.id);
      console.log('🗑️ [OrdersTable] Order deleted:', orderToDelete.id);
      
      // Remove from local state
      setApiOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      setShowDeleteSuccess(true);
      
      setTimeout(() => {
        setShowDeleteSuccess(false);
        setIsDeleteConfirmOpen(false);
        setSelectedOrder(null);
        setOrderToDelete(null);
      }, 2000);
    } catch (err) {
      console.error('❌ [OrdersTable] Failed to delete order:', err);
      setError('Failed to delete order');
      setIsDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Refund order handler
  const handleRefundOrder = async (orderId: string) => {
    try {
      await organizerService.refundOrder(orderId);
      console.log('💰 [OrdersTable] Order refunded:', orderId);
      
      // Update local state
      setApiOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, payment: 'paid' as const, status: 'completed' as const } : o
      ));
      setSelectedOrder(null);
    } catch (err) {
      console.error('❌ [OrdersTable] Failed to refund order:', err);
      setError('Failed to refund order');
    }
  };

  // Cancel order handler
  const handleCancelOrder = async (orderId: string) => {
    try {
      await organizerService.cancelOrder(orderId);
      console.log('❌ [OrdersTable] Order cancelled:', orderId);
      
      // Update local state
      setApiOrders(prev => prev.map(o => 
        o.id === orderId ? { ...o, payment: 'failed' as const, status: 'cancelled' as const } : o
      ));
      setSelectedOrder(null);
    } catch (err) {
      console.error('❌ [OrdersTable] Failed to cancel order:', err);
      setError('Failed to cancel order');
    }
  };

  // Use only API orders - no mock data fallback
  const ordersToDisplay = apiOrders;

  const filteredOrders = ordersToDisplay.filter(order => {
    const matchesSearch = order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.buyerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === 'all' || order.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(selected);
      setSelectedEndDate(null);
    } else {
      if (selected < selectedStartDate) {
        setSelectedEndDate(selectedStartDate);
        setSelectedStartDate(selected);
      } else {
        setSelectedEndDate(selected);
      }
      setIsDatePickerOpen(false);
    }
  };

  const handleMonthSelect = () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    setSelectedStartDate(startOfMonth);
    setSelectedEndDate(endOfMonth);
    setIsDatePickerOpen(false);
  };

  const isDateInRange = (day: number): boolean => {
    if (!selectedStartDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!selectedEndDate) {
      return date.getTime() === selectedStartDate.getTime();
    }
    
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isDateRangeEdge = (day: number): boolean => {
    if (!selectedStartDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (selectedEndDate) {
      return date.getTime() === selectedStartDate.getTime() || date.getTime() === selectedEndDate.getTime();
    }
    
    return date.getTime() === selectedStartDate.getTime();
  };

  const handleExport = (selectedEvent: string) => {
    console.log('Exporting orders for event:', selectedEvent);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const inRange = isDateInRange(day);
      const isEdge = isDateRangeEdge(day);

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`h-8 flex items-center justify-center text-sm font-normal rounded-full transition-colors cursor-pointer
            ${isEdge ? 'bg-primary text-white font-medium' : ''}
            ${inRange && !isEdge ? 'bg-[#FFE8E3] text-black' : ''}
            ${!inRange ? 'text-black hover:bg-gray-100' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-light-gray p-4 z-50" style={{ width: '320px' }}>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleMonthSelect}
            className="text-xs text-primary hover:text-primary-dark font-medium transition-colors cursor-pointer"
          >
            Select Month
          </button>
          {(selectedStartDate || selectedEndDate) && (
            <button
              onClick={() => {
                setSelectedStartDate(null);
                setSelectedEndDate(null);
              }}
              className="text-xs text-gray hover:text-black font-medium transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-black hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <h3 className="text-base font-medium text-black">{monthName}</h3>
          
          <button
            onClick={handleNextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-black">Orders</h1>
        
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="relative flex items-center gap-2 pl-11 pr-3 border border-light-gray bg-transparent hover:border-primary text-gray hover:text-black font-medium text-sm rounded-full transition-all cursor-pointer h-[38px] whitespace-nowrap"
        >
          <img src={ExportIcon} alt="Export" className="absolute left-1 top-1/2 -translate-y-1/2 w-[30px] h-[30px]" />
          <span>Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-light-gray rounded-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs lg:text-sm text-gray mb-1">Total Orders</p>
              <h3 className="text-2xl lg:text-3xl font-bold text-black">
                {isLoading ? '...' : apiOrders.length.toLocaleString()}
              </h3>
            </div>
            <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
              <img src={UpIcon} alt="Up trend" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs lg:text-sm text-gray ml-1">From last month</span>
          </div>
        </div>

        <div className="bg-white border border-light-gray rounded-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs lg:text-sm text-gray mb-1">Total Returns</p>
              <h3 className="text-2xl lg:text-3xl font-bold text-black">
                {isLoading ? '...' : apiOrders.filter(o => o.status === 'cancelled').length.toLocaleString()}
              </h3>
            </div>
            <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
              <img src={DownIcon} alt="Down trend" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs lg:text-sm text-gray ml-1">From last month</span>
          </div>
        </div>

        <div className="bg-white border border-light-gray rounded-xl p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs lg:text-sm text-gray mb-1">Total Revenue</p>
              <h3 className="text-2xl lg:text-3xl font-bold text-black">
                {isLoading ? '...' : `$${apiOrders.filter(o => o.payment === 'paid').reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString()}`}
              </h3>
            </div>
            <div className="w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center">
              <img src={UpIcon} alt="Up trend" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs lg:text-sm text-gray ml-1">From last month</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6 border-b border-light-gray mb-6 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveFilter('all')}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeFilter === 'all' ? 'text-primary' : 'text-gray hover:text-black'
          }`}
        >
          All Orders
          {activeFilter === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveFilter('active')}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeFilter === 'active' ? 'text-primary' : 'text-gray hover:text-black'
          }`}
        >
          Active
          {activeFilter === 'active' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveFilter('draft')}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeFilter === 'draft' ? 'text-primary' : 'text-gray hover:text-black'
          }`}
        >
          Draft
          {activeFilter === 'draft' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveFilter('in-transit')}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeFilter === 'in-transit' ? 'text-primary' : 'text-gray hover:text-black'
          }`}
        >
          In transit
          {activeFilter === 'in-transit' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeFilter === 'completed' ? 'text-primary' : 'text-gray hover:text-black'
          }`}
        >
          Completed
          {activeFilter === 'completed' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveFilter('cancelled')}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeFilter === 'cancelled' ? 'text-primary' : 'text-gray hover:text-black'
          }`}
        >
          Cancelled
          {activeFilter === 'cancelled' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <h2 className="text-sm sm:text-base font-semibold text-black">
          {filteredOrders.length} Orders
        </h2>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search order"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[160px] lg:w-[187px] h-[38px] pl-4 pr-10 bg-white border border-light-gray text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all rounded-full"
            />
            <img 
              src={SearchIcon} 
              alt="Search" 
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none" 
            />
          </div>

          <div className="relative" ref={sortRef}>
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsDatePickerOpen(false);
              }}
              className="flex items-center gap-2 pl-11 pr-3 border border-light-gray bg-white cursor-pointer hover:border-primary transition-colors w-[140px] sm:w-[160px] lg:w-[187px] h-[38px] rounded-full"
            >
              <img src={NewestIcon} alt="Sort" className="absolute left-1 top-1/2 -translate-y-1/2 w-[30px] h-[30px]" />
              <span className="text-sm font-medium text-gray truncate flex-1">{sortOption}</span>
              <svg className="w-4 h-4 text-gray shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-light-gray py-1 z-50">
                {['Newest First', 'Oldest First', 'A-Z'].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      setSortOption(option);
                      setIsSortOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                      sortOption === option
                        ? 'bg-primary-light text-primary font-medium'
                        : 'text-gray hover:bg-secondary-light'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={datePickerRef}>
            <button
              onClick={() => {
                setIsDatePickerOpen(!isDatePickerOpen);
                setIsSortOpen(false);
              }}
              className="flex items-center gap-2 pl-11 pr-3 border border-light-gray bg-white cursor-pointer hover:border-primary transition-colors w-[140px] sm:w-[160px] lg:w-[187px] h-[38px] rounded-full"
            >
              <img src={AllDateIcon} alt="Date" className="absolute left-1 top-1/2 -translate-y-1/2 w-[30px] h-[30px]" />
              <span className="text-sm font-medium text-gray truncate flex-1">
                {selectedStartDate && selectedEndDate
                  ? `${selectedStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${selectedEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                  : selectedStartDate
                  ? selectedStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'All Date'}
              </span>
              <svg className="w-4 h-4 text-gray shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDatePickerOpen && renderCalendar()}
          </div>
        </div>
      </div>

      <div className="bg-white border border-light-gray rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-9 gap-1 px-2 lg:px-4 py-4 bg-secondary-light border-b border-light-gray">
          <div className="col-span-2 text-xs lg:text-sm font-semibold text-gray">Event Name</div>
          <div className="col-span-2 text-xs lg:text-sm font-semibold text-gray">Buyer</div>
          <div className="col-span-1 text-xs lg:text-sm font-semibold text-gray">Ticket Type</div>
          <div className="col-span-1 text-xs lg:text-sm font-semibold text-gray">Qty</div>
          <div className="col-span-1 text-xs lg:text-sm font-semibold text-gray">Total Price</div>
          <div className="col-span-1 text-xs lg:text-sm font-semibold text-gray">Payment</div>
          <div className="col-span-1 text-xs lg:text-sm font-semibold text-gray">Order Date</div>
        </div>

        <div className="divide-y divide-light-gray">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray">Loading orders...</p>
            </div>
          ) : currentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                Orders will appear here when customers purchase tickets for your events.
              </p>
            </div>
          ) : (
          currentOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="flex flex-col md:grid md:grid-cols-9 gap-2 md:gap-1 px-2 lg:px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="md:col-span-2 flex items-center">
                <span className="text-xs lg:text-sm font-semibold text-black">{order.eventName}</span>
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <img
                  src={order.buyerPhoto}
                  alt={order.buyerName}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <span className="text-xs lg:text-sm text-black">{order.buyerName}</span>
              </div>

              <div className="md:col-span-1 flex items-center">
                <span className="text-xs lg:text-sm text-gray">{order.ticketType}</span>
              </div>

              <div className="md:col-span-1 flex items-center">
                <span className="text-xs lg:text-sm text-gray">{order.qty}</span>
              </div>

              <div className="md:col-span-1 flex items-center">
                <span className="text-xs lg:text-sm text-gray">${order.totalPrice}</span>
              </div>

              <div className="md:col-span-1 flex items-center">
                {order.payment === 'paid' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#10B981]/10 text-[#10B981] text-xs font-medium rounded-full">
                    <img src={PaidIcon} alt="Paid" className="w-3 h-3" />
                    Paid
                  </span>
                )}
                {order.payment === 'pending' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium rounded-full">
                    <img src={PendingIcon} alt="Pending" className="w-3 h-3" />
                    Pending
                  </span>
                )}
                {order.payment === 'failed' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EF4444]/10 text-[#EF4444] text-xs font-medium rounded-full">
                    <img src={FailedIcon} alt="Failed" className="w-3 h-3" />
                    Failed
                  </span>
                )}
              </div>

              <div className="md:col-span-1 flex items-center">
                <span className="text-xs lg:text-sm text-gray">{order.orderDate}</span>
              </div>

            </div>
          ))
          )}
        </div>
      </div>

      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <p className="text-xs sm:text-sm text-gray order-2 sm:order-1">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} Orders
          </p>
          
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <button 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-light-gray hover:bg-secondary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageClick(pageNumber)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    currentPage === pageNumber
                      ? 'bg-[#9CA3AF] text-white'
                      : 'border border-light-gray text-gray hover:bg-secondary-light'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <>
                <span className="text-sm text-gray">...</span>
                <button
                  onClick={() => handlePageClick(totalPages)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-light-gray text-sm font-medium text-gray hover:bg-secondary-light transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
            
            <button 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-light-gray hover:bg-secondary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-light-gray">
              <h2 className="text-xl font-bold text-black">Order Details</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray hover:text-black transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Buyer Photo & Name */}
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <img
                    src={selectedOrder.buyerPhoto}
                    alt={selectedOrder.buyerName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-light-gray"
                  />
                  <p className="text-sm font-semibold text-black text-center">{selectedOrder.buyerName}</p>
                </div>

                {/* Order Information */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Order ID */}
                  <div>
                    <p className="text-xs text-gray mb-1">Order ID</p>
                    <p className="text-sm text-black font-medium">{selectedOrder.orderId}</p>
                  </div>

                  {/* Order Date */}
                  <div>
                    <p className="text-xs text-gray mb-1">Order Date</p>
                    <p className="text-sm text-black">{selectedOrder.orderDate}</p>
                  </div>

                  {/* Event Name */}
                  <div>
                    <p className="text-xs text-gray mb-1">Event</p>
                    <p className="text-sm font-medium text-black">{selectedOrder.eventName}</p>
                  </div>

                  {/* Quantity */}
                  <div>
                    <p className="text-xs text-gray mb-1">Quantity</p>
                    <p className="text-sm text-black">{selectedOrder.qty}</p>
                  </div>

                  {/* Ticket Type */}
                  <div>
                    <p className="text-xs text-gray mb-1">Ticket Type</p>
                    <span className="inline-block px-3 py-1 bg-secondary-light text-sm font-medium text-black rounded-full">
                      {selectedOrder.ticketType}
                    </span>
                  </div>

                  {/* Total Price */}
                  <div>
                    <p className="text-xs text-gray mb-1">Total Price</p>
                    <p className="text-sm font-semibold text-black">${selectedOrder.totalPrice}</p>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <p className="text-xs text-gray mb-1">Payment Status</p>
                    {selectedOrder.payment === 'paid' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#10B981]/10 text-[#10B981] text-xs font-medium rounded-full">
                        <img src={PaidIcon} alt="Paid" className="w-3 h-3" />
                        Paid
                      </span>
                    )}
                    {selectedOrder.payment === 'pending' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium rounded-full">
                        <img src={PendingIcon} alt="Pending" className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                    {selectedOrder.payment === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EF4444]/10 text-[#EF4444] text-xs font-medium rounded-full">
                        <img src={FailedIcon} alt="Failed" className="w-3 h-3" />
                        Failed
                      </span>
                    )}
                  </div>

                  {/* Order Status */}
                  <div>
                    <p className="text-xs text-gray mb-1">Order Status</p>
                    <span className="inline-block px-3 py-1 bg-secondary-light text-sm font-medium text-black rounded-full capitalize">
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4">
                {selectedOrder.payment === 'paid' && selectedOrder.status !== 'completed' && (
                  <button
                    onClick={() => handleRefundOrder(selectedOrder.id)}
                    className="pl-5 pr-5 py-2 border border-yellow-500 text-yellow-600 rounded-full text-sm font-medium hover:bg-yellow-50 transition-all whitespace-nowrap cursor-pointer"
                  >
                    Refund
                  </button>
                )}
                {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed' && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    className="pl-5 pr-5 py-2 border border-gray-400 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer"
                  >
                    Cancel Order
                  </button>
                )}
                <button
                  onClick={() => {
                    setOrderToDelete(selectedOrder);
                    setIsDeleteConfirmOpen(true);
                  }}
                  className="pl-5 pr-5 py-2 border border-red-500 text-red-500 rounded-full text-sm font-medium hover:bg-red-50 transition-all whitespace-nowrap cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && orderToDelete && (
        <div 
          className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4" 
          onClick={() => !showDeleteSuccess && setIsDeleteConfirmOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {!showDeleteSuccess ? (
                <>
                  <h2 className="text-xl font-bold text-black mb-4">Confirm Deletion</h2>
                  <p className="text-sm text-gray mb-6">
                    Are you sure you want to delete order <span className="font-semibold text-black">{orderToDelete.orderId}</span> ?
                  </p>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsDeleteConfirmOpen(false);
                        setOrderToDelete(null);
                      }}
                      className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteOrder}
                      disabled={isDeleting}
                      className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                      style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                  <p className="text-lg font-semibold text-black">Order successfully deleted</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExport}
        events={[]}
      />
    </div>
  );
};

export default OrdersTable;
