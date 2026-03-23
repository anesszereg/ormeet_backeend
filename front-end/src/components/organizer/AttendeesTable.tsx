import { useState, useEffect, useRef } from 'react';
import organizerService, { Attendee as ApiAttendee, Event as ApiEvent } from '../../services/organizerService';
import { useAuth } from '../../context/AuthContext';
import SearchIcon from '../../assets/Svgs/recherche.svg';
import NewestIcon from '../../assets/Svgs/newest.svg';
import AllDateIcon from '../../assets/Svgs/organiser/dashboard/Events/allDate.svg';
import ExportIcon from '../../assets/Svgs/organiser/dashboard/Orders/export.svg';
import ExportModal from './ExportModal';
import AddAttendeeModal from './AddAttendeeModal';
import CreateEventIcon from '../../assets/Svgs/organiser/dashboard/Events/createEvent.svg';
import FilterIcon from '../../assets/Svgs/organiser/dashboard/Attendee/filter.svg';
import FilterOnClickIcon from '../../assets/Svgs/organiser/dashboard/Attendee/filterOnClick.svg';
import CheckedInIcon from '../../assets/Svgs/organiser/dashboard/Attendee/checkedIn.svg';
import NotCheckedInIcon from '../../assets/Svgs/organiser/dashboard/Attendee/notCheckedIn.svg';
import SuccessIcon from '../../assets/Svgs/success.svg';
import ErrorIcon from '../../assets/Svgs/error.svg';
import Event1 from '../../assets/imges/event myticket 1.jpg';
import Event2 from '../../assets/imges/event myticket 2.jpg';
import Event3 from '../../assets/imges/event myticket 3.jpg';
import Event4 from '../../assets/imges/event myticket 4.png';
import ProfilePhoto1 from '../../assets/imges/photoPorifle/Mask group.png';
import ProfilePhoto2 from '../../assets/imges/photoPorifle/Mask group (1).png';
import ProfilePhoto3 from '../../assets/imges/photoPorifle/Mask group (2).png';
import ProfilePhoto4 from '../../assets/imges/photoPorifle/Mask group (3).png';
import ProfilePhoto5 from '../../assets/imges/photoPorifle/Mask group (4).png';
import ProfilePhoto6 from '../../assets/imges/photoPorifle/Mask group (5).png';

interface Attendee {
  id: string;
  name: string;
  photo: string;
  email: string;
  eventName: string;
  registrationDate: string;
  ticketType: string;
  status: 'checked-in' | 'not-checked-in';
}

interface Event {
  id: string;
  name: string;
  image: string;
  status: 'ongoing' | 'upcoming' | 'completed' | 'draft';
  createdDate: string;
}

