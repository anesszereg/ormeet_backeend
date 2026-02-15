import { useState, useEffect, useRef } from 'react';
import organizerService, { Event as ApiEvent } from '../../services/organizerService';
import { useAuth } from '../../context/AuthContext';
import SearchIcon from '../../assets/Svgs/recherche.svg';
import NewestIcon from '../../assets/Svgs/newest.svg';
import AllDateIcon from '../../assets/Svgs/organiser/dashboard/Events/allDate.svg';
import OngoingIcon from '../../assets/Svgs/organiser/dashboard/Events/ongoing.svg';
import UpcomingIcon from '../../assets/Svgs/organiser/dashboard/Events/upcoming.svg';
import CompletedIcon from '../../assets/Svgs/organiser/dashboard/Events/completed.svg';
import CreateEventIcon from '../../assets/Svgs/organiser/dashboard/Events/createEvent.svg';

interface TicketData {
  id: string;
  type: string;
  priceType: 'free' | 'paid' | '';
  price: string;
  quantity: string;
}

interface FAQData {
  id: string;
  question: string;
  answer: string;
}

interface FullEventData {
  id: string;
  name: string;
  image: string;
  images: string[];
  date: string;
  dateRange: [Date | null, Date | null];
  startTime: string;
  endTime: string;
  location: string;
  country: string;
  state: string;
  mapAddress: string;
  onlineLink: string;
  status: 'ongoing' | 'upcoming' | 'completed' | 'draft';
  sold: string;
  category: string;
  eventType: 'in-person' | 'online' | 'hybrid' | '';
  description: string;
  tickets: TicketData[];
  faqs: FAQData[];
  visibility: 'public' | 'private';
}

interface EventsTableProps {
  onCreateEvent: () => void;
  onEditEvent?: (event: FullEventData) => void;
  onDuplicateEvent?: (event: FullEventData) => void;
}

const EventsTable = ({ onCreateEvent, onEditEvent, onDuplicateEvent }: EventsTableProps) => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'ongoing' | 'upcoming' | 'past' | 'drafts'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest First');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<FullEventData | null>(null);
  const [isEventDetailsOpen, setIsEventDetailsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const eventsPerPage = 9;

  // Delete confirmation states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<FullEventData | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // API Data States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiEvents, setApiEvents] = useState<FullEventData[]>([]);
  
  const sortRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Use organizationId if available, otherwise fall back to user.id
        const organizerId = user.organizationId || user.id;
        console.log('📅 [EventsTable] Using organizerId:', organizerId);
        
        const eventsData = await organizerService.getEvents({ organizerId });
        
        // Transform API events to FullEventData format
        console.log('📅 [EventsTable] Fetched Events from API:', eventsData);
        
        const transformedEvents: FullEventData[] = eventsData.map((event: ApiEvent) => {
          // Determine status based on dates and API status
          let status: 'ongoing' | 'upcoming' | 'completed' | 'draft' = 'draft';
          const now = new Date();
          const startDate = new Date(event.startAt);
          const endDate = new Date(event.endAt);
          
          if (event.status === 'draft') {
            status = 'draft';
          } else if (event.status === 'cancelled' || event.status === 'completed') {
            status = 'completed';
          } else if (now < startDate) {
            status = 'upcoming';
          } else if (now >= startDate && now <= endDate) {
            status = 'ongoing';
          } else {
            status = 'completed';
          }

          return {
            id: event.id,
            name: event.title,
            image: event.images?.[0] || '',
            images: event.images || [],
            date: new Date(event.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            dateRange: [new Date(event.startAt), new Date(event.endAt)] as [Date | null, Date | null],
            startTime: new Date(event.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            endTime: new Date(event.endAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
            location: event.locationType === 'online' ? 'Online Event' : 'TBA',
            country: '',
            state: '',
            mapAddress: '',
            onlineLink: '',
            status,
            sold: (() => {
              const ticketTypes = (event as any).ticketTypes || [];
              const totalSold = ticketTypes.reduce((sum: number, t: any) => sum + (t.quantitySold || 0), 0);
              const totalCapacity = ticketTypes.reduce((sum: number, t: any) => sum + (t.quantityTotal || 0), 0);
              return `${totalSold}/${totalCapacity}`;
            })(),
            category: event.type || 'Other',
            eventType: event.locationType === 'online' ? 'online' : event.locationType === 'physical' ? 'in-person' : 'hybrid',
            description: event.description || event.shortDescription || '',
            tickets: [],
            faqs: [],
            visibility: 'public' as const,
          };
        });
        
        console.log('📅 [EventsTable] Transformed Events:', transformedEvents);
        setApiEvents(transformedEvents);
      } catch (err) {
        console.error('❌ [EventsTable] Failed to fetch events:', err);
        setError('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user?.id]);

  // Close filters when clicking outside
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

  // Reset pagination to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  // Delete event handler
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    setIsDeleting(true);
    try {
      await organizerService.deleteEvent(eventToDelete.id);
      console.log('🗑️ [EventsTable] Event deleted:', eventToDelete.id);
      
      // Remove from local state
      setApiEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      setShowDeleteSuccess(true);
      
      setTimeout(() => {
        setShowDeleteSuccess(false);
        setIsDeleteConfirmOpen(false);
        setEventToDelete(null);
        setIsEventDetailsOpen(false);
        setSelectedEvent(null);
      }, 2000);
    } catch (err) {
      console.error('❌ [EventsTable] Failed to delete event:', err);
      setError('Failed to delete event');
      setIsDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Use only API events - no mock data fallback
  const eventsToDisplay = apiEvents;

  // Filter events based on active filter and search query
  const filteredEvents = eventsToDisplay.filter(event => {
    const matchesFilter = 
      activeFilter === 'all' ? true :
      activeFilter === 'ongoing' ? event.status === 'ongoing' :
      activeFilter === 'upcoming' ? event.status === 'upcoming' :
      activeFilter === 'past' ? event.status === 'completed' :
      activeFilter === 'drafts' ? event.status === 'draft' :
      false;

    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

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

  // Calendar functions
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
      // Start new selection
      setSelectedStartDate(selected);
      setSelectedEndDate(null);
    } else {
      // Complete range selection
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

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Add cells for each day of the month
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
        {/* Calendar Header */}
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

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {/* Header with Create Event Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-black">Events</h1>
        
        {/* Create Event Button - Exact Figma styling */}
        <button
          onClick={onCreateEvent}
          className="relative flex items-center gap-2 pl-11 pr-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm sm:text-base rounded-full transition-all cursor-pointer whitespace-nowrap"
          style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
        >
          <img src={CreateEventIcon} alt="Create" className="absolute left-1 top-1/2 -translate-y-1/2 w-[26px] h-[26px] sm:w-[30px] sm:h-[30px]" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 sm:gap-6 border-b border-light-gray mb-6 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveFilter('all')}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeFilter === 'all' ? 'text-primary' : 'text-gray hover:text-black'
          }`}
        >
          All Events
          {activeFilter === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveFilter('ongoing')}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeFilter === 'ongoing' ? 'text-primary' : 'text-gray hover:text-black'
          }`}
        >
          Ongoing Events
          {activeFilter === 'ongoing' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeFilter === 'upcoming' ? 'text-primary' : 'text-gray hover:text-black'
          }`}
        >
          Upcoming Events
          {activeFilter === 'upcoming' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveFilter('past')}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeFilter === 'past' ? 'text-primary' : 'text-gray hover:text-black'
          }`}
        >
          Past Events
          {activeFilter === 'past' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveFilter('drafts')}
          className={`pb-3 text-xs sm:text-sm font-medium transition-colors relative whitespace-nowrap cursor-pointer ${
            activeFilter === 'drafts' ? 'text-primary' : 'text-gray hover:text-black'
          }`}
        >
          Drafts
          {activeFilter === 'drafts' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Event Count and Search/Filter Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <h2 className="text-sm sm:text-base font-semibold text-black">
          {filteredEvents.length} Events
        </h2>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search Events"
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

          {/* Sort Dropdown */}
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

          {/* All Date Filter */}
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

      {/* Events Table */}
      <div className="bg-white border border-light-gray rounded-xl overflow-hidden">
        {/* Table Header - Hidden on mobile */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 lg:px-6 py-4 bg-secondary-light border-b border-light-gray">
          <div className="col-span-4 text-xs lg:text-sm font-semibold text-gray">Event Name</div>
          <div className="col-span-2 text-xs lg:text-sm font-semibold text-gray">Date</div>
          <div className="col-span-3 text-xs lg:text-sm font-semibold text-gray">Location</div>
          <div className="col-span-2 text-xs lg:text-sm font-semibold text-gray">Status</div>
          <div className="col-span-1 text-xs lg:text-sm font-semibold text-gray text-right">Sold</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-light-gray">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray">Loading events...</p>
            </div>
          ) : currentEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-light-gray ">
          <div className="w-24 h-24 bg-secondary-light rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-input-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">No events found</h3>
          <p className="text-sm text-gray mb-4">
            {searchQuery ? 'Try adjusting your search or filters' : 'Create your first event to get started'}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateEvent}
              className="relative flex items-center gap-2 pl-9 pr-4 py-1.5 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all cursor-pointer whitespace-nowrap"
              style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
            >
              <img src={CreateEventIcon} alt="Create" className="absolute left-1 top-1/2 -translate-y-1/2 w-[22px] h-[22px]" />
              <span>Create Event</span>
            </button>
          )}
        </div>
          ) : (
          currentEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => {
                setSelectedEvent(event);
                setIsEventDetailsOpen(true);
              }}
              className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 px-4 lg:px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              {/* Event Name with Image */}
              <div className="md:col-span-4 flex items-center gap-3">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <span className="text-sm font-medium text-black">{event.name}</span>
              </div>

              {/* Mobile: Date, Location, Status, Sold in a row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:hidden pl-13 text-xs">
                <span className="text-gray">{event.date}</span>
                <span className="text-gray truncate max-w-[150px]">{event.location}</span>
                <div className="inline-flex items-center gap-1">
                  {event.status === 'ongoing' && (
                    <>
                      <img src={OngoingIcon} alt="Ongoing" className="w-3 h-3" />
                      <span className="font-medium text-[#3B82F6]">Ongoing</span>
                    </>
                  )}
                  {event.status === 'upcoming' && (
                    <>
                      <img src={UpcomingIcon} alt="Upcoming" className="w-3 h-3" />
                      <span className="font-medium text-[#F59E0B]">Upcoming</span>
                    </>
                  )}
                  {event.status === 'completed' && (
                    <>
                      <img src={CompletedIcon} alt="Completed" className="w-3 h-3" />
                      <span className="font-medium text-[#10B981]">Completed</span>
                    </>
                  )}
                </div>
                <span className="font-medium text-black">{event.sold}</span>
              </div>

              {/* Desktop: Date */}
              <div className="hidden md:flex md:col-span-2 items-center">
                <span className="text-xs lg:text-sm text-gray">{event.date}</span>
              </div>

              {/* Desktop: Location */}
              <div className="hidden md:flex md:col-span-3 items-center">
                <span className="text-xs lg:text-sm text-gray truncate">{event.location}</span>
              </div>

              {/* Desktop: Status */}
              <div className="hidden md:flex md:col-span-2 items-center justify-start">
                {event.status === 'ongoing' && (
                  <div className="inline-flex items-center gap-2">
                    <img src={OngoingIcon} alt="Ongoing" className="w-4 h-4" />
                    <span className="text-xs lg:text-sm font-medium text-[#3B82F6]">Ongoing</span>
                  </div>
                )}
                {event.status === 'upcoming' && (
                  <div className="inline-flex items-center gap-2">
                    <img src={UpcomingIcon} alt="Upcoming" className="w-4 h-4" />
                    <span className="text-xs lg:text-sm font-medium text-[#F59E0B]">Upcoming</span>
                  </div>
                )}
                {event.status === 'completed' && (
                  <div className="inline-flex items-center gap-2">
                    <img src={CompletedIcon} alt="Completed" className="w-4 h-4" />
                    <span className="text-xs lg:text-sm font-medium text-[#10B981]">Completed</span>
                  </div>
                )}
              </div>

              {/* Desktop: Sold */}
              <div className="hidden md:flex md:col-span-1 items-center justify-end">
                <span className="text-xs lg:text-sm font-medium text-black">{event.sold}</span>
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {filteredEvents.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <p className="text-xs sm:text-sm text-gray order-2 sm:order-1">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredEvents.length)} of {filteredEvents.length} Events
          </p>
          
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            {/* Previous Button */}
            <button 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-light-gray hover:bg-secondary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Page Numbers */}
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
            
            {/* Next Button */}
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

      

      {/* Event Details Popup */}
      {isEventDetailsOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            ref={popupRef}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header with Image Gallery */}
            <div className="relative h-64 sm:h-80">
              {selectedEvent.images.length > 0 ? (
                <img
                  src={selectedEvent.images[currentImageIndex]}
                  alt={selectedEvent.name}
                  className="w-full h-full object-cover rounded-t-2xl"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 rounded-t-2xl flex items-center justify-center">
                  <svg className="w-16 h-16 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsEventDetailsOpen(false);
                  setCurrentImageIndex(0);
                }}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Image Navigation - Previous */}
              {selectedEvent.images.length > 1 && currentImageIndex > 0 && (
                <button
                  onClick={() => setCurrentImageIndex(prev => prev - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {/* Image Navigation - Next */}
              {selectedEvent.images.length > 1 && currentImageIndex < selectedEvent.images.length - 1 && (
                <button
                  onClick={() => setCurrentImageIndex(prev => prev + 1)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-lg z-10"
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              {/* Image Counter */}
              {selectedEvent.images.length > 1 && (
                <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 text-white text-xs font-medium rounded-full">
                  {currentImageIndex + 1} / {selectedEvent.images.length}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="px-8 py-6 sm:px-10 sm:py-8">
              {/* Title, Status and Category */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-primary-light text-primary text-xs font-medium rounded-full">
                    {selectedEvent.category}
                  </span>
                  <span className="px-3 py-1 bg-secondary-light text-gray text-xs font-medium rounded-full capitalize">
                    {selectedEvent.eventType}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold text-black">{selectedEvent.name}</h2>
                  <div className="shrink-0">
                    {selectedEvent.status === 'ongoing' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                        <img src={OngoingIcon} alt="Ongoing" className="w-3.5 h-3.5 brightness-0 invert" />
                        Ongoing
                      </span>
                    )}
                    {selectedEvent.status === 'upcoming' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                        <img src={UpcomingIcon} alt="Upcoming" className="w-3.5 h-3.5 brightness-0 invert" />
                        Upcoming
                      </span>
                    )}
                    {selectedEvent.status === 'completed' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                        <img src={CompletedIcon} alt="Completed" className="w-3.5 h-3.5 brightness-0 invert" />
                        Completed
                      </span>
                    )}
                    {selectedEvent.status === 'draft' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-500 text-white text-xs font-medium rounded-full">
                        Draft
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-light-gray">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray">Date</p>
                    <p className="text-sm font-medium text-black">{selectedEvent.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray">Time</p>
                    <p className="text-sm font-medium text-black">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray">Location</p>
                    <p className="text-sm font-medium text-black">{selectedEvent.location}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6 pb-6 border-b border-light-gray">
                <h3 className="text-lg font-semibold text-black mb-3">About This Event</h3>
                <p className="text-sm text-gray leading-relaxed">{selectedEvent.description}</p>
              </div>

              {/* Address */}
              <div className="mb-6 pb-6 border-b border-light-gray">
                <h3 className="text-lg font-semibold text-black mb-3">Venue</h3>
                <p className="text-sm text-gray">{selectedEvent.mapAddress}</p>
                {selectedEvent.onlineLink && (
                  <div className="mt-2">
                    <p className="text-sm text-gray">Online Link:</p>
                    <a href={selectedEvent.onlineLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                      {selectedEvent.onlineLink}
                    </a>
                  </div>
                )}
              </div>

              {/* Tickets */}
              {selectedEvent.tickets.length > 0 && (
                <div className="mb-6 pb-6 border-b border-light-gray">
                  <h3 className="text-lg font-semibold text-black mb-3">Tickets</h3>
                  <div className="space-y-3">
                    {selectedEvent.tickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 bg-secondary-light rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-black">{ticket.type}</p>
                          <p className="text-xs text-gray">Quantity: {ticket.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-primary">
                            {ticket.priceType === 'free' ? 'Free' : `$${ticket.price}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQs */}
              {selectedEvent.faqs.length > 0 && (
                <div className="mb-6 pb-6 border-b border-light-gray">
                  <h3 className="text-lg font-semibold text-black mb-3">FAQ</h3>
                  <div className="space-y-4">
                    {selectedEvent.faqs.map((faq) => (
                      <div key={faq.id}>
                        <p className="text-sm font-medium text-black mb-1">{faq.question}</p>
                        <p className="text-sm text-gray">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sold Info - Modern Design */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-primary-light to-secondary-light rounded-xl p-6">
                  {(() => {
                    const soldParts = selectedEvent.sold.split('/');
                    const soldCount = parseInt(soldParts[0]) || 0;
                    const totalCapacity = parseInt(soldParts[1]) || 0;
                    const percentage = totalCapacity > 0 ? Math.round((soldCount / totalCapacity) * 100) : 0;
                    return (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-black">Tickets Sold</h3>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">{soldCount}</p>
                            <p className="text-sm text-gray">of {totalCapacity}</p>
                          </div>
                        </div>
                        <div className="relative h-2 bg-white rounded-full overflow-hidden">
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-[#FF6B35] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray mt-2">
                          {percentage}% capacity
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Action Buttons - Styled like Cancel button from Create Event */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setEventToDelete(selectedEvent);
                    setIsDeleteConfirmOpen(true);
                  }}
                  className="pl-5 pr-5 py-2 border border-red-500 text-red-500 rounded-full text-sm font-medium hover:bg-red-50 transition-all whitespace-nowrap"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setIsEventDetailsOpen(false);
                    if (onEditEvent) {
                      onEditEvent(selectedEvent);
                    }
                  }}
                  className="pl-5 pr-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap"
                >
                  Edit Event
                </button>
                <button
                  onClick={() => {
                    setIsEventDetailsOpen(false);
                    if (onDuplicateEvent) {
                      onDuplicateEvent(selectedEvent);
                    }
                  }}
                  className="pl-5 pr-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap"
                >
                  Duplicate Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && eventToDelete && (
        <div 
          className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4" 
          onClick={() => !showDeleteSuccess && !isDeleting && setIsDeleteConfirmOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {!showDeleteSuccess ? (
                <>
                  <h2 className="text-xl font-bold text-black mb-4">Delete Event</h2>
                  <p className="text-sm text-gray mb-6">
                    Are you sure you want to delete <span className="font-semibold text-black">"{eventToDelete.name}"</span>? This action cannot be undone.
                  </p>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsDeleteConfirmOpen(false);
                        setEventToDelete(null);
                      }}
                      disabled={isDeleting}
                      className="px-5 py-2 border border-gray-300 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteEvent}
                      disabled={isDeleting}
                      className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Event'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-black">Event deleted successfully</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsTable;