const AttendeesTable = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Newest First');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [attendeeToDelete, setAttendeeToDelete] = useState<Attendee | null>(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [showResendError, setShowResendError] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isAddAttendeeModalOpen, setIsAddAttendeeModalOpen] = useState(false);
  const attendeesPerPage = 9;

  // API Data States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiAttendees, setApiAttendees] = useState<Attendee[]>([]);
  const [apiEvents, setApiEvents] = useState<Event[]>([]);
  
  const sortRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Fetch attendees from API
  useEffect(() => {
    const fetchAttendees = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Use organizationId if available, otherwise fall back to user.id
        const organizerId = user.organizationId || user.id;
        console.log('👥 [AttendeesTable] Using organizerId:', organizerId);
        
        // Fetch events first
        const eventsData = await organizerService.getEvents({ organizerId });
        console.log('👥 [AttendeesTable] Fetched Events:', eventsData);
        const eventMap = new Map(eventsData.map((e: ApiEvent) => [e.id, e.title]));
        
        // Transform events for the event filter
        const transformedEvents: Event[] = eventsData.map((event: ApiEvent) => {
          let status: 'ongoing' | 'upcoming' | 'completed' | 'draft' = 'draft';
          const now = new Date();
          const startDate = new Date(event.startAt);
          const endDate = new Date(event.endAt);
          
          if (event.status === 'draft') status = 'draft';
          else if (now < startDate) status = 'upcoming';
          else if (now >= startDate && now <= endDate) status = 'ongoing';
          else status = 'completed';

          return {
            id: event.id,
            name: event.title,
            image: event.images?.[0] || Event1,
            status,
            createdDate: new Date(event.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          };
        });
        
        setApiEvents(transformedEvents);

        // Fetch attendees for each event
        const allAttendees: Attendee[] = [];
        
        for (const event of eventsData) {
          try {
            const attendeesData = await organizerService.getAttendeesByEvent(event.id);
            
            const transformedAttendees = attendeesData.map((attendee: ApiAttendee) => ({
              id: attendee.id,
              name: attendee.ticket?.owner?.name || 'Unknown',
              photo: attendee.ticket?.owner?.profilePhoto || ProfilePhoto1,
              email: attendee.ticket?.owner?.email || 'unknown@email.com',
              eventName: eventMap.get(event.id) || 'Unknown Event',
              registrationDate: new Date(attendee.checkedInAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              ticketType: attendee.ticket?.ticketType?.name || 'General',
              status: 'checked-in' as const,
            }));
            
            allAttendees.push(...transformedAttendees);
          } catch (err) {
            console.warn(`Failed to fetch attendees for event ${event.id}:`, err);
          }
        }
        
        console.log('👥 [AttendeesTable] All Attendees:', allAttendees);
        setApiAttendees(allAttendees);
      } catch (err) {
        console.error('❌ [AttendeesTable] Failed to fetch attendees:', err);
        setError('Failed to load attendees');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendees();
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check-in attendee handler
  const handleCheckIn = async (attendee: Attendee) => {
    setIsCheckingIn(true);
    try {
      // Find the event for this attendee
      const event = apiEvents.find(e => e.name === attendee.eventName);
      if (!event) {
        console.error('❌ [AttendeesTable] Event not found for attendee');
        return;
      }

      await organizerService.checkInAttendee({
        ticketId: attendee.id,
        eventId: event.id,
      });
      
      console.log('✅ [AttendeesTable] Attendee checked in:', attendee.id);
      
      // Update local state
      setApiAttendees(prev => prev.map(a => 
        a.id === attendee.id ? { ...a, status: 'checked-in' as const } : a
      ));
      
      // Update selected attendee if it's the same one
      if (selectedAttendee?.id === attendee.id) {
        setSelectedAttendee({ ...attendee, status: 'checked-in' });
      }
    } catch (err) {
      console.error('❌ [AttendeesTable] Failed to check in attendee:', err);
      setError('Failed to check in attendee');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Use only API data - no mock data fallback
  const attendeesToDisplay = apiAttendees;
  const eventsToDisplay = apiEvents;

  const filteredAttendees = attendeesToDisplay.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEvent = !selectedEvent || attendee.eventName === selectedEvent;

    if (selectedFilters.length === 0) {
      return matchesSearch && matchesEvent;
    }

    const ticketTypeFilters = selectedFilters.filter(f => ['VIP', 'General', 'Early Bird'].includes(f));
    const statusFilters = selectedFilters.filter(f => ['checked-in', 'not-checked-in'].includes(f));

    const matchesTicketType = ticketTypeFilters.length === 0 || ticketTypeFilters.includes(attendee.ticketType);
    const matchesStatus = statusFilters.length === 0 || statusFilters.includes(attendee.status);

    return matchesSearch && matchesTicketType && matchesStatus && matchesEvent;
  });

  const totalPages = Math.ceil(filteredAttendees.length / attendeesPerPage);
  const startIndex = (currentPage - 1) * attendeesPerPage;
  const endIndex = startIndex + attendeesPerPage;
  const currentAttendees = filteredAttendees.slice(startIndex, endIndex);

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

  const handleFilterToggle = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const handleExport = (selectedEvent: string) => {
    console.log('Exporting attendees for event:', selectedEvent);
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
        <h1 className="text-xl sm:text-2xl font-bold text-black">Attendees</h1>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="relative flex items-center gap-2 pl-11 pr-3 border border-light-gray bg-transparent hover:border-primary text-gray hover:text-black font-medium text-sm rounded-full transition-all cursor-pointer h-[38px] whitespace-nowrap"
          >
            <img src={ExportIcon} alt="Export" className="absolute left-1 top-1/2 -translate-y-1/2 w-[30px] h-[30px]" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setIsAddAttendeeModalOpen(true)}
            className="relative flex items-center gap-2 pl-11 pr-5 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all cursor-pointer h-[38px] whitespace-nowrap"
            style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
          >
            <img src={CreateEventIcon} alt="Add" className="absolute left-1 top-1/2 -translate-y-1/2 w-[30px] h-[30px]" />
            <span>Add Attendee</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
        <h2 className="text-sm sm:text-base font-semibold text-black">
          {filteredAttendees.length} Attendees
        </h2>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-[190px] lg:w-[220px] h-[38px] pl-4 pr-10 bg-white border border-light-gray text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all rounded-full"
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
                setIsFilterOpen(false);
              }}
              className="flex items-center gap-2 pl-11 pr-3 border border-light-gray bg-white cursor-pointer hover:border-primary transition-colors w-[140px] sm:w-[150px] lg:w-[160px] h-[38px] rounded-full"
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
                setIsFilterOpen(false);
              }}
              className="flex items-center gap-2 pl-11 pr-3 border border-light-gray bg-white cursor-pointer hover:border-primary transition-colors w-[145px] sm:w-[160px] lg:w-[175px] h-[38px] rounded-full"
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

          <div className="relative" ref={filterRef}>
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
                setIsDatePickerOpen(false);
              }}
              className="flex items-center gap-2 pl-11 pr-3 border border-light-gray bg-white cursor-pointer hover:border-primary transition-colors w-[100px] sm:w-[110px] lg:w-[120px] h-[38px] rounded-full"
            >
              <img 
                src={isFilterOpen ? FilterOnClickIcon : FilterIcon} 
                alt="Filter" 
                className="absolute left-1 top-1/2 -translate-y-1/2 w-[30px] h-[30px]" 
              />
              <span className="text-sm font-medium text-gray truncate flex-1">Filter</span>
              <svg className="w-4 h-4 text-gray shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-lg border border-light-gray z-50">
                <div className="p-4">
                  <div className="flex gap-8">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-black mb-3">Ticket Type</h3>
                      <div className="space-y-2">
                      {['VIP', 'General', 'Early Bird'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(type)}
                            onChange={() => handleFilterToggle(type)}
                            className="w-4 h-4 rounded-md border-gray-300 text-black focus:ring-black accent-black"
                            style={{ accentColor: selectedFilters.includes(type) ? '#000000' : undefined }}
                          />
                          <span className="text-sm text-black">{type}</span>
                        </label>
                      ))}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-black mb-3">Check-In Status</h3>
                      <div className="space-y-2">
                      {[
                        { value: 'checked-in', label: 'Checked-in' },
                        { value: 'not-checked-in', label: 'Not Checked-in' }
                      ].map((status) => (
                        <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedFilters.includes(status.value)}
                            onChange={() => handleFilterToggle(status.value)}
                            className="w-4 h-4 rounded-md border-gray-300 text-black focus:ring-black accent-black"
                            style={{ accentColor: selectedFilters.includes(status.value) ? '#000000' : undefined }}
                          />
                          <span className="text-sm text-black">{status.label}</span>
                        </label>
                      ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-light-gray">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray">Or by event</p>
                      <button
                        onClick={() => {
                          setIsEventModalOpen(true);
                          setIsFilterOpen(false);
                        }}
                        className="text-xs font-bold text-gray hover:text-primary transition-colors cursor-pointer"
                      >
                        See all
                      </button>
                    </div>
                    {selectedEvent && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-light rounded-full">
                        <span className="text-xs font-medium text-black">{selectedEvent}</span>
                        <button
                          onClick={() => setSelectedEvent(null)}
                          className="text-gray hover:text-black transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-light-gray">
                    <button
                      onClick={() => {
                        setSelectedFilters([]);
                        setSelectedEvent(null);
                      }}
                      className="text-sm text-gray hover:text-black transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="px-6 py-2 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Show {filteredAttendees.length} Attendees
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-light-gray rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 lg:px-6 py-4 bg-secondary-light border-b border-light-gray">
          <div className="col-span-3 text-xs lg:text-sm font-semibold text-gray">Attendee Name</div>
          <div className="col-span-3 text-xs lg:text-sm font-semibold text-gray">Email</div>
          <div className="col-span-2 text-xs lg:text-sm font-semibold text-gray">Event</div>
          <div className="col-span-2 text-xs lg:text-sm font-semibold text-gray">Ticket Type</div>
          <div className="col-span-2 text-xs lg:text-sm font-semibold text-gray">Status</div>
        </div>

        <div className="divide-y divide-light-gray">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray">Loading attendees...</p>
            </div>
          ) : currentAttendees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No attendees yet</h3>
              <p className="text-sm text-gray-500 text-center max-w-sm">
                Attendees will appear here when they check in to your events.
              </p>
            </div>
          ) : (
          currentAttendees.map((attendee) => (
            <div
              key={attendee.id}
              onClick={() => setSelectedAttendee(attendee)}
              className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 px-4 lg:px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="md:col-span-3 flex items-center gap-3">
                <img
                  src={attendee.photo}
                  alt={attendee.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0"
                />
                <span className="text-sm font-medium text-black">{attendee.name}</span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:hidden pl-13 text-xs">
                <span className="text-gray">{attendee.email}</span>
                <span className="text-gray">{attendee.eventName}</span>
                <span className="font-semibold text-black">{attendee.ticketType}</span>
                <div className="inline-flex items-center gap-1">
                  {attendee.status === 'checked-in' && (
                    <>
                      <img src={CheckedInIcon} alt="Checked-in" className="w-3 h-3" />
                      <span className="font-medium text-[#10B981]">Checked-in</span>
                    </>
                  )}
                  {attendee.status === 'not-checked-in' && (
                    <>
                      <img src={NotCheckedInIcon} alt="Not Checked-in" className="w-3 h-3" />
                      <span className="font-medium text-[#EF4444]">Not Checked-in</span>
                    </>
                  )}
                </div>
              </div>

              <div className="hidden md:flex md:col-span-3 items-center">
                <span className="text-xs lg:text-sm text-gray">{attendee.email}</span>
              </div>

              <div className="hidden md:flex md:col-span-2 items-center">
                <span className="text-xs lg:text-sm text-black">{attendee.eventName}</span>
              </div>

              <div className="hidden md:flex md:col-span-2 items-center">
                <span className="text-xs lg:text-sm font-semibold text-black">{attendee.ticketType}</span>
              </div>

              <div className="hidden md:flex md:col-span-2 items-center justify-start">
                {attendee.status === 'checked-in' && (
                  <div className="inline-flex items-center gap-2">
                    <img src={CheckedInIcon} alt="Checked-in" className="w-4 h-4" />
                    <span className="text-xs lg:text-sm font-medium text-[#10B981]">Checked-in</span>
                  </div>
                )}
                {attendee.status === 'not-checked-in' && (
                  <div className="inline-flex items-center gap-2">
                    <img src={NotCheckedInIcon} alt="Not Checked-in" className="w-4 h-4" />
                    <span className="text-xs lg:text-sm font-medium text-[#EF4444]">Not Checked-in</span>
                  </div>
                )}
              </div>
            </div>
          ))
          )}
        </div>
      </div>

      {filteredAttendees.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <p className="text-xs sm:text-sm text-gray order-2 sm:order-1">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredAttendees.length)} of {filteredAttendees.length} Attendees
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

      {/* Event Selection Modal */}
      {isEventModalOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
          onClick={() => setIsEventModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-light-gray">
              <h2 className="text-xl font-bold text-black">Select Event</h2>
              <button 
                onClick={() => setIsEventModalOpen(false)}
                className="text-gray hover:text-black transition-colors cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
              {eventsToDisplay.filter((event: Event) => event.status !== 'draft').map((event: Event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event.name);
                    setIsEventModalOpen(false);
                  }}
                  className={`w-full px-6 py-4 border-b border-light-gray hover:bg-gray-50 transition-colors cursor-pointer ${
                    selectedEvent === event.name ? 'bg-secondary-light' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    
                    <div className="flex-1 text-left">
                      <h3 className="text-sm font-semibold text-black mb-1">{event.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-gray">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${
                          event.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                          event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                          event.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                        <span>Created: {event.createdDate}</span>
                      </div>
                    </div>

                    {selectedEvent === event.name && (
                      <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Attendee Details Modal */}
      {selectedAttendee && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
          onClick={() => !showResendSuccess && !showResendError && setSelectedAttendee(null)}
        >
          <div 
            className={`bg-white rounded-xl shadow-2xl w-full overflow-hidden ${!showResendSuccess && !showResendError ? 'max-w-2xl' : 'max-w-md'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {!showResendSuccess && !showResendError ? (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-light-gray">
              <h2 className="text-xl font-bold text-black">Attendee Details</h2>
              <button 
                onClick={() => setSelectedAttendee(null)}
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
                {/* Profile Photo & Name */}
                <div className="shrink-0 flex flex-col items-center gap-3">
                  <img
                    src={selectedAttendee.photo}
                    alt={selectedAttendee.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-light-gray"
                  />
                  <p className="text-sm font-semibold text-black text-center">{selectedAttendee.name}</p>
                </div>

                {/* Attendee Information */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <p className="text-xs text-gray mb-1">Email</p>
                    <p className="text-sm text-black">{selectedAttendee.email}</p>
                  </div>

                  {/* Registration Date */}
                  <div>
                    <p className="text-xs text-gray mb-1">Registration Date</p>
                    <p className="text-sm text-black">{selectedAttendee.registrationDate}</p>
                  </div>

                  {/* Event Name */}
                  <div className="sm:col-span-2">
                    <p className="text-xs text-gray mb-1">Event</p>
                    <p className="text-sm font-medium text-black">{selectedAttendee.eventName}</p>
                  </div>

                  {/* Ticket Type */}
                  <div>
                    <p className="text-xs text-gray mb-1">Ticket Type</p>
                    <span className="inline-block px-3 py-1 bg-secondary-light text-sm font-medium text-black rounded-full">
                      {selectedAttendee.ticketType}
                    </span>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-gray mb-1">Status</p>
                    {selectedAttendee.status === 'checked-in' ? (
                      <div className="inline-flex items-center gap-2">
                        <img src={CheckedInIcon} alt="Checked-in" className="w-4 h-4" />
                        <span className="text-sm font-medium text-[#10B981]">Checked-in</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2">
                        <img src={NotCheckedInIcon} alt="Not Checked-in" className="w-4 h-4" />
                        <span className="text-sm font-medium text-[#EF4444]">Not Checked-in</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4">
                {selectedAttendee.status === 'not-checked-in' && (
                  <button
                    onClick={() => handleCheckIn(selectedAttendee)}
                    disabled={isCheckingIn}
                    className="pl-5 pr-5 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                  >
                    {isCheckingIn ? 'Checking in...' : 'Check In'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setAttendeeToDelete(selectedAttendee);
                    setIsDeleteConfirmOpen(true);
                  }}
                  className="pl-5 pr-5 py-2 border border-red-500 text-red-500 rounded-full text-sm font-medium hover:bg-red-50 transition-all whitespace-nowrap cursor-pointer"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowResendSuccess(true);
                    setTimeout(() => {
                      setShowResendSuccess(false);
                      setSelectedAttendee(null);
                    }, 3000);
                  }}
                  className="pl-5 pr-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  Resend Ticket
                </button>
              </div>
            </div>
              </>
            ) : showResendSuccess ? (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                  <p className="text-lg font-semibold text-black">Ticket resent successfully</p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <img src={ErrorIcon} alt="Error" className="w-16 h-16 mb-4" />
                  <p className="text-lg font-semibold text-black">Failed to resend ticket. Please try again</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && attendeeToDelete && (
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
                    Are you sure you want to delete <span className="font-semibold text-black">{attendeeToDelete.name}</span> ?
                  </p>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsDeleteConfirmOpen(false);
                        setAttendeeToDelete(null);
                      }}
                      className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        console.log('Deleting attendee:', attendeeToDelete.id);
                        setShowDeleteSuccess(true);
                        setTimeout(() => {
                          setShowDeleteSuccess(false);
                          setIsDeleteConfirmOpen(false);
                          setSelectedAttendee(null);
                          setAttendeeToDelete(null);
                        }, 3000);
                      }}
                      className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                      style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                    >
                      Confirm
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                  <p className="text-lg font-semibold text-black">Attendee successfully deleted</p>
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
        events={eventsToDisplay}
      />

      {/* Add Attendee Modal */}
      <AddAttendeeModal
        isOpen={isAddAttendeeModalOpen}
        onClose={() => setIsAddAttendeeModalOpen(false)}
        onConfirm={(data) => {
          console.log('Adding attendee:', data);
          setIsAddAttendeeModalOpen(false);
        }}
        events={mockEvents}
      />
    </div>
  );
};

export default AttendeesTable;
